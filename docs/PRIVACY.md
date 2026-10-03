# Privacy boundary

## The promise

Feedback Compiler is local-first: the model runs on the same computer as the workspace, so the demo does not require sending feedback to a hosted inference service. During a normal session, the active input and output are kept in memory and disappear when the page is closed.

The repository contains synthetic examples and small, attributed public-data input shapes. It does not contain private client feedback or private team transcripts.

## What this does not promise

“Local” is a boundary, not a complete threat model. Sensitive material can still leave the intended boundary through:

- downloaded or exported files;
- screenshots and copied text;
- backups and synchronisation services;
- browser extensions;
- other people or processes with access to the computer;
- derived output that repeats confidential information.

The product therefore does not present privacy as an automatic property of using a local model.

## Safe operating rules

For real work:

1. remove names, email addresses, customer identifiers and unnecessary links;
2. use pseudonymous source IDs;
3. keep raw input outside the repository;
4. define a retention and deletion rule before a pilot;
5. protect exports and delete them when they are no longer needed;
6. review the generated result before sharing it;
7. verify the computer’s network and backup settings before making an operational privacy claim.

The handoff controls prepare text for another tool but do not authenticate, publish or modify a remote system.

## Evidence and remaining work

The project includes a privacy-mode evaluation that keeps hashes and validation metadata rather than raw per-case text. Hashes are integrity references, not anonymisation: predictable text can still be guessed and compared.

Before a real pilot, the project still needs an explicit redaction layer, session deletion controls, a tested network-boundary check, documented backup assumptions and a threat-model review. Transcript use also needs timestamp-level provenance and separate validation.
