---
title: "The CLI Is the New API. Govern It Like One."
seoTitle: "The CLI Is the New API: Governing AI Agent Command-Line Access"
date: 2026-06-23
summary: "For an agent, the command line is a first-class invocation surface. It now needs what every API already has: a stable contract, structured output, authorization per call, and audit. Here is the gap I keep finding, and how to close it."
tags: [ai, agents, cli, api, governance, federal]
readTime: "6 min read"
draft: false
ogAccent: "Govern It Like One."
bodyWatermark: "/GOVERN"
---

For three decades the command line was safe, and the reason was never the command line. It was the person holding it. An authenticated human, moving at human speed, reading each result and applying judgment before doing anything irreversible. The operator was the CLI's real contract and its real control. The safety lived in the person, not the interface.

That arrangement is over. The keyboard now belongs to an agent that runs at machine speed, does not pause, and does not read output the way a person does. Every guarantee the CLI quietly borrowed from the human in the chair has to become explicit, because the human is no longer in the chair.

Which is the whole point. To an agent, the command line is not a console. It is an interface it calls, the same way software calls an API. So the honest move is to stop treating the CLI as a human convenience and start treating it as what it has become: an invocation surface. The CLI is the new API. Govern it like one.

## What the human silently provided

Before you can govern the surface, take inventory of what just walked out of the room with the operator.

**Interpretation.** A person reads "done, with 3 warnings" and knows what it means. An agent scrapes that line and guesses.

**Restraint.** A person does not run ten thousand commands an hour. An agent will, cheerfully, if a loop tells it to.

**Judgment.** A person hesitates before a destructive command. An agent has no hesitation that was not written down somewhere first.

**Identity and accountability.** The command used to run under a named human who was answerable for it. An agent's session, left alone, attributes to no one.

**Drift tolerance.** A person adapts when a flag is renamed or an output format shifts. An agent breaks on the change, or worse, misreads it and keeps going.

Every one of those is something a mature API makes explicit and a CLI left implicit, because it could count on the operator to supply it. Remove the operator and the gap is the whole story.

## The contract an API has, a CLI lacks

An API is a contract. A command line, for most tools, is a habit. I keep finding the same missing clauses.

**Stable interface.** An API versions its contract, and consumers opt into change on their own schedule. CLIs rename flags and reshape output between releases, silently, with no version a caller can pin. An agent built against last quarter's output breaks against this quarter's, or is quietly exploited by the difference. The break is rarely dramatic. A flag gets renamed and now defaults to something broader. A column gets reordered and the agent's scrape reads the wrong field as the status. The tool did nothing wrong. It changed the way tools always have. The only consumer who used to absorb that change without noticing was the human.

**Structured output.** An API returns typed data. A CLI returns text arranged for human eyes, and scraping that text is both brittle and injectable. The fix is not cleverer parsing. It is asking the tool for a contract.

```text
# Illustrative. The same command, two contracts.

# Human-formatted output. The agent has to scrape and guess:
$ deploy --status
Deploying app... done (3 warnings, 0 errors)

# Structured output. A contract the agent can parse:
$ deploy --status --format=json
{ "state": "complete", "warnings": 3, "errors": 0, "id": "dpl_8842" }
```

Structured output also closes a quieter hole. Scraped text routinely contains content the agent did not author: a filename, a log line, an error bubbled up from three layers down. Treated as text to interpret, that content can carry instructions, and an agent that acts on what it reads can be steered by whatever happens to land in its output. A typed field is data. A line of prose is an attack surface.

**Typed errors and exit semantics.** An API reports failure in a structured, documented way. CLI exit codes and stderr are inconsistent from one tool to the next, so an agent often cannot tell success from failure without guessing. An agent needs a deterministic signal, not a vibe. The failure that hurts is the silent one: a tool that exits zero on partial failure, or writes the real error to a stream the agent never checks. The agent records success and builds the next step on a foundation that is not there.

**Authorization per invocation.** An API authorizes each call against a scope. The CLI historically inherits the operator's ambient shell privilege, which is to say everything the human could do. I made the identity-plane version of this argument in [Agents Are Just Identities](/insights/boundary-doesnt-move/): every action a discrete, named operation with a discrete, named scope. The command line is that same surface one layer down, and it inherits the same rule. A deny-by-default allow-list of permitted commands, [the subject of its own essay](/insights/least-privilege-is-a-list/), is how the rule lands at the OS layer. This is AC-3 (access enforcement) and AC-6 (least privilege), applied to a surface that usually enforces neither.

**Audit as a first-class output.** An API emits structured, identity-attributed events. CLI history is scattered shell logs nobody reconstructs at agent velocity. At human speed an auditor could piece together what happened from shell history and memory. At agent velocity there is too much, too fast, and no narrator in the chair. The audit has to be generated as it happens, not reconstructed afterward. Every invocation should arrive as one attributable event, AU-2 (event logging) and AU-10 (non-repudiation), carried on OpenTelemetry the same way the program's API calls already are.

## Closing the gap

None of this requires new theory. It requires giving the command surface the rigor the API surface already gets.

Turn on structured output everywhere it exists, and treat its absence as a defect to fix rather than a quirk to scrape around. Treat the set of commands an agent may run as a versioned contract: pin it, test against it, change it on purpose instead of by surprise. Put a broker in front of invocation that authorizes each call against a scope, attributes it to an identity, and emits the audit event. That broker is the enforcement point that gives the CLI an API's guarantees.

And when you evaluate a tool for agent use, structured output and a stable contract stop being conveniences. They are acceptance criteria. A tool that only speaks human is a tool your agent has to guess at, and guessing is the failure mode you are trying to design out.

This is also where the industry is already converging. Wrapping a tool with a schema and structured output, the pattern behind MCP, is precisely the act of giving a command surface API properties: a declared interface, typed inputs and outputs, and a place to enforce and observe. The protocols are arriving. The governance posture has to arrive with them.

## Govern it like one

For an authorizing official or an ISSO, the two questions that already govern the API surface now govern the command surface. What is this agent allowed to invoke, and can you prove what it invoked. If the answer to either is a shrug, there is an ungoverned interface running inside an accredited boundary.

And it is inside the boundary, whether or not anyone modeled it as an interface. The assumption to retire is that the command line is a trusted human tool. It was, right up until the human stopped being the one using it. The controls do not change. AC-3 and AC-6 scope the invocation, AU-2 and AU-10 make it accountable, and the surface that used to lean on a person now stands on its own.

That is the through line across this series. At the API plane and at the command plane, the discipline is identical, because to an agent they are the same kind of thing.

> An API is a contract. A CLI is a habit. An agent will hold you to the contract you never wrote.
