# Product scope

## Current claim

Feedback Compiler is an experiment around transforming small batches of fragmented product/design feedback into a provenance-preserving operational representation. The candidate output contains requests, decisions, conflicts, duplicates, open questions and deadlines.

The first vertical is designers and small product teams. The current inputs are short synthetic messages because the benchmark isolates extraction, provenance and relation handling. The intended extension is to longer inputs such as meeting transcripts, but that requires redaction, chunking, speaker attribution, timestamp-level provenance and a new evaluation set.

The product position is **local-first and privacy-first by design**, not an absolute privacy guarantee: Ollama inference is local, while local persistence, backups, device access and derived output remain part of the threat model. See `docs/PRIVACY.md`.

## What this week tests

- Whether a local compact model can perform conservative extraction on controlled synthetic cases.
- Whether source IDs remain recoverable and relations are not invented.
- Whether the one-pass baseline is viable enough to guide the next engineering change.

## Explicit exclusions

No product-market validation, real-user validation, audio/PDF/image ingestion, integrations, database, auth, agents, tool calling or production deployment is established here. The React/Vite app is a local vertical slice, not a production UI or transcript ingestion system. The Hacktoberfest challenge requirements are not verified by the repository itself.

## Open gates

- Problem gate: a real person loses meaningful work on fragmented feedback — open.
- AI gate: the model avoids severe semantic errors on representative cases — open pending review.
- Product gate: time saved exceeds time spent preparing input — open.
