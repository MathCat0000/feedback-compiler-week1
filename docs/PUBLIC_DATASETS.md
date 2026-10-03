# Public dataset alignment

## Scope

The public pack is a structural and input-shape benchmark, not a replacement for first-party workplace data. It preserves source attribution, dataset license and source-row references in `fixtures/public/feedback_compiler_public_input_pack_v1.json`.

| Dataset | Used for | License recorded in source card | Fit | Limit |
|---|---|---|---|---|
| [BANKING77](https://huggingface.co/datasets/PolyAI/banking77) | support-ticket-like customer queries | CC BY 4.0 | short, explicit requests and questions | single-domain support; not internal team feedback |
| [OpenAssistant/oasst1](https://huggingface.co/datasets/OpenAssistant/oasst1) | chat and multilingual short inputs | Apache 2.0 | human-generated conversational text and language variation | general assistant prompts, not work threads |
| [QMSum](https://huggingface.co/datasets/fladhak/qmsum) | meeting transcript excerpts | MIT on the selected dataset card | long-form spoken/transcribed input | transcript summaries are not the compiler's six output labels |

## Deliberate gap

No public email or Slack corpus is treated as a direct equivalent in this repository. Corporate email dumps can contain personal data, confidential content and unclear reuse rights. The correct next step is a small redacted first-party set collected with consent and hand-labeled for the Feedback Compiler schema.

## What is actually scored

`npm run eval:public` measures:

- Ollama request/runtime completion;
- JSON-schema compatibility after deterministic post-processing;
- source-ID provenance validity;
- variation in format and input length;
- persisted raw and parsed artifacts.

It does not calculate semantic accuracy from the public datasets. Their labels answer different tasks, and converting them into requests, decisions, conflicts, duplicates, open questions and deadlines would create invented gold data.

## Reproducible command

```bash
npm run eval:public
```

The run writes the effective prompt, schema, request/response artifacts and summary under `runs/public/<run-id>/`. `--privacy` stores hashes and validation metadata without per-case text/output artifacts.
