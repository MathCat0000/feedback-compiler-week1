import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const DEFAULT_MODEL = "gemma4:e2b-it-qat";
const model = readFlag("--model") || process.env.FEEDBACK_COMPILER_MODEL || DEFAULT_MODEL;
const shouldPull = process.argv.includes("--pull");
const shouldStart = !process.argv.includes("--no-start");
const ollamaBaseUrl = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function commandExists(command) {
  const result = spawnSync(process.platform === "win32" ? "where" : "which", [command], { stdio: "ignore" });
  return result.status === 0;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

async function getJson(path) {
  const response = await fetch(`${ollamaBaseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

async function waitForOllama(timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      return await getJson("/api/version");
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function startOllamaIfNeeded() {
  const current = await waitForOllama(1500);
  if (current) return current;
  if (!shouldStart) return null;

  if (process.platform === "darwin") {
    const opened = spawnSync("open", ["-a", "Ollama"], { stdio: "ignore" });
    if (opened.status !== 0) {
      console.warn("Ollama non risulta avviabile automaticamente. Apri l'app Ollama e rilancia questo comando.");
    }
  } else if (commandExists("ollama")) {
    const child = spawn("ollama", ["serve"], { detached: true, stdio: "ignore" });
    child.unref();
  }
  return waitForOllama();
}

async function main() {
  if (process.versions.node.split(".").map(Number)[0] < 20) {
    throw new Error("Node.js 20 o superiore è richiesto.");
  }
  if (!commandExists("ollama")) {
    throw new Error("Ollama non è installato. Installalo da https://ollama.com/download e rilancia npm run setup:local.");
  }

  const version = await startOllamaIfNeeded();
  if (!version) {
    throw new Error(`Ollama non risponde su ${ollamaBaseUrl}. Avvialo e rilancia npm run setup:local.`);
  }

  let tags = await getJson("/api/tags");
  let models = (tags.models || []).map((entry) => entry.name || entry.model).filter(Boolean);
  if (!models.includes(model)) {
    if (!shouldPull) {
      throw new Error(`Modello ${model} assente. Esegui: npm run model:pull -- --model ${model}`);
    }
    console.log(`Scarico ${model}. Il primo download può richiedere diversi minuti e alcuni GB di spazio.`);
    await run("ollama", ["pull", model]);
    tags = await getJson("/api/tags");
    models = (tags.models || []).map((entry) => entry.name || entry.model).filter(Boolean);
  }
  if (!models.includes(model)) throw new Error(`Il pull è terminato ma ${model} non appare in /api/tags.`);

  console.log(`Ollama ${version.version || "ready"} pronto su ${ollamaBaseUrl}`);
  console.log(`Modello disponibile: ${model}`);
  console.log("Avvio: npm run demo:dev");
  console.log("Poi apri: http://localhost:5173/#workspace");
}

main().catch((error) => {
  console.error(`setup locale fallito: ${error.message}`);
  process.exitCode = 1;
});
