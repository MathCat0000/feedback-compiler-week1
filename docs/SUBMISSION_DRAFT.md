---
title: Feedback Compiler: a local, privacy-first feedback workspace for my mother
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).*

## What I Built

My mother receives feedback from her team as a stream of small fragments: messages, email, meeting notes, requests, opinions and deadlines. The hard part is not producing a shorter summary. The hard part is reconstructing the operational meaning without losing the source:

- what should become an action;
- what has already been decided;
- what is still ambiguous or contradictory;
- which deadline or source supports the interpretation.

I built Feedback Compiler to give her one local review surface for that work. It accepts heterogeneous inputs and turns them into a board with four distinct areas: `Do`, `Decide`, `Clarify`, and `Trace & timing`. Each proposed item keeps its source label, and the person remains responsible for accepting, editing or rejecting it.

The product is deliberately conservative. It does not create tasks autonomously, connect to a work account or claim that a model can replace the person who owns the decision. It prepares a structured, paste-ready handoff only after review.

The repository contains synthetic examples and attributed public-data input shapes. It contains no private client feedback and no private team transcript.

## Demo

Video: **[UPLOAD THE PUBLIC VIDEO URL HERE]**

The repository also contains the matching local artifact at [`demo/recordings/feedback-compiler-demo.mov`](../demo/recordings/feedback-compiler-demo.mov). The walkthrough is captured from the actual interface: six different input shapes, the local compilation path, source-linked output, review lanes and a manual handoff boundary. Its example result is held stable for presentation timing; the live workspace performs the real model call when `Compile locally` is used.

To run the product locally:

```bash
npm install --prefix demo
npm run model:pull -- --model gemma4:e2b-it-qat
npm run app
```

Then open `http://localhost:5173/#workspace`, load the mixed set and click `Compile locally`. The first model download needs internet; the main compilation path can then run on the same computer.

## Code

Repository: **[ADD THE PUBLIC GITHUB REPOSITORY URL HERE]**

The product guide and local setup are in [`docs/PRODUCT_GUIDE.md`](PRODUCT_GUIDE.md) and [`docs/LOCAL_QUICKSTART.md`](LOCAL_QUICKSTART.md). The evidence archive records the controlled benchmark, heterogeneous casebook, attributed public-data input pack and privacy-mode run.

## How I Built It

### 1. I started from a person, not from a model

I began with the concrete work my mother already does: receiving feedback from several people and turning it into follow-up work. That led me away from a generic summariser. A summary could sound fluent while still mixing a preference with a decision, dropping a deadline or hiding a conflict.

The first product rule became: preserve the source and separate the operational roles of the text. That rule shaped the interface, the examples, the evaluation and the privacy boundary.

### 2. I chose a local-first boundary

The obvious shortcut would have been a hosted API and a cloud dashboard. I rejected that as the default because the person’s raw material may contain client or team information. A local model made the privacy question inspectable and made the product usable without requiring a remote account after setup.

This choice has a cost: a compact local model is slower and can be less reliable on difficult semantic cases. I accepted that trade-off because the first goal was a trustworthy review surface, not invisible automation. Human approval remains in the design rather than being added as a disclaimer at the end.

### 3. I made a narrow vertical prototype

The first prototype had one input shape and one output list. That was useful for proving the basic loop, but it did not represent the real work. I expanded it into a workspace where a person can load or add multiple fragments, keep a source ID, identify the input surface and compile the batch locally.

The output is intentionally more explicit than a paragraph. `Do` represents proposed actions, `Decide` represents commitments, `Clarify` surfaces unresolved questions, and `Trace & timing` keeps relationships, duplicates and deadlines visible.

I also added paste-ready destinations for Slack, Notion, Linear, Jira and email. These controls stop at prepared text: they do not authenticate or write remotely. That keeps the demo honest while still showing how the result could enter a real workflow.

### 4. I changed the input set to match daily work

A designer-oriented set of short sentences would have made the first demo look clean but would not have tested the intended problem. I created a heterogeneous casebook with different lengths and communication styles:

- Slack-style thread;
- email;
- meeting notes;
- support ticket;
- multilingual chat;
- transcript excerpt;
- cross-functional and adversarial cases.

The live workspace exposes a six-input mixed set so a viewer can see the transformation rather than only read about it. Transcript support is presented accurately as an input-shape extension; it is not described as a finished speaker- and timestamp-aware ingestion product.

### 5. I used public data carefully

I wanted the experiment to be less dependent on invented text, but public datasets do not automatically contain labels for my output ontology. I therefore used a small, attributed pack from public sources only to test tolerance for support-query, conversational, multilingual and transcript-like shapes.

I did not turn those datasets into a false accuracy claim. Their role is input diversity. The controlled cases remain the place where the compiler’s categories and provenance rules can be checked explicitly.

### 6. I tested in layers and recorded the failures

The testing sequence was:

1. smoke tests to verify the local model could answer and return the expected envelope;
2. the complete 30-case controlled run;
3. the 8-case heterogeneous casebook;
4. the attributed public-data input pack;
5. a privacy-mode run that avoids writing raw case text into per-case artifacts;
6. manual review of the 30-case result.

The first local baseline with the smaller model exposed timeouts and weak provenance. I did not hide that run. I changed the default local model, made the extraction rules more explicit, preserved source IDs, added deterministic relation cleanup and reran the same checks.

The final recorded evidence for the chosen local model was:

- 30/30 controlled cases produced schema-valid output;
- 30/30 controlled cases preserved valid provenance;
- 0 runtime failures in that run;
- 8/8 heterogeneous cases were schema- and provenance-valid;
- manual review of the controlled run: 13 accepted, 16 partial, 1 rejected.

The gap between structural validity and semantic review is important. The automatic checks show that the workflow stayed within its contract. They do not mean that the model understood every case correctly. I kept the human-review requirement because the manual result proves that the remaining problem is interpretation, not merely formatting.

### 7. I rebuilt the presentation around the real product

The first video was not acceptable because it used a dark visual treatment while the verified app used a warm white canvas, black typography, green local-status accents and the orange mascot. I treated that as a product defect, not a cosmetic difference.

I verified the live workspace, then regenerated the walkthrough so the video shows the same vocabulary and sequence as the interface: heterogeneous input, local compilation, review board, manual handoff and privacy limits. The video uses synthetic examples and is presentation evidence, not a substitute for the runnable product.

### 8. I delivered it as a local application

The intended handoff is a local web app on the user’s computer. The person installs the local runtime and model once, opens the workspace in a browser, and can then compile without a hosted account. This is a more honest deployment story for the current privacy boundary than publishing a static page that cannot reach the person’s local model.

I documented the first-run path, the user flow, the privacy limits, the demo sequence and the public submission separately. The evidence reports remain available for inspection, but a reader can understand the product without reading implementation notes.

## Why Does Open Innovation Matter?

Open innovation made it possible to build around a local model rather than making a remote API the centre of the product. That matters here because the privacy boundary is part of the user need, not merely a hosting preference.

It also made the trade-offs visible. The local model can be inspected, replaced and evaluated on the same machine as the app. In return, the user accepts download size, local compute cost, latency and the need for human review. A closed hosted service might make the first interaction faster, but it would obscure more of the boundary that this project is trying to make explicit.

The important claim is not “local means safe”. The claim is narrower: the project gives the user a local path, shows where that path ends, and keeps remote handoff out of the MVP.

## What I Learned

The central lesson was that heterogeneity is not a cosmetic feature. A system that works on short designer-like sentences can still fail when a deadline appears inside meeting notes, when two languages are mixed, or when a transcript contains an unresolved question rather than a request.

The second lesson was that a valid structure is not the same as a correct interpretation. That distinction changed the project from “generate JSON” into “generate a reviewable proposal with evidence attached”.

## Current Limits and Next Decision

I am not claiming a fine-tuned model, production transcript ingestion, automatic integrations, semantic accuracy on arbitrary client work or a completed pilot with my mother’s real data. The next responsible step would be a small, redacted gold set reviewed by the actual user, followed by error-driven improvements and a measured decision about whether the local latency is acceptable.

## My Agent Session

Public session reference: https://chatgpt.com/s/cx_6ac0c10544c8819183d835ec37d20750

This is a public, read-only Codex session share. The DEV Agent Session version is intentionally not claimed here: it requires an authenticated DEV account/API key and a final curation pass. If the session is uploaded to DEV, replace this paragraph with the resulting `https://dev.to/agent_sessions/...` URL. Do not publish private prompts, client data or local paths.

## Prize Categories

**Best Use of Gemma** — the project uses `gemma4:e2b-it-qat` locally and records both the workflow and its limitations.

No other partner category is claimed unless its technology is actually added and documented.
