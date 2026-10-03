# Product guide

## The short version

Feedback Compiler helps a person move from “I have several fragments of feedback” to “I know what needs review next”. It does not replace the person who owns the decision. It makes the hidden structure visible.

## Who it is for

The first user is a team lead who receives feedback from several people and surfaces during the day. The same idea applies to anyone who has to reconstruct work from messages rather than from one clean brief.

The product is intentionally useful before it is connected to other tools. A person can paste a small batch, inspect the result, and decide what deserves to leave the workspace.

## What goes in

The workspace accepts different shapes of everyday communication:

- a Slack-style thread;
- an email;
- meeting notes;
- a support ticket;
- a multilingual chat;
- a transcript excerpt.

Inputs can be short or long. Each one has a source label so the resulting suggestion can be checked against the original fragment.

## What comes out

The output is organised as a review board:

| Area | Meaning | Human question |
| --- | --- | --- |
| Do | A request that can become work | Is this the right action and scope? |
| Decide | A commitment or settled choice | Do we agree that this is actually decided? |
| Clarify | A conflict, ambiguity or unresolved question | Who should answer this before work starts? |
| Trace & timing | Related sources, duplicates and deadlines | What evidence and timing should stay attached? |

The same source label remains visible on the proposed item. That makes it possible to correct an interpretation without losing the original context.

## The normal interaction

1. Load the mixed example set or add your own fragments.
2. Check the source label and input type for each item.
3. Select `Compile locally`.
4. Read the board from `Do` to `Clarify`.
5. Inspect source labels, deadlines and related items.
6. Download a structured copy or prepare a paste-ready handoff.
7. Review and edit it before using another application.

The handoff buttons are deliberately conservative. They prepare text for Slack, Notion, Linear, Jira or email; they do not sign in, publish or modify a remote system.

## What “local” means here

The model runs on the same computer as the workspace. After the one-time model download, the main compilation path can work without an internet connection. The demo keeps the active session in memory and does not claim that local processing makes sensitive text automatically safe.

For real work, the user still needs to redact unnecessary personal or client information, choose a retention rule, protect exports and verify that the computer is not synchronising sensitive files elsewhere. The product is privacy-first by boundary, not privacy-proof by slogan.

## What the demo proves

The demo proves the complete user path with synthetic and public-data-derived input shapes: heterogeneous intake, local compilation, source-linked review and manual handoff. It does not prove that every semantic interpretation is correct, that a transcript pipeline is production-ready, or that the current model is fine-tuned for a specific organisation.

Those are intentionally separate questions. The person using the product remains the final reviewer.
