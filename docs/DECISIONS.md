# Decisions

| Decision | Rationale | Evidence/status |
|---|---|---|
| Use the supplied synthetic corpus | No real feedback data is available in the handoff | Confirmed for this run; product validation remains open |
| Preserve the original dataset | FC013 has a missing expected category and the gold is fallible | Confirmed; no silent normalization |
| Start with one-pass inference | Establish the simplest comparable baseline before adding failure sources | Provisional |
| Use conservative provenance | A wrong source or destructive merge is a severe error | Confirmed in prompt/schema/harness |
| Freeze the first baseline on `phi3:mini` | It was the only model installed when the smoke/full run began | Confirmed for comparability; not a Gemma result |
| Install and benchmark `gemma4:e2b-it-qat` after explicit authorization | It is the smallest selected E2B variant and the user explicitly authorized the download | Installed and verified; final full run completed with 30/30 schema/provenance-valid and 0 runtime failures |
| Constrain provenance per case and serialize feedback as JSON | Free-form labels allowed source-ID drift in the first baseline | Implemented in harness; final run had 30/30 provenance-valid outputs |
| Use Gemma thinking disabled as the reproducible local default | `think=true` occasionally stalled simple cases for many minutes on this Mac; `think=false` completed the full corpus with bounded per-request execution and equivalent final heuristic totals after post-processing | Final run uses `--think false`, timeout `30000 ms`, one retry; `think=true` remains a comparison mode, not the default |
| Add explicit category precedence and ambiguity rules | The first Gemma run over-produced requests and missed opinion/decision boundaries | Intermediate Gemma run improved from 15/11/4 to 19/10/1; deterministic post-processing was then added and measured separately |
| Add deterministic relation post-processing after model inference | Prompt-only controls could not reliably normalize duplicates, conflicts, scope boundaries, prompt-injection residue or omitted deadlines | Final run: 28/2/0 PASS/PARTIAL/FAIL; 21/21 post-processing unit tests passed |
| Treat manual review as contract-aware rather than heuristic-only | The heuristic ignores or underweights optional-but-operational fields such as scope, priority and condition | Review recorded in `docs/MANUAL_REVIEW.md`: 13 ACCEPT, 16 PARTIAL, 1 REJECT |
| Keep semantic status as `NEEDS_REVIEW` | Automatic structural matching cannot establish semantic correctness | Confirmed |
