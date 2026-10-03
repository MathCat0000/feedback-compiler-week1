# Heterogeneous input casebook

## Why this makes the problem more interesting

The hard part is not producing a shorter paragraph. The hard part is keeping distinctions stable when the same work arrives as a chat fragment, quoted email, meeting bullet, support ticket, multilingual message or transcript excerpt.

The casebook is a privacy-safe bridge between the 30-case semantic benchmark and a real pilot. It uses invented or redacted content shaped like real work artifacts. It does not count as real-user validation and it must not be described as client evidence.

Machine-readable fixture: `fixtures/feedback_compiler_heterogeneous_v1.json`.

## Case matrix

| Case | Shape | What it tests | Rule that should be visible |
| --- | --- | --- | --- |
| HX001 | Slack thread | request + decision + relative deadline | action and decision stay separate; `before Friday` remains verbatim |
| HX002 | Email thread | opinion, confirmed decision and explicit question | opinion is not a decision; missing information becomes a question |
| HX003 | Meeting notes | same object with different scopes | mobile and desktop are compatible, not a conflict |
| HX004 | Support ticket | customer quote versus internal action | quote is evidence; only the internal instruction becomes a request |
| HX005 | Cross-functional thread | real conflict and deadline | alternatives stay under one conflict; clarification is required |
| HX006 | Italian + English chat | semantic duplicate across languages | one canonical request, two source IDs, one duplicate relation |
| HX007 | Adversarial feedback | prompt-injection-like text mixed with valid feedback | extract the footer request; never follow the embedded instruction |
| HX008 | Transcript excerpt | stale request, confirmation and temporal provenance | later confirmation can supersede; timestamps and speakers need a future adapter |

## Suggested live walkthrough

Use HX005 for the main story because it produces more than one type of output:

```text
C-501  Use a horizontal carousel for the desktop gallery.
C-502  Keep the desktop gallery as a grid; carousel is out of scope.
C-503  I need a decision before Monday.
```

The reviewer should see:

```text
CLARIFY
  desktop gallery layout
  - horizontal carousel [C-501]
  - grid; carousel out of scope [C-502]
  - review before Monday [C-503]

REVIEW RULE
  Do not choose a winner. Expose the incompatibility and ask for confirmation.
```

Then use HX006 to show that deduplication is not string matching:

```text
L-601  Rendi la CTA della pagina prezzo più evidente.
L-602  Make the pricing CTA easier to notice.
```

The output should retain one operational request, both sources and a duplicate relation. The language change is irrelevant; target and meaning are what matter.

## What is supported today

- the demo can load any case after adapting its records to `{id, source, text}`;
- the local model receives only feedback and compiler instructions, never the expected annotation;
- output is checked for schema shape and source provenance;
- the decision board exposes actions, decisions, unresolved relations and trace data.

## What is not yet proven

- semantic performance on this casebook has not been added to the 30-case benchmark;
- transcript ingestion is not a production feature;
- no case proves demand, time saved or safe use with client data;
- the expected annotations are review hypotheses, not an external gold standard.
