# Manual semantic review

Run reviewed: `runs/2026-10-02T19-49-20-389Z-gemma4-e2b-it-qat/`

This review compares, for each case, the original feedback, the model output, the deterministic post-processed output, and the dataset's expected compilation. `PASS_HEURISTIC` is not treated as an automatic semantic pass: missing structured fields, lost conditions, wrong question basis, extra items and duplicated relations are reviewed explicitly.

## Verdict summary

| Verdict | Cases | Count |
|---|---|---:|
| ACCEPT | FC002, FC003, FC006, FC010, FC012, FC013, FC016, FC019, FC020, FC022, FC024, FC026, FC028 | 13 |
| PARTIAL | FC001, FC004, FC005, FC007, FC008, FC009, FC011, FC014, FC015, FC017, FC018, FC021, FC023, FC025, FC027, FC029 | 16 |
| REJECT | FC030 | 1 |

## Review rubric

- `ACCEPT`: semantic intent, relations and provenance are preserved; wording differences are non-material.
- `PARTIAL`: core intent is present, but a structured field, relation, scope, condition, priority or normalization is missing/wrong.
- `REJECT`: the output loses several independent relations or produces a materially unsafe/wrong compilation.

## Case-by-case review

| Case | Verdict | Finding | Error class |
|---|---|---|---|
| FC001 | PARTIAL | Request is correct and cites `f1`, but explicit scope `header` is missing from the structured field. | missing scope |
| FC002 | ACCEPT | Confirmed color choice is correctly classified as a decision; no request duplicate. | none |
| FC003 | ACCEPT | Tentative opinion produces no operational item. | none |
| FC004 | PARTIAL | Duplicate is correctly merged into one request with both sources, but scope `hero` is missing. | missing scope |
| FC005 | PARTIAL | Above/below requests remain separate, but `hero-top` and `hero-bottom` scopes are not represented. | missing scope |
| FC006 | ACCEPT | Logo-size conflict is correctly isolated under `conflicts`, without standalone requests. | none |
| FC007 | PARTIAL | Mobile and desktop requests remain separate, but the explicit scopes are only embedded in text, not structured fields. | missing scope |
| FC008 | PARTIAL | Request and missing-copy question are present; question basis is `ambiguity` instead of `explicit_missing_information`, and CTA scope is absent. | wrong basis; missing scope |
| FC009 | PARTIAL | Request and Friday deadline are preserved, but scope is absent and the deadline representation includes an extra `by`. | deadline normalization; missing scope |
| FC010 | ACCEPT | All three independent requests are extracted with correct provenance. | none |
| FC011 | PARTIAL | Navigation prohibition and hero-title request are both captured; hero-title scope is missing. | missing scope |
| FC012 | ACCEPT | Approval is a decision and CTA visibility is a separate request. | none |
| FC013 | ACCEPT | Tentative suggestion is correctly omitted. | none |
| FC014 | PARTIAL | Semantic duplicate is correctly merged and recorded, but checkout-CTA scope is missing. | missing scope |
| FC015 | PARTIAL | Problem-level request is correct and avoids an implementation invention, but scope and explanatory note are missing. | missing scope/note |
| FC016 | ACCEPT | Later final decision supersedes earlier alternatives; stale conflict is removed. | none |
| FC017 | PARTIAL | Deadline conflict and clarification question are correct, but the canonical request is missing and four deadline entries contain duplicates. | relation normalization |
| FC018 | PARTIAL | Header and footer remain separate, but explicit scopes are missing as fields. | missing scope |
| FC019 | ACCEPT | Ambiguous pronoun is not resolved by guessing; correct clarification question is produced. | none |
| FC020 | ACCEPT | Injection text is ignored while the legitimate footer-size issue is retained. | none |
| FC021 | PARTIAL | Multilingual duplicate is correctly merged, but `main-heading` scope is missing and unsupported `priority: medium` is invented. | hallucinated priority; missing scope |
| FC022 | ACCEPT | Request is extracted without inventing a priority. | none |
| FC023 | PARTIAL | Request is correct, but explicit `high` priority is lost. | lost priority |
| FC024 | ACCEPT | Positive comment produces no false request. | none |
| FC025 | PARTIAL | Request and `before launch` deadline are present; pricing-page scope is missing and the condition is not repeated in request text. | missing scope; condition loss |
| FC026 | ACCEPT | Duplicate evidence and hero-spacing conflict are represented without retaining a standalone request. | none |
| FC027 | PARTIAL | Condition is stored in the condition field, but not preserved in the request text as required by the contract. | condition loss |
| FC028 | ACCEPT | Withdrawn carousel request is removed; final static decision remains. | none |
| FC029 | PARTIAL | Both requests and source IDs are correct, but `pricing` is dropped from the subtitle target. | target under-specification |
| FC030 | REJECT | Dense case loses logo conflict, hero duplicate relation and hero source links; adds an extra logo request and duplicates the deadline. | multi-relation failure |

## Interpretation

The model/post-processing combination is operationally robust: all 30 outputs pass schema and provenance validation, and prompt injection is handled. The main remaining quality debt is not basic extraction but preservation of structured fields and relations: scope, priority, condition, deadline normalization, and dense multi-relation grouping.

The heuristic score `28 PASS / 2 PARTIAL / 0 FAIL` is therefore optimistic. Under this stricter contract-aware review the current result is `13 ACCEPT / 16 PARTIAL / 1 REJECT`.

## Next corrective gate

1. Add regression tests for missing scope, priority and condition preservation.
2. Normalize deadline representation before heuristic comparison.
3. Add a relation pass for dense cases such as FC030.
4. Re-run the full evaluation and repeat this review.
