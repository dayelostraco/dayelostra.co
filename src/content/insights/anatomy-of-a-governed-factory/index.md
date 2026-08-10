---
title: "Anatomy of a Governed AI Factory"
seoTitle: "Anatomy of a governed AI factory: reference architecture + eval methodology for federal agentic delivery"
date: 2026-08-18
summary: "The Colophon case study made the claim and the routing essay made the model calls; this is the architecture that makes a governed AI factory real and auditable, from the coordination plane to the eval loop."
tags: [ai, agents, architecture, governance, evals, federal]
readTime: "~9 min read"
draft: false
ogAccent: "Governed AI Factory"
bodyWatermark: "/FACTORY"
---

The [case study](/insights/compliance-is-a-byproduct/) made a claim: a governed AI factory can emit its authorization evidence as a byproduct of shipping, not reconstruct it in a scramble at the end. The routing essay explained how the model calls get made: boundary first, failure mode second, disagreement as the eval that counts. Both are true. Both are also the kind of claim a serious evaluator is right to distrust until they can see the machine underneath.

So this is the machine. Not the source, not the prompts, not the thresholds, but the shape of the system: how work coordinates, where it is contained, which gates it clears, and how the whole thing is measured. One sentence carries the whole design, the same one the case study closes on: humans decide, the bench ships. What follows is that sentence rendered as architecture.

The test I hold it to is simple. If I handed this description to an ISSO who had never seen the platform, could they trace how a change moves from an agent's first keystroke to a production system, and name the control at every step. If they can, the architecture is doing its job. If they cannot, the "governed" in governed factory is marketing.

## The coordination plane

A bench of sixty-plus specialist agents is not a factory. It is a crowd. What makes it a factory is Stationarius, the coordination plane that decides who does what, in what order, and who has to sign off.

Agents do not talk to each other in free text. They talk through Colloquy, a typed wire protocol. Every message is a structured, validated object with a known schema, an origin, and a place in the record. That single choice removes an entire class of failure: an agent cannot smuggle an instruction, an artifact, or a decision through an unlabeled channel, because there is no unlabeled channel. Everything that moves is typed, and everything typed can be checked.

Work escalates through three tiers. Peer agents resolve what they can among themselves. What peers cannot settle rises to arbiter agents, whose job is to adjudicate rather than to build. And what an arbiter should not decide alone, anything production-impacting, cross-cutting, or touching compliance, rises to the Change Control Board, whose seats are held by people. Escalation is the default path for uncertainty, not an exception you have to remember to invoke. The system is built to move a hard call up, not to let a confident agent resolve it quietly.

Underneath all of it sits Decretum, an append-only store of decisions and precedent. Every consequential call (who made it, on what, and why) lands there and stays. Decretum is not a log you can rewrite. It is the memory the factory reasons from, so that a decision made once becomes precedent the next agent has to reckon with.

<figure class="not-prose overflow-x-auto" role="img" aria-label="Coordination topology: specialist agents at the bottom escalate through the Colloquy protocol to arbiter agents in the middle and then to a human Change Control Board at the top, with every decision appended to the Decretum ledger on the right.">
<svg viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;min-width:460px;display:block;margin-inline:auto">
<title>Stationarius coordination topology</title>
<desc>Three stacked tiers. Specialist agents at the bottom escalate upward over the Colloquy protocol to arbiter agents in the middle, which escalate to the human Change Control Board at the top. An append-only Decretum ledger on the right records each tier's decisions.</desc>
<defs>
<marker id="d1-up" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#39d7ff"/></marker>
<marker id="d1-cc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>
</defs>
<!-- tiers -->
<rect x="30" y="24" width="290" height="78" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="175" y="58" text-anchor="middle" fill="currentColor" font-size="17" font-weight="600">Change Control Board</text>
<text x="175" y="80" text-anchor="middle" fill="currentColor" font-size="13" opacity="0.75">humans decide</text>
<rect x="30" y="176" width="290" height="78" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="175" y="210" text-anchor="middle" fill="currentColor" font-size="17" font-weight="600">Arbiter Agents</text>
<text x="175" y="232" text-anchor="middle" fill="currentColor" font-size="13" opacity="0.75">adjudicate conflicts</text>
<rect x="30" y="328" width="290" height="78" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="175" y="362" text-anchor="middle" fill="currentColor" font-size="17" font-weight="600">Specialist Agents</text>
<text x="175" y="384" text-anchor="middle" fill="currentColor" font-size="13" opacity="0.75">60+ scoped roles</text>
<!-- escalation arrows (accent) -->
<line x1="120" y1="326" x2="120" y2="258" stroke="#39d7ff" stroke-width="4" marker-end="url(#d1-up)"/>
<line x1="120" y1="174" x2="120" y2="106" stroke="#39d7ff" stroke-width="4" marker-end="url(#d1-up)"/>
<text x="138" y="298" fill="currentColor" font-size="12.5" font-style="italic">escalate</text>
<text x="138" y="146" fill="currentColor" font-size="12.5" font-style="italic">escalate</text>
<text x="230" y="298" fill="currentColor" font-size="12.5" opacity="0.8">Colloquy</text>
<text x="230" y="146" fill="currentColor" font-size="12.5" opacity="0.8">Colloquy</text>
<!-- decretum ledger -->
<rect x="392" y="24" width="216" height="382" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="500" y="52" text-anchor="middle" fill="currentColor" font-size="16" font-weight="600">Decretum</text>
<text x="500" y="72" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.75">append-only ledger</text>
<g stroke="currentColor" stroke-width="1" opacity="0.45">
<line x1="410" y1="98" x2="590" y2="98"/><line x1="410" y1="122" x2="590" y2="122"/>
<line x1="410" y1="146" x2="590" y2="146"/><line x1="410" y1="170" x2="590" y2="170"/>
<line x1="410" y1="194" x2="590" y2="194"/><line x1="410" y1="218" x2="590" y2="218"/>
<line x1="410" y1="242" x2="590" y2="242"/><line x1="410" y1="266" x2="590" y2="266"/>
<line x1="410" y1="290" x2="590" y2="290"/><line x1="410" y1="314" x2="590" y2="314"/>
<line x1="410" y1="338" x2="590" y2="338"/><line x1="410" y1="362" x2="590" y2="362"/>
</g>
<!-- append arrows -->
<line x1="320" y1="63" x2="390" y2="90" stroke="currentColor" stroke-width="1.75" marker-end="url(#d1-cc)"/>
<text x="352" y="52" text-anchor="middle" fill="currentColor" font-size="12">append</text>
<line x1="320" y1="215" x2="390" y2="200" stroke="currentColor" stroke-width="1.25" stroke-dasharray="3 3" opacity="0.6" marker-end="url(#d1-cc)"/>
<line x1="320" y1="367" x2="390" y2="310" stroke="currentColor" stroke-width="1.25" stroke-dasharray="3 3" opacity="0.6" marker-end="url(#d1-cc)"/>
</svg>
<figcaption style="font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.03em;color:var(--color-text-dim);margin-top:0.85rem">Diagram 1: the coordination plane. Work escalates specialist to arbiter to human board over Colloquy; Decretum records every decision.</figcaption>
</figure>

## State, isolation, and the rule an agent cannot break

We do not turn an agent loose as a general intelligence roaming the codebase. We scope it to least privilege by default: it sees the inputs its task requires and no more, it runs in an isolated context, and its capabilities are granted for the job in front of it rather than held ambiently. This is the same discipline we apply to human operators in an accredited environment, expressed for non-human actors.

We isolate more than what an agent can see. We isolate what it can do. An agent operates inside a sandbox that is torn down when its task ends, so state does not leak from one unit of work into the next, and one agent's mistake does not silently become another's starting assumption. Two agents working the same area do not share a mutable scratch space they can each corrupt. They coordinate through Colloquy and settle differences through escalation, which is the whole reason the coordination plane exists. Shared state is a channel, and every channel in this system is typed and recorded.

We enforce the boundary rule from the routing essay here as structure, not policy. CUI-bearing inputs never cross into a commercial endpoint, and we hold that line with static analysis and network egress control, not with an agent's good judgment. An agent cannot choose to route sensitive data outward, because the path is not reachable from where it runs. Sovereignty is a property of the topology, not a checkbox the agent is trusted to honor.

The rule that ties isolation to governance is the one that matters most: an agent cannot reach around a gate. There is no side door where a change reaches production without passing review, because merge and deploy are not capabilities an agent holds. The only path forward is through the gate chain, and the gate chain answers to people. An agent that wanted to skip review would find nothing to skip to.

## The gate chain

Every increment an agent authors enters the same chain, and we build that chain to be adversarial. Five review lenses look at it, each with a different question. Code review asks whether it is correct and maintainable. An adversarial reviewer tries to break it. Test-quality review asks whether the tests would actually catch a regression. Static application security testing hunts the vulnerability. Continuous-integration parity confirms it behaves the same in the pipeline as it did in development. Anything user-facing adds an accessibility lens. A change that cannot survive its own reviewers does not advance.

When a change is production-impacting, cross-cutting, or touches the compliance domain, it does not merge on the strength of clean reviews alone. It goes to the human Change Control Board. The board is where the judgment agents are not entitled to make gets made: what ships, at what risk, and who accepts it. The reviews inform that decision. They do not replace it.

The part that makes this a governed factory rather than merely a fast one is what falls out of the chain as it runs. The Risk Management Framework artifacts (the system security plan, the POA&M, the STIG checklist, the evidence bundle) are emitted as a byproduct of the same gated process that produces the code. Nobody reconstructs them later. The gate that approves a change is the same event that records why it was safe to approve, and that record is the evidence. This is the inversion the case study described, seen from the inside.

<figure class="not-prose overflow-x-auto" role="img" aria-label="Change lifecycle: an agent-authored increment passes a five-lens review then a human Change Control Board gate before it ships; a failed gate returns the increment for rollback, while RMF artifacts are emitted as a byproduct into an evidence corpus.">
<svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;min-width:600px;display:block;margin-inline:auto">
<title>Change lifecycle and gate chain</title>
<desc>Left to right: an agent-authored increment enters a five-lens review (code, adversarial, test-quality, SAST, CI-parity, accessibility), then a human Change Control Board gate, then ships to production. A dashed branch returns a failed change for rollback. Below, the review emits RMF artifacts (system security plan, POA&M, STIG checklist) as a byproduct that flows into an evidence corpus.</desc>
<defs>
<marker id="d2-hp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#39d7ff"/></marker>
<marker id="d2-cc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>
</defs>
<!-- increment -->
<rect x="16" y="52" width="140" height="76" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="86" y="86" text-anchor="middle" fill="currentColor" font-size="16" font-weight="600">Increment</text>
<text x="86" y="108" text-anchor="middle" fill="currentColor" font-size="12.5" opacity="0.75">agent-authored</text>
<!-- five-lens block -->
<rect x="196" y="24" width="190" height="256" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="291" y="48" text-anchor="middle" fill="currentColor" font-size="15" font-weight="600">Five-lens review</text>
<line x1="196" y1="60" x2="386" y2="60" stroke="currentColor" stroke-width="1" opacity="0.4"/>
<g fill="currentColor" font-size="13.5" text-anchor="middle">
<text x="291" y="88">Code review</text>
<text x="291" y="120">Adversarial</text>
<text x="291" y="152">Test-quality</text>
<text x="291" y="184">SAST</text>
<text x="291" y="216">CI-parity</text>
<text x="291" y="248">Accessibility</text>
</g>
<!-- CCB diamond -->
<polygon points="502,60 566,116 502,172 438,116" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="502" y="112" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Human</text>
<text x="502" y="130" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">CCB</text>
<!-- ship -->
<rect x="628" y="78" width="116" height="76" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="686" y="112" text-anchor="middle" fill="currentColor" font-size="16" font-weight="600">Ship</text>
<text x="686" y="134" text-anchor="middle" fill="currentColor" font-size="12.5" opacity="0.75">to production</text>
<!-- happy path (accent) -->
<line x1="156" y1="90" x2="194" y2="104" stroke="#39d7ff" stroke-width="4" marker-end="url(#d2-hp)"/>
<line x1="386" y1="116" x2="436" y2="116" stroke="#39d7ff" stroke-width="4" marker-end="url(#d2-hp)"/>
<line x1="566" y1="116" x2="626" y2="116" stroke="#39d7ff" stroke-width="4" marker-end="url(#d2-hp)"/>
<text x="596" y="106" text-anchor="middle" fill="currentColor" font-size="12">pass</text>
<!-- rollback (muted dashed) -->
<polyline points="502,172 502,300 86,300 86,130" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5" opacity="0.55" marker-end="url(#d2-cc)"/>
<text x="300" y="292" text-anchor="middle" fill="currentColor" font-size="12.5" opacity="0.7">fail: rollback to known-good</text>
<!-- evidence lane -->
<line x1="291" y1="280" x2="291" y2="352" stroke="currentColor" stroke-width="1.75" marker-end="url(#d2-cc)"/>
<text x="352" y="336" fill="currentColor" font-size="12">emitted as byproduct</text>
<rect x="196" y="356" width="70" height="46" rx="5" fill="none" stroke="currentColor" stroke-width="1.25"/>
<text x="231" y="384" text-anchor="middle" fill="currentColor" font-size="12.5">SSP</text>
<rect x="278" y="356" width="70" height="46" rx="5" fill="none" stroke="currentColor" stroke-width="1.25"/>
<text x="313" y="384" text-anchor="middle" fill="currentColor" font-size="12.5">POA&amp;M</text>
<rect x="360" y="356" width="70" height="46" rx="5" fill="none" stroke="currentColor" stroke-width="1.25"/>
<text x="395" y="384" text-anchor="middle" fill="currentColor" font-size="12.5">STIG</text>
<line x1="430" y1="379" x2="592" y2="379" stroke="currentColor" stroke-width="1.75" marker-end="url(#d2-cc)"/>
<line x1="686" y1="154" x2="686" y2="352" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6" marker-end="url(#d2-cc)"/>
<rect x="596" y="352" width="150" height="58" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="671" y="378" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Evidence</text>
<text x="671" y="396" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">corpus</text>
</svg>
<figcaption style="font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.03em;color:var(--color-text-dim);margin-top:0.85rem">Diagram 2: the change lifecycle. Increment to five-lens review to human board to ship, a failed gate rolls back, and the RMF artifacts fall out as evidence.</figcaption>
</figure>

## Provenance, rollback, and failure containment

We judge a governed system less by how it behaves when everything works than by what happens when something does not. So here is the failure story.

Provenance is total because Decretum is append-only. Every change carries an unbroken chain from the decision that authorized it to the artifact that shipped, and that chain is queryable after the fact. When someone asks why a thing is the way it is, the answer is a record, not a reconstruction.

Rollback is a first-class path, not a fire drill. A failed gate does not strand a half-merged change. It returns the increment to its prior known-good state, and the failure itself becomes a Decretum entry: what was attempted, which lens caught it, and why it was refused. A rejected change teaches the system something, and the lesson is durable.

Blast radius is contained by the same isolation that scopes an agent's work. Because changes move in small, gated increments rather than large speculative merges, the surface a single bad change can touch is bounded before it is ever proposed. And because every action is attributable to a specific actor and decision, an incident review starts from a record of who did what and when, not from an archaeology dig. Observability here is not a dashboard bolted on at the end. It is a property of a system where nothing moves untyped and nothing decides unrecorded.

## The eval loop

The [routing table the other essay described](/insights/i-have-a-routing-table/) is not a static opinion. It is the output of a harness that runs continuously, and the harness is where "which model" stops being a debate and becomes a measurement.

A candidate change is routed to more than one model, chosen by the failure mode the task most needs guarded. Their outputs are compared, and the first signal the harness reads is disagreement. When models with different jobs converge, that is weak evidence, because agreement is cheap and a shared blind spot looks exactly like consensus. When they diverge, that is where a human or an arbiter looks, because a disagreement is a claim that something is wrong, raised by an actor with no stake in the original work. Agreement does not buy a change a pass. It still enters the gate.

Behind the disagreement signal is measurement against a baseline. Every model and every routing choice is scored against task suites that stand in for the work we actually do, and against the delivery gates themselves, which are the only benchmark that counts in this domain: did the output survive adversarial review, clear the security scans, and hold accreditation. We watch latency and cost alongside correctness, because a model that is marginally better and materially slower or more expensive is not obviously better at all. And we watch for regression and drift over time, because a model's behavior is not fixed, and a routing choice that was right last quarter can quietly stop being right.

A model earns a new seat, or loses one, on that evidence. Switching is a versioned change to the routing table, reviewed like any other change, not a leap of faith taken because something new is in the headlines. The table is an artifact with a history, and every entry in it can be traced to the measurement that put it there.

The loop also protects against a subtler failure than a bad model: a good model quietly rotting in place. A routing choice that goes unmeasured becomes a habit, and a habit is how you end up trusting a model on a task it stopped being good at three releases ago. Running the eval continuously, against suites that mirror real work rather than public benchmarks, means the table is never older than the last increment that passed through it. The measurement is not a launch gate you clear once. It is the standing condition for every model keeping its seat.

<figure class="not-prose overflow-x-auto" role="img" aria-label="Eval loop: a candidate change is routed to multiple models by failure mode, their outputs are compared, and a disagreement check decides whether to escalate to a human or arbiter; agreement is still gated, then measured against a baseline suite and a drift monitor before a versioned routing-table update loops back.">
<svg viewBox="0 0 700 470" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;min-width:560px;display:block;margin-inline:auto">
<title>Continuous evaluation loop</title>
<desc>A cycle. A candidate change is routed to N models by failure mode, their outputs are compared, and a disagreement decision either escalates to a human or arbiter, or, on agreement, is still gated and measured against a baseline task suite and a regression and drift monitor, producing a versioned routing-table update that loops back to the next candidate change.</desc>
<defs>
<marker id="d3-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#39d7ff"/></marker>
<marker id="d3-cc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker>
</defs>
<!-- top row -->
<rect x="30" y="30" width="164" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="112" y="66" text-anchor="middle" fill="currentColor" font-size="14.5" font-weight="600">Candidate change</text>
<rect x="264" y="30" width="180" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="354" y="58" text-anchor="middle" fill="currentColor" font-size="14.5" font-weight="600">Routed to N models</text>
<text x="354" y="78" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.75">by failure mode</text>
<rect x="514" y="30" width="160" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="594" y="66" text-anchor="middle" fill="currentColor" font-size="14.5" font-weight="600">Outputs compared</text>
<!-- diamond -->
<polygon points="594,132 674,196 594,260 514,196" fill="none" stroke="#39d7ff" stroke-width="2.5"/>
<text x="594" y="192" text-anchor="middle" fill="currentColor" font-size="14.5" font-weight="600">Disagree?</text>
<!-- middle row: measured, drift -->
<rect x="300" y="166" width="190" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="395" y="192" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Measured vs</text>
<text x="395" y="210" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">baseline suite</text>
<rect x="30" y="166" width="188" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="124" y="192" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Regression /</text>
<text x="124" y="210" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">drift monitor</text>
<!-- routing update -->
<rect x="30" y="304" width="200" height="64" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="130" y="330" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Routing table</text>
<text x="130" y="350" text-anchor="middle" fill="currentColor" font-size="12.5" opacity="0.8">vN to vN+1</text>
<!-- escalate -->
<rect x="474" y="360" width="200" height="62" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="574" y="386" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">Escalate to</text>
<text x="574" y="404" text-anchor="middle" fill="currentColor" font-size="14" font-weight="600">human / arbiter</text>
<!-- arrows -->
<line x1="194" y1="61" x2="262" y2="61" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<line x1="444" y1="61" x2="512" y2="61" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<line x1="594" y1="92" x2="594" y2="130" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<!-- yes -> escalate (accent) -->
<polyline points="594,260 594,310 574,360" fill="none" stroke="#39d7ff" stroke-width="3.5" marker-end="url(#d3-ac)"/>
<text x="606" y="300" fill="currentColor" font-size="13" font-weight="600">yes</text>
<!-- no -> measured (accent) -->
<line x1="514" y1="196" x2="492" y2="196" stroke="#39d7ff" stroke-width="3.5" marker-end="url(#d3-ac)"/>
<text x="500" y="150" text-anchor="middle" fill="currentColor" font-size="13">no, still gated</text>
<!-- measured -> drift -->
<line x1="300" y1="197" x2="220" y2="197" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<!-- drift -> routing -->
<line x1="124" y1="228" x2="124" y2="302" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<!-- routing -> candidate (loop hugs left margin) -->
<polyline points="30,336 12,336 12,61 28,61" fill="none" stroke="currentColor" stroke-width="1.75" marker-end="url(#d3-cc)"/>
<text x="20" y="200" fill="currentColor" font-size="12" opacity="0.75" transform="rotate(-90 20 200)">loop</text>
</svg>
<figcaption style="font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.03em;color:var(--color-text-dim);margin-top:0.85rem">Diagram 3: the eval loop. Multi-model routing, disagreement as the decision, then baseline and drift measurement feeding a versioned routing-table update.</figcaption>
</figure>

## Humans decide, the bench ships

Read the three diagrams together and the argument is one shape. Coordination that is typed and recorded. Isolation an agent cannot escape. Gates that answer to people. An eval loop that trusts disagreement over confidence. None of it depends on which model is behind the curtain this month. That is the point. The model is the commodity, and the architecture is the thing that carries the guarantees.

This is why I can say the same sentence at the start and the end and mean it as engineering, not slogan. Humans decide, the bench ships. The deciding is real: it lives in the Change Control Board, in the gates agents cannot reach around, in the routing changes reviewed before they take effect. The shipping is real too, and it is fast, because the parts that were never judgment have been handed to the machine and the parts that were always judgment have been kept by people. Hand this to an ISSO and every step has a name. That is what governed means.
