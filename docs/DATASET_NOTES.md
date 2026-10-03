# Dataset notes

- Source: `feedback_compiler_synthetic_dataset_v1.json`, copied from the supplied handoff package and preserved unchanged.
- Version: 1.0.
- Size: 30 cases, synthetic evaluation data, not training data.
- Labels: requests, decisions, conflicts, duplicates, open_questions, deadlines.
- Feedback messages: 49 across Client, Designer, PM, Creative Director and Developer.
- Gold items: 29 requests, 6 decisions, 4 conflict groups, 5 duplicate groups, 4 open questions and 5 deadlines.

## Known anomaly

FC013 has no `expected.deadlines` key. The original is not edited. The evaluator interprets a missing expected category as an empty list only for comparison and records the original hash in each run.

## Semantic limits

The gold is a fallible synthetic proposal. Some expected outputs intentionally compress or rephrase source text. Literal string equality is therefore not an accuracy metric. A heuristic comparison is reported separately from semantic review.

## Heterogeneous extension

`fixtures/feedback_compiler_heterogeneous_v1.json` is a separate synthetic-realistic casebook. It is not merged into the 30-case benchmark because its purpose is input-shape coverage rather than a controlled failure-mode comparison. The rule mapping and walkthrough are documented in `docs/INPUT_RULEBOOK.md` and `docs/HETEROGENEOUS_CASEBOOK.md`.

## Public input pack

`fixtures/public/feedback_compiler_public_input_pack_v1.json` contains eight attributed public examples from BANKING77, OpenAssistant/oasst1 and QMSum. It is an input-shape/runtime pack, not semantic gold and not training data. The exact source URLs, recorded licenses, source-row references and reuse boundary are in `docs/PUBLIC_DATASETS.md`.

The corresponding run writes raw and parsed artifacts under `runs/public/<run-id>/` and records only structural gates in `docs/PUBLIC_DATASET_EVALUATION_REPORT.md`. Public support queries and meeting transcripts are proxies; no public corpus in this repo is claimed to be Slack or private corporate email.
