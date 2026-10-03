# Research protocol

## Hypothesis

A compact local model can compile small batches of fragmented feedback into useful structure while preserving provenance and avoiding invented requirements.

## Baseline

One sequential Ollama `/api/chat` call per case. The model receives only the case metadata needed for the run and the feedback text; it never receives `expected`. Structured output is requested with `output-schema.json`. Initial options are `num_ctx=4096`, `temperature=0`, `stream=false`.

## Smoke set

FC001–FC005 plus FC006 (true conflict) and FC007 (different scopes, not a conflict). This covers extraction, decision conservatism, duplicate conservatism and conflict scope before the complete corpus.

## Evaluation boundaries

Automatic checks validate JSON shape, supported fields and source references. The comparison is a source-aware heuristic only. Semantic status remains `NEEDS_REVIEW` until a human reviews each preserved output. Counts always report their denominator. Runtime, schema, provenance and semantic errors remain separate.

## Reproducibility

Every run stores model tag, installed-model record, Ollama API version, options, hashes for dataset/schema/prompt, prompts, requests, raw API responses, parsed output, timing and per-case evaluation under `runs/<run-id>/`.

## Heterogeneous extension set

The 30-case benchmark isolates semantic failure modes. It is complemented by `fixtures/feedback_compiler_heterogeneous_v1.json`, an 8-case synthetic-realistic casebook covering Slack, email, meeting notes, support tickets, cross-functional disagreement, multilingual duplicates, adversarial feedback and transcript excerpts.

The two sets have different purposes:

- the 30 cases support controlled regression and failure attribution;
- the heterogeneous casebook tests whether the input contract survives realistic work surfaces;
- neither set is real-user validation or evidence of time saved;
- the transcript case is a partial extension because speaker/timestamp provenance is not yet first-class in the current schema.

For each future run, record `case_id`, `input_type`, number of messages, character count, model, context, temperature, latency, runtime status, schema status, provenance status, relation review and semantic review. Do not aggregate heterogeneous cases into one accuracy number until the annotation contract and denominators are stable.

## Rule-driven presentation

The casebook is presented through `docs/INPUT_RULEBOOK.md`. A demo walkthrough should show one input, name the rule at risk, compile locally and inspect the resulting source links. The interesting claim is relation preservation under noise, not generic summarization quality.
