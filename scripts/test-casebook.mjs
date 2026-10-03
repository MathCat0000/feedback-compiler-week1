import { readFile } from "node:fs/promises";

const path = new URL("../fixtures/feedback_compiler_heterogeneous_v1.json", import.meta.url);
const book = JSON.parse(await readFile(path, "utf8"));
const publicPath = new URL("../fixtures/public/feedback_compiler_public_input_pack_v1.json", import.meta.url);
const publicPack = JSON.parse(await readFile(publicPath, "utf8"));
const requiredInputTypes = new Set(["slack_thread", "email_thread", "meeting_notes", "support_ticket", "cross_functional_thread", "multilingual_chat", "adversarial_feedback", "transcript_excerpt"]);
const seenTypes = new Set();
const failures = [];

for (const item of book.cases || []) {
  seenTypes.add(item.input_type);
  if (!item.case_id || !item.input_type || !Array.isArray(item.feedback) || item.feedback.length === 0) failures.push(`${item.case_id || "unknown"}: invalid case envelope`);
  const ids = item.feedback.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) failures.push(`${item.case_id}: duplicate source ID`);
  for (const entry of item.feedback) {
    if (!entry.id || !entry.source || !entry.text) failures.push(`${item.case_id}: incomplete feedback entry`);
  }
}

for (const type of requiredInputTypes) if (!seenTypes.has(type)) failures.push(`missing input type ${type}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`heterogeneous casebook: ${book.cases.length} cases, ${seenTypes.size} input types, valid envelope`);

const publicFailures = [];
const publicIds = new Set();
for (const item of publicPack.cases || []) {
  if (!item.case_id || publicIds.has(item.case_id) || !item.input_type || !item.public_dataset || !item.dataset_license || !Array.isArray(item.feedback) || item.feedback.length === 0) publicFailures.push(`${item.case_id || "unknown"}: invalid public case envelope`);
  publicIds.add(item.case_id);
  for (const entry of item.feedback || []) if (!entry.id || !entry.source || !entry.text) publicFailures.push(`${item.case_id || "unknown"}: incomplete public feedback entry`);
}
if (publicFailures.length) {
  console.error(publicFailures.join("\n"));
  process.exit(1);
}
console.log(`public input pack: ${publicPack.cases.length} attributed cases, ${new Set(publicPack.cases.map((item) => item.public_dataset)).size} datasets, valid envelope`);
