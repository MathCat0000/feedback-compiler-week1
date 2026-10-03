# Architecture

```text
dataset case -> input adapter -> structured untrusted feedback JSON
            -> Ollama /api/chat (one call, JSON schema, local model)
            -> raw model response + parsed JSON
            -> deterministic relation post-processing
            -> schema validation + source provenance validation
            -> heuristic comparison + NEEDS_REVIEW artifact
```

The model receives no gold expected output. Feedback is data, not an instruction channel. Source IDs are the only accepted provenance references. Relative deadlines remain text. The post-processing layer handles category precedence, duplicate/scope separation, conflict cleanup, prompt-injection residue, ambiguity and omitted deadlines. Its transformed output is stored alongside `model_output` so the model response remains auditable.

The harness is Node-only and uses the built-in `fetch`; it has no package dependency. The React/Vite app lives under `demo/`, sends feedback to `/ollama/api/chat`, and uses a Vite development/preview proxy to reach Ollama at `127.0.0.1:11434`. A static deployment without that local proxy would not automatically reach Ollama on the local Mac.

The demo keeps two input collections separate: `demo/src/demoCases.json` is the controlled 30-case benchmark, while `fixtures/feedback_compiler_heterogeneous_v1.json` is an 8-case synthetic-realistic casebook. The latter is loaded into the UI as a presentation and input-shape surface; it is not merged into the benchmark score. The current adapter sends `{id, source, format, text}` to the model. `format` is metadata, not evidence: it helps preserve whether an item came from Slack, email, meeting notes, a ticket, a multilingual chat or a transcript. Transcript support therefore remains partial until speaker and timestamp fields become first-class.

The current model is not fine-tuned for this domain. The specialization is implemented through the system prompt, output schema, provenance constraints and deterministic validation/post-processing. Fine-tuning should follow an error-driven gold set; it should not be used to hide unresolved annotation or input-contract problems.

## User-side installation and runtime

The supported user experience is a local webapp:

```text
one-time:  install Ollama + pull model (internet required)
each use:  start Ollama + Vite → open browser on localhost
           paste feedback → compile locally → review/export manually
```

`scripts/setup-local.mjs` checks Node, Ollama, the local API and the selected model. `npm run model:pull` makes the large download explicit; `npm run app` runs the preflight check and starts the Vite interface. The browser never loads model weights and never calls a cloud inference endpoint in the local path. The repository does not currently ship an Electron/Tauri wrapper; adding one would be packaging work, not a change to the compiler contract.

## Privacy-aware execution

Standard runs preserve full synthetic artifacts for auditability. `npm run eval:privacy` keeps the inference path unchanged but replaces per-case text artifacts with hashes, metadata, validation and timing. This is an operational guard against accidental persistence, not anonymisation and not a complete threat model. Real pilots still need redaction, retention controls and a tested network boundary. See `docs/PRIVACY.md`.
