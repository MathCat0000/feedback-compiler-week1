import { chromium } from "../demo/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const output = join(root, "demo", "recordings", "feedback-compiler-demo.mov");
const sourceUrl = process.env.FEEDBACK_COMPILER_RECORDING_URL || "http://127.0.0.1:5173/?demo=linear#top";
const executablePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const framesDir = join(tmpdir(), `feedback-compiler-dom-frames-${Date.now()}`);
const fps = 12;
let frameIndex = 0;

mkdirSync(framesDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ["--disable-gpu", "--font-render-hinting=none"]
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1
});
const page = await context.newPage();

await page.goto(sourceUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);

async function captureFrame() {
  const path = join(framesDir, `frame-${String(frameIndex).padStart(5, "0")}.png`);
  await page.screenshot({ path, animations: "disabled" });
  frameIndex += 1;
}

async function hold(milliseconds) {
  const interval = 1000 / fps;
  const count = Math.max(1, Math.round(milliseconds / interval));
  for (let index = 0; index < count; index += 1) {
    await captureFrame();
    await page.waitForTimeout(interval);
  }
}

const nextScene = page.getByRole("button", { name: "Next scene" });
for (let scene = 0; scene < 6; scene += 1) {
  await hold(2100);
  if (scene < 5) {
    await nextScene.click();
    await page.waitForTimeout(250);
  }
}

await context.close();
await browser.close();

console.log(`captured ${frameIndex} DOM frames in ${framesDir}`);
execFileSync(join(root, "scripts", ".build", "encode-demo-frames"), [output, framesDir], { stdio: "inherit" });
