# Model setup evidence

## Verified installation

- Ollama app/server: `0.35.0`
- Model: `gemma4:e2b-it-qat`
- Digest prefix: `07ea59a47401`
- Local size reported by Ollama: `4.3 GB`
- Context length: `131072`
- Quantization: `Q4_0`
- Required Ollama version: `0.30.5`
- Download result: successful, SHA-256 verification and manifest write completed

## New-user setup path

The repository does not bundle model weights. Each user installs Ollama once, then downloads the exact model tag locally:

```bash
npm install --prefix demo
npm run model:pull -- --model gemma4:e2b-it-qat
npm run setup:local
npm run demo:dev
```

`npm run model:pull` is explicit because it may download several GB. It opens the Ollama app on macOS when Ollama is installed but its server is not responding; on other systems it starts `ollama serve` when the CLI is available. It never silently replaces the selected model.

The setup script can check another tag without changing the repository:

```bash
npm run model:pull -- --model <ollama-tag>
FEEDBACK_COMPILER_MODEL=<ollama-tag> npm run setup:local
```

The demo then runs in the browser at `http://localhost:5173`, while inference remains on `127.0.0.1:11434`. The first model pull needs internet; inference after installation does not require internet. A static deployment cannot use the Vite proxy to reach the model on a user's computer.

## Recorded evaluation

- Final run: `runs/2026-10-03T07-25-19-209Z-gemma4-e2b-it-qat/`
- Configuration: `--think false`, `num_ctx=4096`, `temperature=0`, timeout `30000 ms`, one retry
- Result: 30/30 schema-valid, 30/30 provenance-valid, 0 runtime failures
- Heuristic: 28 PASS, 2 PARTIAL, 0 FAIL
- First inference: `3845 ms`; warm mean: `4424 ms`
- Post-processing: `deterministic-v2`; unit tests: 21/21 passed

The earlier full evaluation used `phi3:mini` and remains the frozen comparison baseline. It must not be conflated with the Gemma result.
