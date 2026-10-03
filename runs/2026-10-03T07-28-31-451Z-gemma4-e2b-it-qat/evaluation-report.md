# Feedback Compiler — Evaluation Report

Run: `2026-10-03T07-28-31-451Z-gemma4-e2b-it-qat`
Mode: **all**
Model: `gemma4:e2b-it-qat`
Thinking: **disabled**
Persistence: **full benchmark artifacts**
Post-processing: **deterministic-v2**
Ollama: `http://127.0.0.1:11434`
Cases executed: **8 / 8**
Dataset: `fixtures/feedback_compiler_heterogeneous_v1.json`

## Epistemic status

The outputs below are real local Ollama responses. The automatic comparison is a structural/source-aware heuristic, not a semantic gold-standard judgement. Manual review remains required; therefore each case retains `NEEDS_REVIEW` as its semantic review status.

## Runtime

- API version: 0.35.0
- Machine: darwin/arm64
- First inference: 11097 ms
- Warm inference mean: 6992 ms
- Schema-valid outputs: 8 / 8
- Provenance-valid outputs: 8 / 8
- Runtime failures: 0

## Automatic heuristic

- PASS_HEURISTIC: 6
- PARTIAL_HEURISTIC: 2
- FAIL_HEURISTIC: 0

## Case results

| Case | Failure mode | Runtime | Schema | Provenance | Heuristic | Semantic review | Time (ms) |
|---|---|---:|---:|---:|---|---|---:|
| HX001 | slack_thread | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 11097 |
| HX002 | email_thread | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 6050 |
| HX003 | meeting_notes | OK | OK | OK | PARTIAL_HEURISTIC | NEEDS_REVIEW | 9983 |
| HX004 | support_ticket | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4143 |
| HX005 | cross_functional_thread | OK | OK | OK | PARTIAL_HEURISTIC | NEEDS_REVIEW | 12265 |
| HX006 | multilingual_chat | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5524 |
| HX007 | adversarial_feedback | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5255 |
| HX008 | transcript_excerpt | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5724 |

## Limits

- This casebook is synthetic-realistic and tests input-shape coverage. It is not real customer evidence and its heuristic comparison is not a product accuracy score.
- No product validation, real-user validation, calibrated confidence, or peak-memory measurement is established by this run.
- This run is the Gemma 4 E2B local benchmark; model comparison remains limited to the recorded runs and configuration differences.
- A heuristic match does not prove semantic correctness. Inspect the per-case artifacts under `runs/<run-id>/cases/` before changing the prompt or model.

## Interpretation

- The pipeline is operationally reliable on this pack when schema and provenance are the gate: the recorded run completed without runtime failures.
- A heuristic pass is not a semantic guarantee. Review the case artifacts for decision-vs-request classification, open-question detection, multilingual duplicate merging, deadline attachment and withdrawn requests.
- Check the fixture before scoring: HX003 currently points its expected deadline at M-301 even though the deadline text is in M-304. Treat that as a gold-data issue until corrected.
- This evidence supports a local human-review prototype, not autonomous task creation or a claim that the model generalizes to real customer work.
