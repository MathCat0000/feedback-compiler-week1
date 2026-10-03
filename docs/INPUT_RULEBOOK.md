# Input and extraction rulebook

## Purpose

Feedback Compiler is not a generic summarizer. It converts heterogeneous fragments into a small set of reviewable operational units while preserving the path back to the source.

The rulebook is deliberately conservative: a missing item is usually safer than an invented requirement, and an unresolved relation is safer than a destructive merge.

## Input boundary

The current runtime accepts a list of records with three fields:

```json
{
  "id": "S-101",
  "source": "Slack / PM",
  "text": "The mobile hero still feels too tall. Can we reduce the top padding before Friday?"
}
```

The `text` field may come from different work surfaces. The source type is metadata for evaluation and presentation; it is not evidence of authority.

| Input shape | Current status | Main risk | Required treatment |
| --- | --- | --- | --- |
| Slack or chat thread | Supported | short, implicit, duplicated messages | preserve message IDs and thread order |
| Email thread | Supported as text | quoted history and repeated signatures | separate each message; do not treat the subject as a request |
| Meeting notes | Supported as text | bullets mix observations, decisions and actions | classify each atomic line independently |
| Support ticket | Supported as text | customer quote is confused with an internal action | keep quote as evidence unless an explicit action exists |
| Multilingual feedback | Supported experimentally | duplicate meaning is hidden by wording | compare meaning and scope, not language or token overlap alone |
| Transcript excerpt | Partial / next extension | speakers, timestamps and cross-chunk relations | preserve speaker and timestamp provenance before inference |

The casebook in `fixtures/feedback_compiler_heterogeneous_v1.json` is synthetic-realistic. It contains no client names, credentials or real customer text. It exists to test input shape and rule coverage, not to claim product validation.

## Rule set

| Rule | Question | Output consequence |
| --- | --- | --- |
| R0 — Trust boundary | Is this text feedback or an instruction to the model? | Feedback remains data. Prompt-injection-like text is never followed. |
| R1 — Atomize | Can one message be split into independent propositions? | Emit one item per actionable proposition; keep source IDs on every item. |
| R2 — Action | Is there an explicit request or imperative? | Emit `requests`; do not invent implementation details. |
| R3 — Decision | Is there an explicit commitment or confirmation? | Emit `decisions`; opinion and tentative preference are not decisions. |
| R4 — Deadline | Is there a relative or absolute time constraint? | Preserve the original wording and attach it to the related request. Never invent a calendar date. |
| R5 — Scope | Do apparently different instructions target the same object and scope? | Store scope when supported. Different scopes remain separate and are not conflicts. |
| R6 — Conflict | Are two instructions incompatible on the same object and scope? | Emit one `conflict` with both alternatives and an unresolved question when confirmation is needed. |
| R7 — Duplicate | Are two propositions materially equivalent with compatible scope? | Keep one canonical request and a `duplicate` relation with all source IDs. |
| R8 — Missing information | Is a necessary value explicitly absent? | Emit `open_questions` with `basis: explicit_missing_information`. |
| R9 — Ambiguity or stale intent | Is a reference unresolved, conditional or withdrawn? | Do not guess. Preserve condition, ask for clarification or remove a superseded request only when the later evidence is explicit. |
| R10 — Provenance | Can a reviewer trace the output to supplied IDs? | Reject unknown IDs. A valid JSON object with invalid provenance is still a failed output. |
| R11 — Review | Is the result a proposal or an accepted task? | Render `REVIEW`; human approval remains outside the model. |

## Precedence and relation logic

The extraction order is:

```text
boundary -> atomic propositions -> category -> scope -> relations -> deadlines -> provenance check -> review
```

Relations must not erase category evidence:

- a decision is not also a request for the same proposition;
- conflict alternatives are not repeated as standalone requests unless there is an independent action;
- a duplicate preserves one canonical item plus its source set;
- a deadline is attached to a request but remains separately visible;
- later text supersedes earlier text only when it explicitly confirms, withdraws or replaces it;
- a source role does not grant authority by itself;
- `confidence` percentages are intentionally absent because they are not calibrated.

## Review contract

Every case is evaluated along separate axes:

1. runtime: did Ollama return within the timeout?
2. schema: is the JSON shape valid?
3. provenance: are all references valid and sufficient?
4. relations: are duplicate, conflict, deadline and supersession links preserved?
5. semantics: does the result mean the right thing?

Only the first three are currently automated with hard checks. Relation and semantic quality require contract-aware human review. A `PASS_HEURISTIC` result is not a semantic pass.

## Demo narrative

The strongest demo should show one case where the input looks messy but the output is inspectable:

1. display the raw fragments with source IDs;
2. label the input shape: chat, email, notes, ticket or transcript excerpt;
3. point to the rule that prevents a likely error;
4. compile locally;
5. show `Do`, `Decide`, `Clarify` and `Trace & timing`;
6. open the source IDs before accepting anything;
7. state what the system does not know.

This makes the product interesting because the problem is not “summarize text”; it is “preserve distinctions while moving from fragments to a decision surface.”
