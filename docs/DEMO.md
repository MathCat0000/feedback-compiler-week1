# Demo guide

The demo is designed to be understood in one pass:

1. different kinds of feedback arrive together;
2. the person keeps each source label attached;
3. the local model proposes a common structure;
4. the person reviews the result in three clear lanes;
5. a paste-ready handoff is prepared without writing to another service.

## Recommended walkthrough

Open the workspace and choose `Load mixed set`. The six examples deliberately vary in channel, language and length:

- Slack-style thread;
- email;
- meeting notes;
- support ticket;
- multilingual chat;
- transcript excerpt.

Click `Compile locally`, then read the output in this order:

- `Do`: proposed work;
- `Decide`: settled choices;
- `Clarify`: unresolved questions or conflicts;
- `Trace & timing`: related sources, duplicates and deadlines.

The destination buttons show how the reviewed signal could be moved to a person's existing workflow. They only prepare text for manual approval.

## What the demo should not imply

The examples are synthetic or derived from public-data input shapes. The video does not contain real client material. The result is a proposal, not an automatic task creation system, and transcript support is an input-shape demonstration rather than a complete production ingestion pipeline.

## Presentation artifact

The published [Loom video walkthrough](https://www.loom.com/share/0e80929bf0f14bf6956f9e052d34ddc1) uses the same visual language and sequence as the live workspace: warm white workspace, dark privacy boundary, restrained green accents, 3D mascot, heterogeneous inputs, review board and manual handoff boundary. It is a recording of the local product, not a hosted inference endpoint.

For an online reviewer, use the [public replay demo](PUBLIC_DEMO.md). It renders the interface with synthetic inputs and preserved local output, without contacting Ollama or presenting a hosted model endpoint.
