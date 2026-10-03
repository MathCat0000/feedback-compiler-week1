# Public replay demo

The repository includes a public-safe replay mode for reviewers who cannot run Ollama locally.

The page displays a prominent notice explaining this boundary: the online page is a static replay, while live inference requires cloning the repository, installing Ollama, downloading `gemma4:e2b-it-qat` and starting the local workspace.

## What it does

Open the app with `?demo=public` to see the same product flow using:

- synthetic heterogeneous inputs;
- a preserved output from a local run;
- source IDs and review lanes;
- manual handoff controls that only prepare text.

The replay does not call Ollama, does not require a model download and does not send input to a hosted inference endpoint. It is evidence of the interface and workflow, not a hosted version of the model.

## URL after GitHub Pages deployment

The repository workflow publishes the static build at:

```text
https://mathcat0000.github.io/feedback-compiler-week1/?demo=public
```

The URL becomes available after the `Deploy public replay demo` GitHub Actions workflow succeeds. If GitHub Pages has not been enabled for the repository yet, open **Settings → Pages** and select **GitHub Actions** as the source, then re-run the workflow.

## Local preview of the public version

From the repository root:

```bash
npm install --prefix demo
npm run demo:build
npm run demo:preview
```

Open:

```text
http://localhost:4173/feedback-compiler-week1/?demo=public
```

For a root-path local preview instead, run `npm run demo:build` without `VITE_BASE` and open `http://localhost:4173/?demo=public`.

## Run the real local compiler

The public replay is not the live model. To use the actual compiler:

```bash
git clone https://github.com/MathCat0000/feedback-compiler-week1.git
cd feedback-compiler-week1
npm install --prefix demo
npm run model:pull -- --model gemma4:e2b-it-qat
npm run app
```

Then open `http://localhost:5173/#workspace`. The first model download needs internet access; subsequent inference stays on the local computer through Ollama. See [Local setup](LOCAL_QUICKSTART.md) for requirements and privacy boundaries.

## Local product versus public replay

| Surface | Model call | Purpose |
| --- | --- | --- |
| `http://localhost:5173/#workspace` | Ollama on the same computer | Real local inference and editable feedback |
| `...?demo=public` | None | Public product walkthrough with fixed synthetic evidence |

Do not expose port `11434` or tunnel the local Ollama service to make the public page interactive. The privacy boundary is part of the product claim.
