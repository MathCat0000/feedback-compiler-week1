# Hacktoberfest Weekend Challenge checklist

Source of truth: [DEV Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01) and its [launch post](https://dev.to/devteam/join-the-hacktoberfest-weekend-challenge-build-for-a-friend-2450-in-prizes-across-17-winners-1aj5).

The official page says the project must be a new build using open-source AI at its core, solve a real problem for a friend or loved one, show the demo and code, and explain why open innovation matters. The official judging criteria weight writing quality most heavily, followed by relevance, creativity, technical execution and optional partner technology.

## Submission fields

| Requirement | Current evidence | Status before publishing |
| --- | --- | --- |
| What I Built | `README.md` and `docs/PRODUCT_GUIDE.md` | ready for factual review |
| Who it is for | Workflow shaped around a friend receiving team feedback | add consent and handoff evidence; do not claim successful use yet |
| Demo | Local app at `http://localhost:5173`, verified `demo/recordings/feedback-compiler-demo.mov`, and a GitHub Pages public replay workflow | publish the post only after the public replay URL is reachable; do not present it as live model inference |
| Code | Repository source and reproducible commands | add public repository URL |
| Open-source AI | Ollama + local `gemma4:e2b-it-qat` run, with preserved artifacts and `npm run setup:local` | keep exact model tag and license record in final post |
| Why open innovation matters | local inference, model swap, privacy boundary, inspectable artifacts | ready, keep claims bounded |
| Agent session | Not included | optional; intentionally omitted to avoid exposing the working transcript and project context |
| Prize category | Best Use of Gemma is potentially applicable | enter only if the published project genuinely uses and documents Gemma |
| Required tags | `#devchallenge #weekendchallenge #hf26challenge` | include in DEV post |
| Language | English draft | required for prize eligibility according to the challenge FAQ |

## Date gate

The challenge page lists submissions due on **October 5, 2026 at 6:59 AM UTC**, which is **8:59 AM CEST**. Treat that as the publication gate; do not use the local demo or an unverified GitHub URL as submission evidence.

## Evidence checklist

- [ ] Confirm the repository and project were created inside the challenge window.
- [ ] Add the final public repository URL.
- [ ] Upload `demo/recordings/feedback-compiler-demo.mov` or add a concise public video URL.
- [x] Verify the video shows the current interface, not an obsolete layout.
- [x] Include the new-user path: Ollama install → model pull → local app → compile → review.
- [ ] Record the actual handoff to the intended person, only with consent.
- [x] Keep all examples in the public post synthetic or anonymized.
- [x] Link the 30-case evaluation and the manual review limits.
- [x] State that `28 PASS_HEURISTIC / 2 PARTIAL_HEURISTIC / 0 FAIL_HEURISTIC` is not semantic accuracy.
- [x] State that manual review found `13 ACCEPT / 16 PARTIAL / 1 REJECT`.
- [x] Name the exact local model and commands that were actually run.
- [ ] Remove placeholders before publishing.
