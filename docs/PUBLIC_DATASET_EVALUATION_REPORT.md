# Feedback Compiler — Public Input Pack Evaluation

Run: `2026-10-03T07-29-37-963Z-gemma4-e2b-it-qat`
Model: `gemma4:e2b-it-qat`
Thinking: **disabled**
Pack: [`fixtures/public/feedback_compiler_public_input_pack_v1.json`](../fixtures/public/feedback_compiler_public_input_pack_v1.json)

## Gate results

- Cases executed: **8**
- Runtime failures: **0**
- Schema-valid: **8/8**
- Provenance-valid: **8/8**
- Input types: **support_ticket=3, chat=1, multilingual_chat=2, transcript=1, meeting_notes=1**
- First inference: **4445 ms**
- Warm mean: **6951 ms**

## Per-case structural evaluation

| Case | Type | Dataset | Chars | Runtime | Schema | Provenance | Populated categories | Semantic status |
|---|---|---|---:|---|---|---|---|---|
| PUB-BANK-001 | support_ticket | PolyAI/banking77 | 35 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-BANK-002 | support_ticket | PolyAI/banking77 | 113 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-BANK-003 | support_ticket | PolyAI/banking77 | 92 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-OASST-001 | chat | OpenAssistant/oasst1 | 194 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-OASST-002 | multilingual_chat | OpenAssistant/oasst1 | 70 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-OASST-003 | multilingual_chat | OpenAssistant/oasst1 | 178 | OK | OK | OK | requests | NOT_GOLD_NEEDS_REVIEW |
| PUB-QMSUM-001 | transcript | fladhak/qmsum | 604 | OK | OK | OK | none | NOT_GOLD_NEEDS_REVIEW |
| PUB-QMSUM-002 | meeting_notes | fladhak/qmsum | 684 | OK | OK | OK | decisions | NOT_GOLD_NEEDS_REVIEW |

## Interpretation

This run tests transport, structured-output validity, provenance preservation and input-shape tolerance. It does not claim semantic accuracy: the source datasets do not contain Feedback Compiler gold labels for requests, decisions, conflicts, duplicates, questions and deadlines.

The pack is a public-data proxy. BANKING77 supplies customer-service queries, OASST1 supplies human-generated multilingual/chat messages, and QMSum supplies meeting-transcript excerpts. None is evidence that the system generalizes to private Slack or corporate email.

Next evidence gate: add a small redacted first-party set with human-reviewed gold labels, then compare semantic performance without mixing public proxy scores with workplace scores.
