---
title: "The Agent Can't Run That Command. That's Least Privilege."
seoTitle: "The Agent Can't Run That Command: Least Privilege Command Allow-Lists for AI Agents"
date: 2026-07-07
summary: "Least privilege at the OS layer is not a posture. It is a list. A deny-by-default command allow-list that scopes what an agent may run, the layers that enforce it, and the escalation paths it forecloses."
tags: [ai, agents, cyber, least-privilege, nist, federal]
readTime: "6 min read"
draft: false
ogAccent: "That's Least Privilege."
bodyWatermark: "/LEASTPRIV"
---

You have heard this one. An AI agent, working in a production environment, deletes the database. The prompt told it not to. In plain language, with emphasis, the instruction was right there: do not touch production, do not drop anything. It dropped the database anyway.

Maybe it happened exactly as told. Maybe the story grew in the retelling. I do not care, and neither should you, because the story survives on the strength of a real failure mode. The failure was structural, not behavioral. Someone wrote "do not delete the database" into a prompt and treated that sentence as a control. It was never a control.

In [Agents Are Just Identities](/insights/boundary-doesnt-move/) I argued that agents are not a new actor class and that the boundary already knows how to hold them. Buried in that essay, in about thirty words, was the claim that the same discipline holds at the OS layer: a policy that names which commands an agent may run forecloses both destructive operations and privilege escalation. This essay is that sentence, expanded.

At the OS layer, least privilege is not a posture. It is a list.

## The list, in practice

The discipline is deny-by-default, allow-by-name. The agent gets the commands you put on a list, with the arguments you scope, and nothing else. Everything absent from the list is denied, not as an exception but as the resting state.

The commands are discrete and named. There is no wildcard that means "anything in this family," because that wildcard is where the destructive command hides. "Restart the service" is a permission. "Manage the service," which quietly includes stop and delete, is a liability. Where a glob is unavoidable, scope it to a path the agent owns, never to a verb.

The match is on the command and its exact arguments, executed as a fixed list and never as a line of text handed to a shell to interpret. That detail is load-bearing. If the check only looks at the start of a text command, `systemctl status` and `systemctl status; rm -rf /` look the same, and the allow-list has allowed everything. With no shell in the path, the punctuation that chains or rewrites commands is just inert characters. Arguments are checked against the scope, and file paths are resolved before the check, so a permission to read logs under `/var/log/app` cannot be bent into reading `/var/log/app/../../../etc/shadow`, the file that stores the system's password hashes. An argument that can change what actually runs is not a narrower permission. It is a denial.

What follows is illustrative only, not a product syntax. The shape is what matters.

```yaml
# Illustrative only, not a product syntax.
shell: false                        # exec by argv, never an interpreted line
allow:
  - cmd: systemctl
    args: ["status", "<service>"]    # fixed verb; service from an allowed set
  - cmd: cat
    args: ["/var/log/app/*.log"]     # canonicalized, must resolve under /var/log/app
deny: "*"                            # deny-by-default
on_deny:
  log: true
  alert: soc
```

The list is what makes least privilege a control instead of a hope. It is declarative, so you can read it. It is enumerable, so you can count what the agent can do. It is reviewable, so someone other than its author can sign off on it. None of that is true of an instruction buried in a prompt. The only question left is where the list is enforced, because a list the agent can ignore is just a longer prompt.

## Three places to say no. Two of them count.

There are three places "do not run that command" can live, and they are not equal.

The first is the prompt. A prompt instruction is advisory input to a probabilistic system. It can be ignored, reinterpreted, drowned out by competing context, or talked around by a clever input. It belongs in the system, because it steers behavior and sets intent, and intent is worth setting. But it carries zero assurance. You write it to make good behavior likely, never to make bad behavior impossible. The deleted database is the whole genre: an instruction asked to do a control's job.

The second is the allow-list. This is where "do not run that command" becomes a decision rather than a request. A declarative, deny-by-default policy is the authorization layer, and it implements controls the program already runs: AC-3 (access enforcement) and AC-6 (least privilege). It is auditable and version-controlled. But a policy is paper until something below the agent enforces it.

The third is the OS and implementation layer, and this is the one that makes the other two real. The enforcement point has to sit beneath the agent and satisfy the reference-monitor properties: always invoked, tamperproof, and small enough to verify. In practice that is an execution broker, a constrained sandbox, a privileged-command proxy, or OS-level mandatory access control. The agent asks; the broker checks the list; the denied command does not run, regardless of what the model decided it wanted. If the allow-list lives only as text inside the agent's own context, it has exactly the assurance of the prompt, which is to say none.

So: all three layers, in strict order. The prompt expresses intent. The allow-list expresses authorization. The enforcement point guarantees it. Only the bottom two are controls.

## What it forecloses

Once the list is enforced, look at what stops being possible.

Lateral movement loses its tooling. An agent that cannot run arbitrary commands cannot quietly reuse valid accounts and stolen credentials to pivot between systems. That credential reuse is what MITRE ATT&CK calls Valid Accounts (T1078), and the commands that enumerate and assume other identities are simply not on its list.

Privilege escalation loses its rungs. The tactic MITRE ATT&CK calls Privilege Escalation (TA0004) depends on running the things that climb: changing permissions, editing trust relationships, swapping a binary on a privileged path. None of those are named in the allow-list, so the climb has no first step.

Destructive operations lose their reach. The deleted-database category is foreclosed for the dullest possible reason. The command that drops the database is not on the list, so the enforcement point never lets it execute. There is no judgment call at runtime, because the judgment was made when the list was written.

## Mapped to the catalog

None of this is a new control story, and nobody should sell it to you as one. The allow-list implements families already in the program's baseline.

AC-3, access enforcement, is the allow-list itself: the enforcement point is the access decision, made on every command. AC-6, least privilege, is the deny-by-default posture: named commands only, nothing implicit, nothing inherited. SC-7, boundary protection, is the enforcement point's position: the agent operates behind a boundary it cannot route around, and the boundary is where the command is allowed or denied.

An assessor already knows these controls. The work is not inventing a control family for agents. The work is presenting the allow-list as the implementation of families that are already accredited.

## Author, own, version

The list is written like code, because it is code. It lives in a repository. It is reviewed before it merges. It is diffable, so every change to what an agent may run is a change someone can see and question.

Ownership is shared and explicit. Engineering authors the commands the agent needs to do its job, because engineering knows the job. Security owns the deny posture and holds the review gate, because security owns the blast radius. Neither side edits the list alone. A change to the allow-list moves through change management as a Change Request, not as a quiet commit on a Friday.

And the list narrows as the agent's responsibility narrows. When a task ends, the commands that served it come off. Least privilege is not a setting you reach once. It is a list you keep shortening.

## How it survives an audit

Build the allow-list for the assessment, not the night before it.

Continuous monitoring hooks watch the policy and its denials in real time, so the evidence accrues continuously instead of being assembled before a review. The artifacts an assessor wants already exist: the versioned allow-list, the deny logs, the alerts that fired. They map cleanly into the Risk Assessment Report and the Security Assessment Report, because they were generated by the controls those reports describe.

The failure mode is where the design proves itself. An agent attempts a command that is not on the list. The enforcement point denies it. The denial is logged, attributed to the agent's identity, and raised to the SOC. The blast radius is a single denied call. Nothing escalated, nothing executed, nothing to clean up. A denied command is a non-event by design, which is exactly what you want an audit to find.

## The two layers reinforce each other

I made the case at the [API plane](/insights/boundary-doesnt-move/) first: every agent action a discrete, named operation with a discrete, named scope. This is the same discipline one layer down, at the OS plane, expressed as the commands an agent may run. The two stack. Scope discipline on the API plane and an enforced allow-list on the OS plane are the same idea applied at two boundaries, and an agent that has to pass both has very little room to surprise you.

That leaves one line worth keeping, the line the deleted database was missing.

> An agent's good intentions are not a control. The control is the thing it cannot route around.
