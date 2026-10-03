import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { postProcessOutput, validateOutput, schemaForCase, userPrompt } from "./evaluate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACK_PATH = path.join(ROOT, "fixtures", "public", "feedback_compiler_public_input_pack_v1.json");
const SCHEMA_PATH = path.join(ROOT, "output-schema.json");
const PROMPT_PATH = path.join(ROOT, "system-prompt.txt");
const RUNS_PATH = path.join(ROOT, "runs", "public");
const DEFAULT_MODEL = "gemma4:e2b-it-qat";
const execFileAsync = promisify(execFile);
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const nowId = () => new Date().toISOString().replace(/[:.]/g, "-");
const safe = (value) => value.replace(/[^a-zA-Z0-9._-]+/g, "-");
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

function args(argv) {
  const out = { model: process.env.OLLAMA_MODEL || DEFAULT_MODEL, baseUrl: process.env.OLLAMA_URL || "http://127.0.0.1:11434", timeoutMs: 120000, retries: 1, numCtx: 4096, temperature: 0, think: false, privacy: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--model") out.model = argv[++i];
    else if (arg === "--base-url") out.baseUrl = argv[++i];
    else if (arg === "--timeout-ms") out.timeoutMs = Number(argv[++i]);
    else if (arg === "--retries") out.retries = Number(argv[++i]);
    else if (arg === "--num-ctx") out.numCtx = Number(argv[++i]);
    else if (arg === "--temperature") out.temperature = Number(argv[++i]);
    else if (arg === "--think") { const value = argv[++i]; if (!["true", "false"].includes(value)) throw new Error(`--think expects true or false, got: ${value}`); out.think = value === "true"; }
    else if (arg === "--privacy") out.privacy = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

async function requestJson(url, init, timeoutMs) {
  const args = ["--silent", "--show-error", "--fail", "--location", "--max-time", String(Math.max(1, Math.ceil(timeoutMs / 1000)))];
  if (init?.method) args.push("--request", init.method);
  for (const [key, value] of Object.entries(init?.headers || {})) args.push("--header", `${key}: ${value}`);
  if (init?.body) args.push("--data-raw", init.body);
  args.push(url);
  try {
    const { stdout } = await execFileAsync("curl", args, { timeout: timeoutMs + 1500, maxBuffer: 32 * 1024 * 1024 });
    try { return JSON.parse(stdout); } catch { throw new Error(`Response was not JSON: ${stdout.slice(0, 500)}`); }
  } catch (error) {
    if (error.killed || error.code === "ETIMEDOUT" || error.signal === "SIGTERM") {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`);
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw error;
  }
}

async function requestJsonWithRetry(url, init, timeoutMs, retries) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try { return await requestJson(url, init, timeoutMs); }
    catch (error) {
      lastError = error;
      if (error.name !== "TimeoutError" || attempt >= retries) throw error;
    }
  }
  throw lastError;
}

function publicPrompt(item) {
  const input = { case_id: item.case_id, title: item.title, format: item.input_type, feedback: item.feedback.map(({ id, source, text }) => ({ id, source, text, format: item.input_type })) };
  return userPrompt(input);
}

function summarizeCase(item, parsed, validation, runtimeError, inferenceMs) {
  const lengths = item.feedback.map((entry) => entry.text.length);
  const nonEmpty = parsed ? Object.entries(parsed).filter(([key, value]) => key !== "notes" && Array.isArray(value) && value.length > 0).map(([key]) => key) : [];
  return {
    case_id: item.case_id,
    input_type: item.input_type,
    public_dataset: item.public_dataset,
    input_chars: lengths.reduce((sum, value) => sum + value, 0),
    source_count: item.feedback.length,
    runtime_error: runtimeError,
    schema_valid: !runtimeError && validation.schemaErrors.length === 0,
    provenance_valid: !runtimeError && validation.provenanceErrors.length === 0,
    populated_categories: nonEmpty,
    inference_ms: inferenceMs,
    semantic_status: "NOT_GOLD_NEEDS_REVIEW"
  };
}

function report(summary, config, cases) {
  const typeCounts = Object.fromEntries([...new Set(cases.map((item) => item.input_type))].map((type) => [type, cases.filter((item) => item.input_type === type).length]));
  const lines = [
    "# Feedback Compiler — Public Input Pack Evaluation",
    "",
    `Run: \`${summary.run_id}\``,
    `Model: \`${config.model}\``,
    `Thinking: **${config.think ? "enabled" : "disabled"}**`,
    `Pack: [\`${config.pack_file}\`](../${config.pack_file})`,
    "",
    "## Gate results",
    "",
    `- Cases executed: **${summary.cases_executed}**`,
    `- Runtime failures: **${summary.runtime_failures}**`,
    `- Schema-valid: **${summary.schema_valid}/${summary.cases_executed}**`,
    `- Provenance-valid: **${summary.provenance_valid}/${summary.cases_executed}**`,
    `- Input types: **${Object.entries(typeCounts).map(([key, value]) => `${key}=${value}`).join(", ")}**`,
    `- First inference: **${summary.first_inference_ms ?? "—"} ms**`,
    `- Warm mean: **${summary.warm_inference_mean_ms ?? "—"} ms**`,
    "",
    "## Per-case structural evaluation",
    "",
    "| Case | Type | Dataset | Chars | Runtime | Schema | Provenance | Populated categories | Semantic status |",
    "|---|---|---|---:|---|---|---|---|---|",
    ...cases.map((item) => `| ${item.case_id} | ${item.input_type} | ${item.public_dataset} | ${item.input_chars} | ${item.runtime_error ? "FAIL" : "OK"} | ${item.schema_valid ? "OK" : "FAIL"} | ${item.provenance_valid ? "OK" : "FAIL"} | ${item.populated_categories.join(", ") || "none"} | ${item.semantic_status} |`),
    "",
    "## Interpretation",
    "",
    "This run tests transport, structured-output validity, provenance preservation and input-shape tolerance. It does not claim semantic accuracy: the source datasets do not contain Feedback Compiler gold labels for requests, decisions, conflicts, duplicates, questions and deadlines.",
    "",
    "The pack is a public-data proxy. BANKING77 supplies customer-service queries, OASST1 supplies human-generated multilingual/chat messages, and QMSum supplies meeting-transcript excerpts. None is evidence that the system generalizes to private Slack or corporate email.",
    "",
    "Next evidence gate: add a small redacted first-party set with human-reviewed gold labels, then compare semantic performance without mixing public proxy scores with workplace scores."
  ];
  return lines.join("\n") + "\n";
}

const main = async () => {
  const config = args(process.argv.slice(2));
  const pack = await readJson(PACK_PATH);
  const schema = await readJson(SCHEMA_PATH);
  const systemPrompt = await readFile(PROMPT_PATH, "utf8");
  const tags = await requestJson(`${config.baseUrl}/api/tags`, {}, config.timeoutMs);
  const installed = (tags.models || []).some((item) => item.name === config.model);
  if (!installed) throw new Error(`Model ${config.model} is not installed; no model substitution was made.`);
  const runId = `${nowId()}-${safe(config.model)}`;
  const runPath = path.join(RUNS_PATH, runId);
  await mkdir(path.join(runPath, "cases"), { recursive: true });
  const cases = [];
  for (const item of pack.cases) {
    const sourceIds = item.feedback.map((entry) => entry.id);
    const prompt = publicPrompt(item);
    const requestBody = { model: config.model, stream: false, think: config.think, format: schemaForCase(schema, sourceIds), options: { num_ctx: config.numCtx, temperature: config.temperature }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }] };
    const started = Date.now();
    let apiResponse = null; let rawContent = null; let modelParsed = null; let parsed = null; let runtimeError = null;
    try {
      apiResponse = await requestJsonWithRetry(`${config.baseUrl}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(requestBody) }, config.timeoutMs, config.retries);
      rawContent = apiResponse?.message?.content ?? null;
      if (typeof rawContent !== "string") throw new Error("Ollama response did not contain message.content");
      modelParsed = JSON.parse(rawContent);
      parsed = postProcessOutput(modelParsed, { feedback: item.feedback.map((entry) => ({ ...entry, format: item.input_type })), format: item.input_type });
    } catch (error) { runtimeError = { name: error.name, message: error.message }; }
    const inferenceMs = Date.now() - started;
    const validation = parsed ? validateOutput(parsed, new Set(sourceIds)) : { schemaErrors: ["No parsed output available because the Ollama request failed"], provenanceErrors: [] };
    const result = summarizeCase(item, parsed, validation, runtimeError, inferenceMs);
    cases.push(result);
    await writeFile(path.join(runPath, "cases", `${item.case_id}.json`), json(config.privacy ? { case_id: item.case_id, input_sha256: sha256(JSON.stringify(item.feedback)), parsed_sha256: parsed ? sha256(JSON.stringify(parsed)) : null, validation, runtime_error: runtimeError, timing: { inference_ms: inferenceMs }, semantic_status: result.semantic_status } : { ...item, user_prompt: prompt, request: requestBody, response_raw: rawContent, api_response: apiResponse, parsed_output: parsed, model_output: modelParsed, validation, runtime_error: runtimeError, timing: { inference_ms: inferenceMs, api_total_duration_ns: apiResponse?.total_duration ?? null, prompt_eval_duration_ns: apiResponse?.prompt_eval_duration ?? null, eval_duration_ns: apiResponse?.eval_duration ?? null }, semantic_status: result.semantic_status }));
    console.log(`${item.case_id}\t${runtimeError ? "RUNTIME_FAIL" : result.schema_valid && result.provenance_valid ? "STRUCTURE_OK" : "STRUCTURE_FAIL"}\t${inferenceMs}ms`);
  }
  const times = cases.map((item) => item.inference_ms).filter(Number.isFinite);
  const summary = { run_id: runId, cases_executed: cases.length, runtime_failures: cases.filter((item) => item.runtime_error).length, schema_valid: cases.filter((item) => item.schema_valid).length, provenance_valid: cases.filter((item) => item.provenance_valid).length, first_inference_ms: times[0] ?? null, warm_inference_mean_ms: times.length > 1 ? Math.round(times.slice(1).reduce((sum, value) => sum + value, 0) / (times.length - 1)) : null, generated_at: new Date().toISOString() };
  const runConfig = { ...config, run_id: runId, pack_file: path.relative(ROOT, PACK_PATH), pack_sha256: sha256(await readFile(PACK_PATH)), schema_sha256: sha256(await readFile(SCHEMA_PATH)), system_prompt_sha256: sha256(systemPrompt), cases: pack.cases.map((item) => item.case_id), generated_at: new Date().toISOString() };
  await writeFile(path.join(runPath, "run-config.json"), json(runConfig));
  await writeFile(path.join(runPath, "system-prompt.txt"), systemPrompt);
  await writeFile(path.join(runPath, "output-schema.json"), json(schema));
  await writeFile(path.join(runPath, "pack-manifest.json"), json({ file: path.relative(ROOT, PACK_PATH), sha256: runConfig.pack_sha256, cases: pack.cases.map((item) => ({ case_id: item.case_id, public_dataset: item.public_dataset, source_row: item.source_row })) }));
  await writeFile(path.join(runPath, "summary.json"), json(summary));
  await writeFile(path.join(runPath, "case-results.json"), json(cases));
  const markdown = report(summary, { ...config, pack_file: path.relative(ROOT, PACK_PATH) }, cases);
  await writeFile(path.join(runPath, "evaluation-report.md"), markdown);
  await writeFile(path.join(ROOT, "docs", "PUBLIC_DATASET_EVALUATION_REPORT.md"), markdown);
  console.log(`Run: ${runId}`);
  console.log(`Artifacts: ${path.relative(ROOT, runPath)}`);
  console.log(`Summary: ${summary.schema_valid}/${summary.cases_executed} schema-valid; ${summary.provenance_valid}/${summary.cases_executed} provenance-valid; ${summary.runtime_failures} runtime failures`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
