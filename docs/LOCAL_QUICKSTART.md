# Local setup

Feedback Compiler is delivered as a local web application. The browser is the visible workspace and the language model runs on the same computer.

## Requirements

- macOS or Linux;
- Node.js 20 or newer;
- [Ollama](https://ollama.com/download);
- approximately 4.3 GB of free disk space for the default model;
- a browser that can open a local address.

## First setup

From the repository root:

```bash
npm install --prefix demo
npm run model:pull -- --model gemma4:e2b-it-qat
npm run setup:local
```

The first model download needs internet access. The command checks that the local model is available before the app is opened. Once the model is installed, compilation can run without internet as long as the local services remain available.

## Start the application

```bash
npm run app
```

Open [http://localhost:5173/#workspace](http://localhost:5173/#workspace).

For a first walkthrough:

1. choose `Load mixed set`;
2. review the six example inputs;
3. click `Compile locally`;
4. read the `Do`, `Decide`, `Clarify` and `Trace & timing` areas;
5. download a structured result or prepare a paste-ready handoff.

The handoff buttons do not sign in, publish or edit Slack, Notion, Linear, Jira or email. They prepare text so the person remains the final approver.

## Using real feedback safely

Before a real pilot:

1. use pseudonymous source IDs;
2. remove names, addresses, customer identifiers and unnecessary URLs;
3. keep raw material outside the repository;
4. decide how long the session and exports should exist;
5. review the derived result before sharing it.

The demo is local-first, not automatically safe for every kind of confidential information. See [Privacy](PRIVACY.md) for the boundary and residual risks.

## Useful checks

```bash
npm run setup:local
npm test
npm run demo:build
npm run demo:video
```

The evaluation and research files are optional reading. They document how the experiment was checked; they are not needed to use the workspace.
