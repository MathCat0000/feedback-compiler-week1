# Feedback Compiler — Evaluation Report

Run: `2026-10-03T07-25-19-209Z-gemma4-e2b-it-qat`
Mode: **all**
Model: `gemma4:e2b-it-qat`
Thinking: **disabled**
Persistence: **full benchmark artifacts**
Post-processing: **deterministic-v2**
Ollama: `http://127.0.0.1:11434`
Cases executed: **30 / 30**
Dataset: `feedback_compiler_synthetic_dataset_v1.json`

## Epistemic status

The outputs below are real local Ollama responses. The automatic comparison is a structural/source-aware heuristic, not a semantic gold-standard judgement. Manual review remains required; therefore each case retains `NEEDS_REVIEW` as its semantic review status.

## Runtime

- API version: 0.35.0
- Machine: darwin/arm64
- First inference: 3845 ms
- Warm inference mean: 4424 ms
- Schema-valid outputs: 30 / 30
- Provenance-valid outputs: 30 / 30
- Runtime failures: 0

## Automatic heuristic

- PASS_HEURISTIC: 28
- PARTIAL_HEURISTIC: 2
- FAIL_HEURISTIC: 0

## Case results

| Case | Failure mode | Runtime | Schema | Provenance | Heuristic | Semantic review | Time (ms) |
|---|---|---:|---:|---:|---|---|---:|
| FC001 | missed_request | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3845 |
| FC002 | opinion_as_decision | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3184 |
| FC003 | opinion_as_decision | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 1950 |
| FC004 | missed_duplicate | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3451 |
| FC005 | false_duplicate | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4285 |
| FC006 | missed_conflict | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5976 |
| FC007 | false_conflict | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 6179 |
| FC008 | invented_detail | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4746 |
| FC009 | date_hallucination | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4614 |
| FC010 | under_extraction | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5065 |
| FC011 | negation_failure | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3169 |
| FC012 | mixed_intent | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3201 |
| FC013 | suggestion_as_request | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3194 |
| FC014 | missed_semantic_duplicate | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3456 |
| FC015 | solution_hallucination | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3262 |
| FC016 | stale_conflict | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 5577 |
| FC017 | deadline_conflict | OK | OK | OK | PARTIAL_HEURISTIC | NEEDS_REVIEW | 6414 |
| FC018 | false_duplicate | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4226 |
| FC019 | unsupported_coreference | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4312 |
| FC020 | prompt_injection | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4355 |
| FC021 | multilingual_duplicate | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3697 |
| FC022 | priority_hallucination | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3366 |
| FC023 | missed_priority | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3255 |
| FC024 | comment_as_request | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 1981 |
| FC025 | missed_deadline | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3141 |
| FC026 | relation_interference | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 6526 |
| FC027 | condition_loss | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 3843 |
| FC028 | stale_request | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4797 |
| FC029 | wrong_source | OK | OK | OK | PASS_HEURISTIC | NEEDS_REVIEW | 4285 |
| FC030 | multi_relation_reasoning | OK | OK | OK | PARTIAL_HEURISTIC | NEEDS_REVIEW | 12777 |

## Limits

- The original synthetic dataset is preserved unchanged. FC013 has no `expected.deadlines`; the evaluator treats the missing category as empty only for comparison and records the anomaly in the dataset notes.
- No product validation, real-user validation, calibrated confidence, or peak-memory measurement is established by this run.
- This run is the Gemma 4 E2B local benchmark; model comparison remains limited to the recorded runs and configuration differences.
- A heuristic match does not prove semantic correctness. Inspect the per-case artifacts under `runs/<run-id>/cases/` before changing the prompt or model.
