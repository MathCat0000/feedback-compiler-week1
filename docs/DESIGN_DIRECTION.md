# Design direction

## Chosen direction: Editorial Utility / Human Proof

The product should look like a small, serious local instrument rather than a generic AI SaaS landing page.

### Visual language

- Typography-first hierarchy: the message and the structured result are the visual identity.
- Paper-light canvas with black type, a restrained green operational accent, warm gold for decisions and coral for unresolved tension.
- Bento-like asymmetric composition where each block has one job: input, result, privacy, proof video.
- Scroll-linked motion as explanation: collect, compile and review become a sequence, not decoration.
- Human proof can be shown through a real local-use video in a separate case-study surface, replacing stock imagery and generic AI illustrations. It is not part of the product workflow.
- High contrast, keyboard-accessible controls and `prefers-reduced-motion` support.

## Mascot direction: Signal Buddy

The mascot is an original transparent 3D render stored at `demo/public/mascot-signal-buddy.png` and rendered locally by `TypeMascot`. It is a small hovering robot with a satin off-white shell, recessed black glass face and minimal pixel expression. The design keeps three recognisable signals at small sizes: silhouette, eyes and the green status light.

This direction follows three practical criteria from current mascot work: a character must work as a still, a small UI accent and a short motion beat; it should have a role inside the product instead of being a generic decorative blob; and a real 3D asset should have a repeatable material and expression system. The generated asset is original and used as a product-bound bitmap, not loaded from a third-party URL.

### What we deliberately avoid

- Generic purple gradients and floating AI chat bubbles.
- Glassmorphism as the default surface language.
- Autoplay video backgrounds and scroll-jacking.
- Motion that does not explain a state change.
- Sending a friend's recording or client feedback to a third-party upload service.

## Product hierarchy

1. Hero: state the promise — fragmented feedback becomes reviewable work.
2. Live workspace: let the visitor paste source-linked feedback and compile locally.
3. Structured export: make `.txt` and `.json` visible as concrete outcomes.
4. Human proof: link to an optional case-study recording of the real workflow; keep it outside the product UI.
5. Scroll story: explain the pipeline and its provenance model.
6. Privacy boundary: state what is local, what is in-memory and what remains unresolved.

## Output representation

The primary output is not a flat table. It is a relationship-aware decision board:

- `Do`: actionable requests, with matching deadlines attached to the same card;
- `Decide`: confirmed decisions;
- `Clarify`: conflicts and unresolved questions;
- `Trace & timing`: duplicates and residual deadlines that need provenance inspection.

This solves the aggregation problem at the interface level: a user sees the operational unit first and the evidence relationship inside it. The canonical JSON remains available through `.json` export, while `.txt` is the readable handoff format.

## Optional proof-video rules

The product does not ingest video. A proof recording belongs in a separate case-study page, DEV article or presentation layer. It must not be uploaded, copied into the product repository or used as model input. The final repository should include the recording only if the person shown has explicitly agreed to its publication; otherwise keep it outside the repository as a local demo asset.

The video should show the workflow, not expose real customer data. Use anonymized or synthetic feedback, visible source IDs and the final structured export. Add captions if the recording contains spoken explanation.

## Research signal

The direction is based on convergent 2025–2026 design signals rather than one visual trend: modular bento layouts, motion used as information, typography-led identity, tactile/human media and accessibility-aware motion.

- [Adfirm — Bento grids and motion-first layouts](https://www.adfirm.net/blog/bento-grids-motion-first-2026/)
- [Bubble — Web Design Trends 2026](https://bubble.io/blog/web-design-trends/)
- [WE — Web design trends 2026](https://we.inc/blog/website-design-trends-2026)
- [Creative Bloq — Texture, warmth and tactile rebellion](https://www.creativebloq.com/design/graphic-design/2026-graphic-design-trends)
- [Creative Bloq — Why mascots are becoming brand systems](https://www.creativebloq.com/design/branding/the-most-important-branding-tool-for-2026-isnt-what-you-think)
- [DigitalArts — 3D brand mascot guide](https://bydigitalarts.com/insights/3d-brand-mascots-animated-logo)

The selection criterion is not novelty alone: every visual choice must make the local workflow, privacy boundary or structured output easier to understand.
