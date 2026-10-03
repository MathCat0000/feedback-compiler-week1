import { useEffect, useRef, useState } from "react";
import { buildOutputSchema, buildUserPrompt, DEFAULT_MODEL, SYSTEM_PROMPT, validateOutput } from "./compiler.js";
import demoCases from "./demoCases.json";
import heterogeneousCasebook from "../../fixtures/feedback_compiler_heterogeneous_v1.json";

const MASCOT_SRC = `${import.meta.env.BASE_URL}mascot-signal-buddy.png`;

const SAMPLE_FEEDBACK = [
  { id: "C-014", source: "Client", format: "slack_thread", text: "The hero feels too tall on mobile. Can we reduce the top padding before Friday?" },
  { id: "D-022", source: "Designer", format: "email_thread", text: "Keep the headline, but make the CTA more visible." },
  { id: "P-008", source: "PM", format: "meeting_notes", text: "The mobile layout should ship Thursday." }
];

const INPUT_FORMATS = [
  ["slack_thread", "Slack thread", "S"],
  ["email_thread", "Email", "@"],
  ["meeting_notes", "Meeting notes", "M"],
  ["support_ticket", "Support ticket", "T"],
  ["cross_functional_thread", "Team thread", "↔"],
  ["multilingual_chat", "Multilingual chat", "文"],
  ["transcript_excerpt", "Transcript", "◌"],
  ["custom", "Custom text", "+"]
];

const HETEROGENEOUS_MIX = [
  { id: "SL-001", source: "Slack / PM", format: "slack_thread", text: "The mobile hero still feels too tall. Can we reduce the top padding before Friday?" },
  { id: "EM-002", source: "Email / Client", format: "email_thread", text: "Thanks for the latest pass. The direction is much clearer. I would keep the current headline, but the subtitle still feels too formal for the audience we discussed. Could you propose two shorter alternatives and flag which one works best on mobile?" },
  { id: "MT-003", source: "Meeting / PM", format: "meeting_notes", text: "Decision: keep the existing CTA label. Open question: do we apply the new pricing hierarchy to the checkout flow too? The mobile layout needs to be ready by Thursday." },
  { id: "TK-004", source: "Ticket / Support", format: "support_ticket", text: "Several users report that the checkout button is hard to notice after the validation error. Reproduce on a narrow viewport, check the focus state, and report whether the issue is visual or functional." },
  { id: "CH-005", source: "Chat / ES + IT", format: "multilingual_chat", text: "La hero ocupa demasiado spazio su mobile. Please reduce the top padding, but keep the desktop composition unchanged." },
  { id: "TR-006", source: "Transcript / Research", format: "transcript_excerpt", text: "[00:18:42] Speaker 2: I am not asking for a redesign of the whole page. The important thing is that the first action is visible without scrolling. We should test the smaller header against the current conversion baseline before deciding. [00:19:11] Speaker 1: Agreed, but we still need someone to define the test window." }
];
const RECORDING_RESULT = {
  requests: [
    { text: "Reduce the top padding before Friday", source_ids: ["SL-001"] },
    { text: "Propose two shorter alternatives for the subtitle", source_ids: ["EM-002"] },
    { text: "Apply the new pricing hierarchy to the checkout flow", source_ids: ["MT-003"] },
    { text: "Reproduce the checkout issue on a narrow viewport", source_ids: ["TK-004"] },
    { text: "Reduce the top padding", source_ids: ["CH-005"] }
  ],
  decisions: [],
  conflicts: [],
  duplicates: [],
  open_questions: [
    { text: "Do we apply the new pricing hierarchy to the checkout flow too?", source_ids: ["MT-003"] },
    { text: "Define the test window", source_ids: ["TR-006"] }
  ],
  deadlines: [{ text: "Thursday", related_source_ids: ["MT-003"] }],
  notes: []
};
const OUTPUT_GROUPS = [
  ["requests", "Requests", "mint"],
  ["decisions", "Decisions", "gold"],
  ["conflicts", "Conflicts", "coral"],
  ["duplicates", "Duplicates", "blue"],
  ["open_questions", "Open questions", "violet"],
  ["deadlines", "Deadlines", "gold"]
];

const DESTINATIONS = [
  ["slack", "Slack", "S", "Paste-ready thread summary"],
  ["notion", "Notion", "N", "Paste-ready page block"],
  ["linear", "Linear", "L", "Paste-ready issue draft"],
  ["jira", "Jira", "J", "Paste-ready ticket"],
  ["email", "Email", "@", "Paste-ready message"]
];

const FLOW_CHANNELS = [
  ["slack_thread", "Slack", "S", "thread", "violet"],
  ["email_thread", "Email", "@", "thread", "coral"],
  ["meeting_notes", "Meeting notes", "M", "notes", "gold"],
  ["support_ticket", "Support ticket", "T", "ticket", "blue"],
  ["multilingual_chat", "Multilingual chat", "文", "chat", "mint"],
  ["transcript_excerpt", "Transcript", "◌", "excerpt", "ink"]
];

const emptyResult = { requests: [], decisions: [], conflicts: [], duplicates: [], open_questions: [], deadlines: [], notes: [] };

function sourceIdsFromFeedback(feedback) {
  return new Set(feedback.map((entry) => entry.id));
}

function displayItem(item, category) {
  if (category === "duplicates") return { text: item.canonical, sources: item.source_ids || [] };
  if (category === "conflicts") return { text: item.topic, sources: (item.items || []).flatMap((part) => part.source_ids || []), detail: item.items || [] };
  if (category === "deadlines") return { text: item.text, sources: item.related_source_ids || [], detail: item.related_request };
  return { text: item.text, sources: item.source_ids || [], detail: item.scope || item.basis || null };
}

function formatResultAsText(result, model) {
  const lines = [
    "FEEDBACK COMPILER — STRUCTURED OUTPUT",
    `Model: ${model}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "This file contains the reviewed structured output only. Source IDs are preserved; raw feedback is not included.",
    ""
  ];
  OUTPUT_GROUPS.forEach(([category, label]) => {
    lines.push(label.toUpperCase());
    const items = result[category] || [];
    if (!items.length) lines.push("- none");
    items.forEach((item) => {
      const view = displayItem(item, category);
      lines.push(`- ${view.text} [${view.sources.join(", ")}]`);
      if (category === "conflicts") (view.detail || []).forEach((part) => lines.push(`  * ${part.text} [${(part.source_ids || []).join(", ")}]`));
      if (category === "deadlines" && view.detail) lines.push(`  related request: ${view.detail}`);
    });
    lines.push("");
  });
  if (result.notes?.length) {
    lines.push("NOTES");
    result.notes.forEach((note) => lines.push(`- ${note}`));
  }
  return lines.join("\n");
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function SourcePills({ ids }) {
  return <span className="source-pills">{[...new Set(ids)].map((id) => <span className="source-pill" key={id}>{id}</span>)}</span>;
}

function TypeMascot({ mood = "idle", compact = false }) {
  return <div className={`type-mascot ${mood} ${compact ? "compact" : ""}`} aria-label="Feedback Compiler mascot" role="img"><img className="mascot-render" src={MASCOT_SRC} alt="" aria-hidden="true" /><span className="mascot-spark" aria-hidden="true">+</span></div>;
}

function formatLabel(format) {
  return INPUT_FORMATS.find(([value]) => value === format)?.[1] || "Custom text";
}

function formatMark(format) {
  return INPUT_FORMATS.find(([value]) => value === format)?.[2] || "+";
}

function DestinationActions({ result, onPrepare, notice }) {
  if (!result) return null;
  return <div className="handoff-panel">
    <div className="handoff-heading"><div><span className="panel-kicker">03 / HANDOFF</span><strong>Move the reviewed signal</strong><span>Prepare a paste-ready payload for the next tool. No remote write is performed.</span></div><TypeMascot mood="wave" compact /></div>
    <div className="destination-grid">
      {DESTINATIONS.map(([id, label, mark, hint]) => <button className={`destination-button ${id}`} type="button" key={id} onClick={() => onPrepare(id, label)}>
        <span className="destination-mark" aria-hidden="true">{mark}</span><span className="destination-copy"><strong>{label}</strong><small>{hint}</small></span><span className="destination-arrow" aria-hidden="true">↗</span>
      </button>)}
    </div>
    {notice && <p className="handoff-notice" role="status">{notice}</p>}
    <p className="handoff-footnote">The next step is prepared as text. You decide if and where to share it.</p>
  </div>;
}

function InputFlow({ publicDemo = false }) {
  return <section className="input-flow" aria-label="Heterogeneous inputs into local structured output">
    <div className="flow-copy"><span className="panel-kicker">ONE COMPILER / MANY SURFACES</span><strong>Different inputs.<br /><em>One local signal.</em></strong><span>Each source keeps its shape at intake. The compiler turns the fragments into the same reviewable output.</span></div>
    <div className="flow-rail flow-incoming"><span className="flow-label">INCOMING</span><div className="flow-channel-grid">{FLOW_CHANNELS.map(([format, label, mark, meta, tone]) => <div className={`flow-channel ${tone}`} key={format}><span className="flow-logo" aria-hidden="true">{mark}</span><span><strong>{label}</strong><small>{meta}</small></span></div>)}</div></div>
    <div className="flow-arrow" aria-hidden="true">→</div>
    <div className="flow-core"><div className="flow-core-orbit"><img src={MASCOT_SRC} alt="" aria-hidden="true" /></div><strong>{publicDemo ? "PRESERVED REPLAY" : "LOCAL COMPILER"}</strong><span>{publicDemo ? "synthetic output · review" : "Ollama · schema · review"}</span><small>{publicDemo ? "no model request" : "nothing leaves the laptop"}</small></div>
    <div className="flow-arrow" aria-hidden="true">→</div>
    <div className="flow-rail flow-outgoing"><span className="flow-label">STRUCTURED OUT</span><div className="flow-output-stack"><div className="flow-output-item do"><span>DO</span><strong>Actions</strong></div><div className="flow-output-item decide"><span>DECIDE</span><strong>Decisions</strong></div><div className="flow-output-item clarify"><span>ASK</span><strong>Conflicts & questions</strong></div></div><small className="flow-output-note">source IDs stay attached</small></div>
  </section>;
}

function BoardItem({ item, type, tone, deadline }) {
  return <article className={`board-item ${tone}`}><div className="board-item-marker">{type}</div><div className="board-item-copy"><strong>{item.text}</strong>{item.scope && <span className="board-context">scope: {item.scope}</span>}{deadline && <span className="board-deadline">due {deadline.text}</span>}{item.items && <div className="board-alternatives">{item.items.map((part, index) => <span key={`${part.text}-${index}`}>{part.text}</span>)}</div>}</div><div className="board-item-meta"><SourcePills ids={item.source_ids || item.related_source_ids || item.items?.flatMap((part) => part.source_ids || []) || []} /><span className="review-chip">REVIEW</span></div></article>;
}

function OutputBoard({ result }) {
  const deadlinesBySource = new Map((result.deadlines || []).flatMap((deadline) => (deadline.related_source_ids || []).map((sourceId) => [sourceId, deadline])));
  const actions = (result.requests || []).map((item) => ({ item, deadline: (item.source_ids || []).map((sourceId) => deadlinesBySource.get(sourceId)).find(Boolean) }));
  const decisions = result.decisions || [];
  const clarifications = [
    ...(result.conflicts || []).map((item) => ({ ...item, text: item.topic })),
    ...(result.open_questions || [])
  ];
  const traceItems = [...(result.duplicates || []).map((item) => ({ ...item, text: item.canonical })), ...(result.deadlines || []).filter((deadline) => !(deadline.related_source_ids || []).some((sourceId) => actions.some(({ item }) => item.source_ids?.includes(sourceId))))];
  const sourceCount = new Set([
    ...actions.flatMap(({ item }) => item.source_ids || []),
    ...decisions.flatMap((item) => item.source_ids || []),
    ...clarifications.flatMap((item) => item.source_ids || item.items?.flatMap((part) => part.source_ids || []) || [])
  ]).size;
  const lane = (title, eyebrow, items, tone, children) => <section className={`board-lane ${tone}`}><div className="board-lane-heading"><div><span>{eyebrow}</span><h4>{title}</h4></div><b>{String(items.length).padStart(2, "0")}</b></div>{items.length ? children : <div className="board-empty">Nothing in this lane.</div>}</section>;
  return <div className="output-board"><div className="board-intro"><TypeMascot mood="thinking" compact /><div><span className="panel-kicker">DECISION BOARD / AGGREGATED</span><h3>From fragments to a next move.</h3><p>Related deadlines, provenance and review state stay attached to the operational item.</p></div><div className="board-stats"><strong>{actions.length + decisions.length + clarifications.length}</strong><span>work items</span><strong>{sourceCount}</strong><span>sources</span></div></div><div className="board-lanes">{lane("Do", "ACTIONABLE", actions, "mint", actions.map(({ item, deadline }, index) => <BoardItem key={`action-${index}`} item={item} type="DO" tone="mint" deadline={deadline} />))}{lane("Decide", "CONFIRMED", decisions, "gold", decisions.map((item, index) => <BoardItem key={`decision-${index}`} item={item} type="DECIDE" tone="gold" />))}{lane("Clarify", "UNRESOLVED", clarifications, "coral", clarifications.map((item, index) => <BoardItem key={`clarify-${index}`} item={item} type={item.items ? "RESOLVE" : "ASK"} tone="coral" />))}</div>{traceItems.length > 0 && <section className="trace-board"><div className="board-lane-heading"><div><span>RELATIONS</span><h4>Trace & timing</h4></div><b>{String(traceItems.length).padStart(2, "0")}</b></div><div className="trace-list">{traceItems.map((item, index) => <div className="trace-row" key={`trace-${index}`}><span>{item.canonical ? "DUPLICATE" : "DEADLINE"}</span><strong>{item.canonical || item.text}</strong><SourcePills ids={item.source_ids || item.related_source_ids || []} /></div>)}</div></section>}</div>;
}

const LINEAR_SOURCES = [["S", "Slack", "THREAD", "violet"], ["@", "Email", "THREAD", "coral"], ["M", "Meeting", "NOTES", "gold"], ["T", "Ticket", "TICKET", "blue"], ["文", "Chat", "MULTILINGUAL", "mint"], ["◌", "Transcript", "EXCERPT", "ink"]];
const LINEAR_DESTINATIONS = [["S", "Slack", "thread summary", "violet"], ["N", "Notion", "page block", "ink"], ["L", "Linear", "issue draft", "mint"], ["J", "Jira", "ticket draft", "coral"], ["@", "Email", "paste-ready message", "gold"]];

function LinearMascot({ size = "normal" }) {
  return <img className={`linear-mascot-image ${size}`} src={MASCOT_SRC} alt="" aria-hidden="true" />;
}

function LinearDemo() {
  const [scene, setScene] = useState(0);
  const scenes = ["Purpose", "Many surfaces", "Local compile", "Review", "Handoff", "Privacy"];
  const next = () => setScene((current) => Math.min(scenes.length - 1, current + 1));
  const previous = () => setScene((current) => Math.max(0, current - 1));
  return <main className={`linear-demo linear-scene-${scene}`} data-linear-demo="true">
    <header className="linear-header"><span className="linear-wordmark"><b>FC</b><span>feedback compiler</span></span><span className="linear-status"><i /> OLLAMA READY</span></header>
    <section className="linear-stage" aria-live="polite">
      {scene === 0 && <div className="linear-layout linear-intro"><div className="linear-copy"><div className="linear-greeting"><LinearMascot size="small" /><span>Hi, I keep the signal together.</span></div><p className="linear-eyebrow">LOCAL-FIRST / LIVE WORKSPACE</p><h1>Less feedback noise.<br /><em>More next moves.</em></h1><p className="linear-lede">Paste fragmented feedback, compile it locally and review the source-linked result before anything becomes a task.</p><div className="linear-pills"><span>IN MEMORY</span><span>LOCAL MODEL</span><span>SOURCE-LINKED</span></div></div><div className="linear-preview"><div className="linear-preview-head"><span>LOCAL / OLLAMA</span><b>READY</b></div><h2>Three messages.<br /><em>One review surface.</em></h2>{[["C-014", "Hero feels too tall on mobile."], ["D-022", "Keep headline, revise subtitle."], ["P-008", "Mobile launch is Thursday."]].map(([id, text]) => <div className="linear-thread" key={id}><b>{id}</b><span>{text}</span></div>)}<div className="linear-arrowline">↳ compile in the workspace below</div></div></div>}
      {scene === 1 && <div className="linear-layout linear-flow-scene"><div className="linear-heading"><p className="linear-eyebrow">ONE COMPILER / MANY SURFACES</p><h2>Different inputs.<br /><em>One local signal.</em></h2><p className="linear-lede">Each source keeps its shape at intake. The compiler turns fragments into the same reviewable output.</p></div><div className="linear-flow-grid"><div className="linear-source-grid">{LINEAR_SOURCES.map(([mark, label, meta, tone]) => <div className={`linear-source ${tone}`} key={label}><b>{mark}</b><span><strong>{label}</strong><small>{meta}</small></span></div>)}</div><span className="linear-flow-arrow">→</span><div className="linear-core"><div className="linear-core-orbit"><LinearMascot size="core" /></div><strong>LOCAL COMPILER</strong><span>local model · review</span><small>nothing leaves the laptop</small></div><span className="linear-flow-arrow">→</span><div className="linear-output-stack"><p>STRUCTURED OUT</p><div><b>DO</b><span>Actions</span></div><div><b>DECIDE</b><span>Decisions</span></div><div><b>ASK</b><span>Conflicts & questions</span></div></div></div></div>}
      {scene === 2 && <div className="linear-layout linear-compile-scene"><div className="linear-heading"><p className="linear-eyebrow">01 / INPUT</p><h2>Feedback batch</h2><p className="linear-lede">Six formats, short to transcript-length. Source IDs stay attached while the local model compiles the signal.</p></div><div className="linear-compile-grid"><div className="linear-input-list">{[["SL-001", "SLACK", "Mobile hero feels too tall…"], ["EM-002", "EMAIL", "Keep headline, revise subtitle…"], ["MT-003", "MEETING", "Decision: keep CTA label…"], ["TK-004", "TICKET", "Checkout button is hard to notice…"], ["CH-005", "CHAT", "La hero ocupa demasiado spazio…"], ["TR-006", "TRANSCRIPT", "First action visible without scrolling…"]].map(([id, type, text]) => <div className="linear-input-row" key={id}><b>{id}</b><small>{type}</small><span>{text}</span></div>)}</div><div className="linear-process-card"><p>LOCAL PROCESSING</p><strong>gemma4:e2b-it-qat</strong><span>The batch stays in memory while the model proposes actions, decisions, deadlines and questions.</span><div className="linear-progress"><i /></div><b>COMPILED LOCALLY</b><small>nothing leaves the laptop</small></div></div></div>}
      {scene === 3 && <div className="linear-layout linear-review-scene"><div className="linear-heading"><p className="linear-eyebrow">02 / OUTPUT</p><h2>Review surface</h2><p className="linear-lede">Compilation complete · provenance checked</p></div><LinearMascot size="review" /><div className="linear-lanes"><div className="linear-lane mint"><header><span>DO / ACTIONABLE</span><b>05</b></header><article>Reduce top padding before Friday <small>SL-001</small></article><article>Make CTA more visible <small>EM-002</small></article><footer>+3 related actions</footer></div><div className="linear-lane gold"><header><span>DECIDE / CONFIRMED</span><b>00</b></header><p>Nothing in this lane.</p></div><div className="linear-lane coral"><header><span>CLARIFY / UNRESOLVED</span><b>02</b></header><article>Apply pricing hierarchy to checkout? <small>MT-003</small></article><article>Define the test window <small>TR-006</small></article></div></div></div>}
      {scene === 4 && <div className="linear-layout linear-handoff-scene"><div className="linear-heading"><p className="linear-eyebrow gold-text">03 / HANDOFF</p><h2>Move the reviewed signal.</h2><p className="linear-lede">Prepare a paste-ready payload for the next tool. The person decides if and where to share it.</p></div><div className="linear-handoff-grid"><div className="linear-destination-grid">{LINEAR_DESTINATIONS.map(([mark, label, hint, tone]) => <div className={`linear-destination ${tone}`} key={label}><b>{mark}</b><span><strong>{label}</strong><small>{hint}</small></span><i>↗</i></div>)}</div><div className="linear-payload"><p>PASTE-READY PAYLOAD</p><h3>Reduce mobile hero padding</h3><b>source_ids: SL-001</b><hr /><span>review state: HUMAN APPROVAL</span><small>clipboard only · no automatic write</small><em>PRIVATE BY DEFAULT</em></div></div></div>}
      {scene === 5 && <div className="linear-layout linear-privacy-scene"><div className="linear-privacy-stamp"><span>LOCAL</span><small>PRIVACY<br />BOUNDARY</small></div><div className="linear-heading"><p className="linear-eyebrow">PRIVACY FIRST / PRECISELY WORDED</p><h2>Private by architecture.<br /><em>Honest about the limits.</em></h2><p className="linear-lede">The model runs on the same computer as the workspace. Real client work still requires redaction, retention rules and a tested network boundary.</p><div className="linear-facts"><div><b>LOCAL</b><span>Compilation stays on this computer.</span></div><div><b>IN MEMORY</b><span>The active session is not retained after closing.</span></div><div><b>REVIEW</b><span>Derived text can still be sensitive.</span></div></div></div><LinearMascot size="privacy" /></div>}
    </section>
    <footer className="linear-controls"><button type="button" onClick={previous} disabled={scene === 0}>←</button><span>{String(scene + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")} · {scenes[scene]}</span><button type="button" aria-label="Next scene" onClick={next} disabled={scene === scenes.length - 1}>→</button></footer>
  </main>;
}

function WorkspaceApp() {
  const demoMode = new URLSearchParams(window.location.search).get("demo");
  const recordingDemo = demoMode === "recording";
  const publicDemo = demoMode === "public";
  const replayDemo = recordingDemo || publicDemo;
  const [feedback, setFeedback] = useState(SAMPLE_FEEDBACK);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [datasetPack, setDatasetPack] = useState("benchmark");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Ready to compile");
  const [error, setError] = useState("");
  const [handoffNotice, setHandoffNotice] = useState("");
  const [ollama, setOllama] = useState({ state: "checking", version: null, models: [] });
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveStep(Number(entry.target.dataset.step));
      }),
      { rootMargin: "-38% 0px -45% 0px", threshold: 0 }
    );
    stepRefs.current.filter(Boolean).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (replayDemo) {
      setOllama({ state: "ready", version: "recording", models: [DEFAULT_MODEL] });
      return undefined;
    }
    checkOllama(false);
    return undefined;
  }, [replayDemo]);

  useEffect(() => {
    if (!replayDemo) return undefined;
    loadHeterogeneousMix();
    const timer = window.setTimeout(() => compileFeedback(), publicDemo ? 900 : 4200);
    return () => window.clearTimeout(timer);
  }, [replayDemo, publicDemo]);

  async function checkOllama(showError = true) {
    if (publicDemo) return true;
    setOllama((current) => ({ ...current, state: "checking" }));
    try {
      const versionResponse = await fetch("/ollama/api/version");
      if (!versionResponse.ok) throw new Error("Ollama version endpoint unavailable");
      const versionBody = await versionResponse.json();
      const tagsResponse = await fetch("/ollama/api/tags");
      if (!tagsResponse.ok) throw new Error("Ollama model list unavailable");
      const tagsBody = await tagsResponse.json();
      const models = (tagsBody.models || []).map((entry) => entry.name || entry.model).filter(Boolean);
      setOllama({ state: models.includes(model) ? "ready" : "model-missing", version: versionBody.version || "available", models });
      if (showError && !models.includes(model)) setError(`Ollama è attivo, ma il modello ${model} non risulta installato.`);
      return models.includes(model);
    } catch (caught) {
      setOllama({ state: "offline", version: null, models: [] });
      if (showError) setError("Ollama non è raggiungibile. Avvia Ollama e verifica che il modello locale sia installato.");
      return false;
    }
  }

  function updateFeedback(index, field, value) {
    setFeedback((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));
    setResult(null);
    setError("");
  }

  function addFeedback() {
    setFeedback((current) => [...current, { id: `F-${String(current.length + 1).padStart(3, "0")}`, source: "", format: "custom", text: "" }]);
  }

  function removeFeedback(index) {
    setFeedback((current) => current.filter((_, entryIndex) => entryIndex !== index));
    setResult(null);
  }

  function loadSample() {
    setFeedback(SAMPLE_FEEDBACK.map((entry) => ({ ...entry })));
    setSelectedCaseId("");
    setResult(null);
    setError("");
    setHandoffNotice("");
    setStatusMessage("Synthetic example loaded");
  }

  function loadHeterogeneousMix() {
    setFeedback(HETEROGENEOUS_MIX.map((entry) => ({ ...entry })));
    setDatasetPack("casebook");
    setSelectedCaseId("MIXED");
    setResult(null);
    setError("");
    setHandoffNotice("");
    setStatus("idle");
    setStatusMessage(publicDemo ? "Public replay ready · no model call" : "Mixed input set loaded · 6 formats · short to transcript-length");
  }

  function loadDatasetCase(datasetCase) {
    const format = INPUT_FORMATS.some(([value]) => value === datasetCase.input_type) ? datasetCase.input_type : "custom";
    setFeedback(datasetCase.feedback.map((entry) => ({ ...entry, format })));
    setSelectedCaseId(datasetCase.case_id);
    setResult(null);
    setError("");
    setHandoffNotice("");
    setStatus("idle");
    setStatusMessage(`${datasetCase.case_id} loaded · ${datasetCase.feedback.length} input${datasetCase.feedback.length === 1 ? "" : "s"}`);
  }

  const visibleCases = datasetPack === "casebook" ? heterogeneousCasebook.cases : demoCases;
  const selectedCase = visibleCases.find((datasetCase) => datasetCase.case_id === selectedCaseId);

  function switchDatasetPack(pack) {
    setDatasetPack(pack);
    setSelectedCaseId("");
    setResult(null);
    setError("");
    setStatusMessage(pack === "casebook" ? "Heterogeneous casebook ready" : "Synthetic benchmark ready");
  }

  async function compileFeedback() {
    setError("");
    const cleaned = feedback.map((entry) => ({ id: entry.id.trim(), source: entry.source.trim() || "Unspecified source", format: entry.format || "custom", text: entry.text.trim() })).filter((entry) => entry.text);
    if (!cleaned.length) {
      setError("Inserisci almeno un feedback prima di compilare.");
      return;
    }
    const ids = cleaned.map((entry) => entry.id);
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
      setError("Ogni feedback deve avere un source ID non vuoto e univoco.");
      return;
    }

    setStatus("loading");
    setStatusMessage("Compiling locally…");
    setResult(null);
    if (replayDemo) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      setResult(RECORDING_RESULT);
      setStatus("success");
      setStatusMessage(publicDemo ? "Public replay complete · no model call" : `Recorded local result with ${model}`);
      return;
    }
    try {
      const response = await fetch("/ollama/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          think: false,
          format: buildOutputSchema(ids),
          options: { num_ctx: 4096, temperature: 0 },
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: buildUserPrompt(cleaned) }]
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Ollama HTTP ${response.status}`);
      const rawContent = body?.message?.content;
      if (typeof rawContent !== "string") throw new Error("Ollama non ha restituito message.content.");
      let parsed;
      try { parsed = JSON.parse(rawContent); } catch { throw new Error("Il modello ha restituito un JSON non valido."); }
      const validationErrors = validateOutput(parsed, sourceIdsFromFeedback(cleaned));
      if (validationErrors.length) throw new Error(`Output non valido: ${validationErrors[0]}`);
      setResult(parsed);
      setStatus("success");
      setStatusMessage(`Compiled locally with ${model}`);
      setOllama((current) => ({ ...current, state: "ready" }));
    } catch (caught) {
      setStatus("error");
      setStatusMessage("Compilation failed");
      setError(caught.message || "Errore durante la compilazione locale.");
    }
  }

  function resetOutput() {
    setResult(null);
    setStatus("idle");
    setStatusMessage("Ready to compile");
    setError("");
    setHandoffNotice("");
  }

  function exportResult(format) {
    if (!result) return;
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "txt") downloadFile(`feedback-compiler-${stamp}.txt`, formatResultAsText(result, model), "text/plain;charset=utf-8");
    if (format === "json") downloadFile(`feedback-compiler-${stamp}.json`, JSON.stringify({ generated_at: new Date().toISOString(), model, structured_output: result }, null, 2), "application/json;charset=utf-8");
  }

  async function prepareDestination(destination, label) {
    if (!result) return;
    const handoff = formatResultAsText(result, model);
    try {
      await navigator.clipboard.writeText(handoff);
      setHandoffNotice(`${label}: output copied. Open ${label} and paste it manually.`);
    } catch {
      const stamp = new Date().toISOString().slice(0, 10);
      downloadFile(`feedback-compiler-${destination}-${stamp}.txt`, handoff, "text/plain;charset=utf-8");
      setHandoffNotice(`${label}: clipboard unavailable, a local paste-ready .txt was downloaded.`);
    }
  }

  const scrollToWorkspace = () => document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app-shell" data-recording-demo={recordingDemo ? "true" : "false"} data-public-demo={publicDemo ? "true" : "false"}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Feedback Compiler home"><span className="wordmark-mark">FC</span><span>feedback compiler</span></a>
        <nav className="site-nav" aria-label="Main navigation"><a href="#workspace">Workspace</a><a href="#workflow">How it works</a><a href="#privacy">Privacy</a></nav>
        <button className={`header-status status-button ${ollama.state}`} type="button" onClick={() => checkOllama(true)} disabled={publicDemo}><span className="status-dot" /> {publicDemo ? "public replay / no model call" : ollama.state === "ready" ? "ollama ready" : ollama.state === "checking" ? "checking local" : "ollama offline"}</button>
      </header>
      {recordingDemo && <div className="recording-banner page-grid"><span>RECORDED DEMO</span><strong>synthetic mixed set · recorded local flow · review before handoff</strong></div>}
      {publicDemo && <div className="recording-banner public-banner page-grid"><span>PUBLIC REPLAY</span><strong>synthetic mixed set · preserved local output · no Ollama request</strong></div>}

      <main id="top">
        <section className="hero page-grid">
          <div className="hero-copy">
            <div className="hero-character"><TypeMascot mood="wave" /><span>Hi, I keep the signal together.</span></div>
            <p className="eyebrow"><span className="eyebrow-line" /> {publicDemo ? "PUBLIC REPLAY / NO MODEL CALL" : "LOCAL-FIRST / LIVE WORKSPACE"}</p>
            <h1>Less feedback noise. <em>More</em> next moves.</h1>
            <p className="hero-lede">{publicDemo ? "Explore a preserved synthetic run of the product. Live inference stays local through Ollama and is intentionally not exposed on this page." : "Paste fragmented product feedback, run a local compilation and review the source-linked result before anything becomes a task."}</p>
            <div className="hero-actions"><button className="primary-button" type="button" onClick={scrollToWorkspace}>Open the workspace <span aria-hidden="true">↓</span></button><a className="text-link" href="#privacy">Read the privacy boundary <span aria-hidden="true">↗</span></a></div>
            <div className="hero-proof">{publicDemo ? <><span>synthetic</span> input&nbsp;&nbsp;·&nbsp;&nbsp;<span>preserved</span> local output&nbsp;&nbsp;·&nbsp;&nbsp;<span>no network</span> inference</> : <><span>in-memory</span> input&nbsp;&nbsp;·&nbsp;&nbsp;<span>local</span> Ollama inference&nbsp;&nbsp;·&nbsp;&nbsp;<span>source-linked</span> output</>}</div>
          </div>
          <div className="hero-card-wrap" aria-label="Product preview">
            <div className="hero-card-shadow" /><div className="hero-card"><div className="card-topline"><span>{publicDemo ? "PUBLIC / REPLAY" : "LOCAL / OLLAMA"}</span><span className="live-chip"><span className="status-dot" /> {publicDemo ? "READY" : ollama.state === "ready" ? "READY" : "CHECKING"}</span></div><div className="card-title">Three messages.<br /><strong>One review surface.</strong></div><div className="mini-thread">{SAMPLE_FEEDBACK.map((entry) => <div className="thread-row" key={entry.id}><span className="thread-id">{entry.id}</span><span>{entry.text}</span></div>)}</div><div className="compile-line"><span className="compile-arrow">↳</span><span>{publicDemo ? "replay the preserved run" : "compile in the workspace below"}</span><span className="compile-badge">{publicDemo ? "STATIC" : "LOCAL"}</span></div></div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Product principles"><div><span className="strip-index">01</span><strong>PROVENANCE</strong><span>Source IDs stay attached.</span></div><div><span className="strip-index">02</span><strong>REVIEW</strong><span>Human approval stays in the loop.</span></div><div><span className="strip-index">03</span><strong>PRIVACY</strong><span>Input stays in memory only.</span></div></section>

        <section className="workspace-section page-grid" id="workspace">
          <div className="workspace-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> {publicDemo ? "PUBLIC REPLAY / PRESERVED RUN" : "LIVE LOCAL WORKSPACE"}</p><h2>{publicDemo ? <>Review the<br /><em>next move.</em></> : <>Compile the<br /><em>next move.</em></>}</h2></div><p className="section-lede">{publicDemo ? "This public page replays a synthetic local run. It never contacts Ollama; use the repository instructions for live inference on your own computer." : "Add messages, keep their source IDs, then compile the batch on this computer. The active session is not retained after the page is closed."}</p></div>
          <InputFlow publicDemo={publicDemo} />
          <div className="workspace-grid">
            <section className="input-panel panel">
              <div className="panel-heading"><div><span className="panel-kicker">01 / INPUT</span><h3>Feedback batch</h3></div><span className="memory-badge">{publicDemo ? "SYNTHETIC" : "IN MEMORY"}</span></div>
              <div className="privacy-toggle"><div className="privacy-lock"><span className="toggle-ui static-on" /><span><strong>{publicDemo ? "Replay mode" : "Privacy mode"}</strong><small>{publicDemo ? "Preserved output · no model request" : "Always in memory · no browser persistence"}</small></span></div><span className="info-mark" title={publicDemo ? "This page uses a fixed synthetic result." : "Input and output disappear when this tab is closed."}>i</span></div>
              <div className="dataset-browser"><div className="dataset-browser-heading"><div><strong>{datasetPack === "casebook" ? "8-CASE CASEBOOK" : "30-CASE BENCHMARK"}</strong><span>{publicDemo ? "Fixed synthetic fixture · preserved local output" : datasetPack === "casebook" ? "Realistic shapes · separate from benchmark scores" : "Controlled failure modes · regression surface"}</span></div><b>{selectedCaseId || "CUSTOM"}</b></div><div className="dataset-pack-switch" role="group" aria-label="Input collection"><button className={datasetPack === "benchmark" ? "active" : ""} type="button" disabled={publicDemo} onClick={() => switchDatasetPack("benchmark")}>30 benchmark</button><button className={datasetPack === "casebook" ? "active" : ""} type="button" disabled={publicDemo} onClick={() => switchDatasetPack("casebook")}>8 casebook</button><button className="mixed-button" type="button" disabled={publicDemo} onClick={loadHeterogeneousMix}>Load mixed set</button></div><div className="case-grid">{visibleCases.map((datasetCase) => <button className={`case-card ${selectedCaseId === datasetCase.case_id ? "selected" : ""}`} type="button" disabled={publicDemo} key={datasetCase.case_id} title={`${datasetCase.title || datasetCase.input_type} · ${(datasetCase.primary_failure_mode || datasetCase.expected_rule_coverage || []).toString()}`} onClick={() => loadDatasetCase(datasetCase)}><span>{datasetCase.case_id}</span><small>{datasetCase.difficulty || (datasetCase.supported_now === "partial" ? "EXT" : "MIXED")}</small></button>)}</div>{selectedCase && <div className="dataset-case-meta"><strong>{selectedCase.title || selectedCase.input_type?.replaceAll("_", " ") || "Custom set"}</strong><span>{selectedCase.primary_failure_mode || `${selectedCase.input_type} · ${(selectedCase.expected_rule_coverage || []).join(" / ")}`} · {selectedCase.feedback.length} input{selectedCase.feedback.length === 1 ? "" : "s"}</span></div>}{selectedCaseId === "MIXED" && <div className="dataset-case-meta"><strong>Mixed input set</strong><span>Slack · email · meeting · ticket · multilingual · transcript · 6 inputs</span></div>}</div>
              <div className="feedback-list">
                {feedback.map((entry, index) => <div className="feedback-editor" key={`${entry.id}-${index}`}><div className="feedback-editor-top"><span className="feedback-index">{String(index + 1).padStart(2, "0")}</span><input className="source-input" aria-label={`Source ID ${index + 1}`} value={entry.id} readOnly={publicDemo} onChange={(event) => updateFeedback(index, "id", event.target.value)} /><input className="source-origin-input" aria-label={`Source origin ${index + 1}`} placeholder="Source / role" value={entry.source} readOnly={publicDemo} onChange={(event) => updateFeedback(index, "source", event.target.value)} /><select className="format-select" aria-label={`Input format ${index + 1}`} value={entry.format || "custom"} disabled={publicDemo} onChange={(event) => updateFeedback(index, "format", event.target.value)}>{INPUT_FORMATS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="remove-button" type="button" disabled={publicDemo} aria-label={`Remove feedback ${index + 1}`} onClick={() => removeFeedback(index)}>×</button></div><div className="feedback-format-line"><span className="format-mark">{formatMark(entry.format)}</span><span>{formatLabel(entry.format)}</span><span>input {entry.text.length > 280 ? "long-form" : entry.text.length > 100 ? "medium" : "short"}</span></div><textarea aria-label={`Feedback ${index + 1}`} placeholder="Paste one feedback message, paragraph, ticket or transcript excerpt…" value={entry.text} readOnly={publicDemo} onChange={(event) => updateFeedback(index, "text", event.target.value)} /></div>)}
              </div>
              {!publicDemo && <div className="input-actions"><button className="small-button" type="button" onClick={addFeedback}>+ Add feedback</button><button className="small-link" type="button" onClick={loadSample}>Load sample</button></div>}
              <div className="compile-controls"><label className="model-field"><span>{publicDemo ? "REPLAY SOURCE" : "MODEL"}</span><input value={publicDemo ? "preserved local run" : model} disabled={publicDemo} onChange={(event) => { setModel(event.target.value); setOllama((current) => ({ ...current, state: "checking" })); }} /></label><button className="compile-button" type="button" onClick={compileFeedback} disabled={status === "loading"}>{status === "loading" ? (publicDemo ? "Preparing replay…" : "Compiling…") : publicDemo ? "Run public replay ↗" : "Compile locally ↗"}</button></div>
              <div className={`workspace-status ${status}`}><span className="status-dot" />{statusMessage}{!publicDemo && <button type="button" onClick={() => checkOllama(true)}>check Ollama</button>}</div>
              {error && <div className="error-box" role="alert">{error}</div>}
            </section>

            <section className="result-panel panel">
              <div className="panel-heading"><div><span className="panel-kicker">02 / OUTPUT</span><h3>Review surface</h3></div>{result && <button className="small-link" type="button" onClick={resetOutput}>Clear output</button>}</div>
            {!result ? <div className="empty-result"><TypeMascot mood="idle" /><h3>Your compiled signal will appear here.</h3><p>Requests, decisions, conflicts, duplicates, questions and deadlines will be aggregated into a review board.</p><div className="empty-checks"><span>✓ Local model</span><span>✓ Schema output</span><span>✓ Human review</span></div></div> : <div className="result-content"><div className="result-summary"><TypeMascot mood="happy" compact /><div><strong>{publicDemo ? "Replay complete" : "Compilation complete"}</strong><span>{Object.values(result).flat().length} structured items · {publicDemo ? "preserved output" : "provenance checked"}</span></div></div><div className="export-toolbar"><span>Save structured result</span><button type="button" onClick={() => exportResult("txt")}>Download .txt</button><button type="button" onClick={() => exportResult("json")}>Download .json</button></div><OutputBoard result={result} /><DestinationActions result={result} onPrepare={prepareDestination} notice={handoffNotice} />{result.notes?.length > 0 && <section className="result-group blue"><div className="result-group-heading"><span className="result-dot" /><span>Notes</span></div>{result.notes.map((note) => <p className="result-note" key={note}>{note}</p>)}</section>}</div>}
            </section>
          </div>
        </section>

        <section className="workflow-section" id="workflow"><div className="section-intro page-grid"><p className="eyebrow"><span className="eyebrow-line" /> THE FLOW</p><div><h2>Scroll the signal<br /><em>from raw to ready.</em></h2><p className="section-lede">The live workspace above is the usable path. This scroll-linked layer explains what happens at each step.</p></div></div><div className="story-layout page-grid"><aside className="story-sidebar"><div className="story-sidebar-sticky"><div className="story-progress-label"><span>WORKFLOW</span><span>{String(activeStep + 1).padStart(2, "0")} / 03</span></div><div className="story-progress-track"><span style={{ height: `${Math.max(12, ((activeStep + 1) / 3) * 100)}%` }} /></div><p>Scroll-linked by design.<br />The interface follows the work.</p></div></aside><div className="story-cards">{[{ number: "01", label: "COLLECT", title: "Keep the source attached.", description: "Paste a small batch of feedback. Every message keeps its local source ID so the next decision can be checked.", lines: ["C-014  The hero feels too tall on mobile.", "D-022  Keep the headline, increase CTA visibility.", "P-008  Mobile launch is Thursday."], tone: "mint" }, { number: "02", label: "COMPILE", title: "Turn fragments into work.", description: "The local model proposes requests, decisions, conflicts and open questions. Structured output keeps relationships inspectable.", lines: ["request     reduce mobile hero padding", "decision    keep headline copy", "deadline    Thursday · P-008"], tone: "gold" }, { number: "03", label: "REVIEW", title: "Make the human decision visible.", description: "The output is a review surface, not an autonomous project manager. Accept, edit or reject each item before it leaves the laptop.", lines: ["ACCEPT   Reduce mobile hero padding", "EDIT     Confirm launch day", "TRACE    C-014 · P-008"], tone: "coral" }].map((step, index) => <article className={`story-card ${step.tone} ${activeStep === index ? "is-active" : ""}`} data-step={index} ref={(element) => { stepRefs.current[index] = element; }} key={step.number}><div className="story-card-head"><span>{step.number}</span><span>{step.label}</span></div><div className="story-card-body"><div><h3>{step.title}</h3><p>{step.description}</p></div><div className="code-window"><div className="code-window-top"><span /><span /><span /><b>{step.label.toLowerCase()}.json</b></div>{step.lines.map((line) => <code key={line}>{line}</code>)}</div></div></article>)}</div></div></section>

        <section className="privacy-section" id="privacy"><div className="privacy-inner page-grid"><div className="privacy-stamp"><span className="stamp-ring">LOCAL</span><span className="stamp-caption">PRIVACY<br />BOUNDARY</span></div><div className="privacy-copy"><p className="eyebrow"><span className="eyebrow-line" /> PRIVACY FIRST / PRECISELY WORDED</p><h2>Private by architecture.<br /><em>Honest about the limits.</em></h2><p className="section-lede">The model runs on the same computer as the workspace. Input and output stay within the active session; real client work still requires redaction, retention rules and a tested network boundary.</p><div className="privacy-facts"><div><strong>LOCAL</strong><span>Compilation stays on this computer.</span></div><div><strong>IN MEMORY</strong><span>The active session is not retained after closing.</span></div><div><strong>REVIEW</strong><span>Derived text can still be sensitive.</span></div></div></div></div></section>

        <section className="closing-section page-grid"><p className="eyebrow"><span className="eyebrow-line" /> NEXT INPUTS</p><div className="closing-content"><h2>Short messages today.<br /><em>Transcripts tomorrow.</em></h2><p>With domain examples, privacy-aware preprocessing and provenance at timestamp level, the same compiler can grow into longer, multi-speaker inputs.</p><button className="outline-button" type="button" onClick={scrollToWorkspace}>Open workspace <span aria-hidden="true">↗</span></button></div></section>
      </main>

      <footer className="site-footer page-grid"><span>FEEDBACK COMPILER / WEEK 1</span><span>{publicDemo ? "PUBLIC REPLAY / NO MODEL CALL" : "LIVE LOCAL DEMO / SYNTHETIC DEFAULT"}</span><span className="footer-progress">SCROLL {String(progress).padStart(2, "0")} %</span></footer>
    </div>
  );
}

function App() {
  const linearDemo = new URLSearchParams(window.location.search).get("demo") === "linear";
  return linearDemo ? <LinearDemo /> : <WorkspaceApp />;
}

export default App;
