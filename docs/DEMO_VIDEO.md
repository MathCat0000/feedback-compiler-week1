# Video walkthrough

Artifact: [feedback-compiler-demo.mov](../demo/recordings/feedback-compiler-demo.mov)

The approximately 13-second silent walkthrough is captured from the rendered application itself, so the video and the live interface share one layout source. It mirrors the visible product flow:

1. the local workspace and its purpose;
2. six heterogeneous input surfaces;
3. local compilation while the source remains attached;
4. a review board with actions, decisions and questions;
5. a paste-ready handoff that still requires a person’s approval;
6. the privacy boundary and its limits.

The visual treatment is the live app: warm white workspace, dark privacy boundary, restrained green accents and the 3D mascot. All examples are synthetic or privacy-safe.

The recorded path holds the example result stable so the timing and layout can be reviewed consistently. The live workspace still performs the real local compilation when the person clicks `Compile locally`; the evaluation reports contain the evidence for those model runs.

To regenerate the artifact after a product change:

```bash
npm run demo:dev
npm run demo:video
```

The video is presentation material, not a claim that arbitrary production feedback will always be interpreted correctly. The experiment’s evidence is kept separately in the evaluation reports.
