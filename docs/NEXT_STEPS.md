# Next steps

1. Manual contract-aware review completed in `docs/MANUAL_REVIEW.md`: 13 ACCEPT, 16 PARTIAL, 1 REJECT. The automated 28/2/0 result is optimistic because it underweights missing scopes, conditions and priorities.
2. Keep the deterministic post-processing layer covered by `npm test`; add regression fixtures for the 16 partial and 1 rejected cases.
3. Replace heuristic matching with manually verified category-level precision/recall/F1 before describing the system as accurate.
4. Expand the synthetic suite with adversarial, multilingual, deadline-conflict and anonymized real-feedback cases.
5. Add redaction, retention/delete controls and a tested network-boundary check before any real client pilot.
6. Define transcript ingestion: chunking, speaker attribution, timestamps and cross-chunk relation merging.
7. Expose the stable pipeline as a CLI/API only after the gold evaluation and input-size/performance limits are defined.
8. Harden the React-to-local bridge only after the privacy contract and output contract remain stable.
9. Obtain workflow feedback from the designer partner using synthetic or fully anonymized examples; test whether preparation cost is lower than the work saved.
10. Keep the heterogeneous casebook as a separate evaluation pack; the final recorded run is 6 PASS, 2 PARTIAL, 0 FAIL with 8/8 schema/provenance-valid and 0 runtime failures. Add only failures that reveal a new rule or regression to the controlled benchmark.

## Casebook evidence

The final recorded Gemma 4 E2B casebook run is available in `runs/2026-10-03T07-28-31-451Z-gemma4-e2b-it-qat/` and `docs/HETEROGENEOUS_EVALUATION_REPORT.md`: 8/8 schema-valid, 8/8 provenance-valid, 0 runtime failures, 6 `PASS_HEURISTIC`, 2 `PARTIAL_HEURISTIC`, 0 `FAIL_HEURISTIC`. This demonstrates a functioning local extraction pipeline, not reliable semantic generalization.
11. Build a transcript adapter with speaker/timestamp fields before claiming transcript support; do not hide those fields inside plain text indefinitely.
12. Extend the public pack only when a dataset has a traceable source/license and a clear input-shape contribution; do not turn proxy labels into invented compiler gold.

No gate is closed by synthetic cases alone.
