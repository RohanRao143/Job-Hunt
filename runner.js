import * as pdfjsLib from "./vendor/pdf.mjs";
import { SKILLS as skillsDictionary } from "./skills.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("vendor/pdf.worker.mjs");

const DB_NAME = "rms-db";
const STORE = "handles";
const requestId = new URLSearchParams(location.search).get("requestId");

function dbGet(key) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE);
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    };
    req.onerror = () => reject(req.error);
  });
}

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/\.js\b/g, "js")
    .replace(/\.net\b/g, "net")
    .replace(/c\+\+/g, "cpp")
    .replace(/c#/g, "csharp")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES = {
  "react": ["react", "react js", "reactjs"],
  "react.js": ["react", "react js", "reactjs"],
  "angular": ["angular"],
  "vue": ["vue", "vue js", "vuejs"],
  "node.js": ["node", "node js", "nodejs"],
  "express.js": ["express", "express js", "expressjs"],
  "next.js": ["next", "next js", "nextjs"],
  "nestjs": ["nestjs", "nest js"],
  "typescript": ["typescript", "ts"],
  "javascript": ["javascript", "js", "ecmascript"],
  "postgresql": ["postgresql", "postgres", "psql"],
  "mongodb": ["mongodb", "mongo"],
  "mysql": ["mysql"],
  "c#": ["csharp", "c sharp"],
  "c++": ["cpp", "c plus plus"],
  "aws": ["aws", "amazon web services"],
  "gcp": ["gcp", "google cloud", "google cloud platform"],
  "ci/cd": ["ci cd", "cicd", "continuous integration", "continuous delivery"],
  "rest api": ["rest api", "restful api", "restful apis"],
  "graphql": ["graphql"],
  "redux saga": ["redux saga"],
  "github actions": ["github actions"],
  "kubernetes": ["kubernetes", "k8s"],
  "docker": ["docker"],
  "machine learning": ["machine learning", "ml"],
  "deep learning": ["deep learning", "dl"],
  "computer vision": ["computer vision"],
  "generative ai": ["generative ai", "genai"],
  "llm": ["llm", "large language model", "large language models"],
  "unit testing": ["unit testing", "unit tests", "unit test"],
  "integration testing": ["integration testing", "integration tests"],
  "end-to-end testing": ["end to end testing", "e2e testing", "e2e"],
  "object-oriented programming": ["object oriented programming", "oop"],
  "data structures": ["data structures", "data structure"],
  "algorithms": ["algorithms", "algorithm"],
  "sql server": ["sql server", "mssql"],
  "power bi": ["power bi"],
  "ui/ux": ["ui ux", "ui/ux"],
  "sso": ["sso", "single sign on"]
};

function aliasesFor(skill) {
  const key = normalize(skill);
  return ALIASES[key] ?? [key];
}

function containsSkill(text, skill) {
  const hay = ` ${normalize(text)} `;
  return aliasesFor(skill).some(a => {
    const needle = ` ${normalize(a)} `;
    return hay.includes(needle);
  });
}

function extractSkills(jobText, customSkills) {
  const all = [...skillsDictionary, ...(customSkills ?? [])];
  const seen = new Set();
  const found = [];
  for (const skill of all) {
    if (containsSkill(jobText, skill) && !seen.has(normalize(skill))) {
      seen.add(normalize(skill));
      found.push(skill);
    }
  }
  // Capture common versioned / platform terms missed by the fixed dictionary.
  const extraPatterns = [
    /\b(?:Java|Python|Go|Rust|Kotlin|Swift|PHP|Ruby)\s*\d+(?:\.\d+)?\b/gi,
    /\b(?:Angular|React|Vue|Node\.?js|Next\.?js)\s*\d+(?:\.\d+)?\b/gi,
    /\bAWS\s+(?:Lambda|S3|EC2|ECS|EKS)\b/gi,
    /\bAzure\s+(?:Functions|DevOps|AKS)\b/gi
  ];
  for (const rx of extraPatterns) {
    for (const m of jobText.matchAll(rx)) {
      const v = m[0].trim();
      if (!seen.has(normalize(v))) { seen.add(normalize(v)); found.push(v); }
    }
  }
  return found;
}

async function readPdf(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({data}).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str || "").join(" ") + "\n";
  }
  return text;
}

async function* walk(dir) {
  for await (const [, handle] of dir.entries()) {
    if (handle.kind === "file") yield handle;
    else if (handle.kind === "directory") yield* walk(handle);
  }
}

async function scanResumes(skills) {
  const dir = await dbGet("resumeDir");
  if (!dir) return {files:[], message:"No resume folder configured. Open extension Settings and choose your resume directory."};

  try {
    const permission = await dir.queryPermission({mode:"read"});
    if (permission !== "granted") {
      return {files:[], message:"Resume folder permission is not currently granted. Re-select the folder in Settings."};
    }
  } catch {
    return {files:[], message:"The saved resume folder is no longer accessible. Re-select it in Settings."};
  }

  const out = [];
  for await (const handle of walk(dir)) {
    if (!handle.name.toLowerCase().endsWith(".pdf")) continue;
    try {
      const file = await handle.getFile();
      const text = await readPdf(file);
      const matched = skills.filter(s => containsSkill(text, s));
      const score = skills.length ? Math.round((matched.length / skills.length) * 100) : 0;
      out.push({
        name: handle.name,
        score,
        matchedSkills: matched,
        missingSkills: skills.filter(s => !matched.includes(s)),
        pagesTextLength: text.length
      });
    } catch (e) {
      out.push({name:handle.name, score:0, error:"Could not parse PDF"});
    }
  }
  out.sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
  return {files:out};
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message?.type !== "RUNNER_JOB" || message.requestId !== requestId) return;
  try {
    const settings = await chrome.storage.local.get({customSkills:[], minScore:55});
    const skills = extractSkills(message.job?.text ?? "", settings.customSkills);
    const scan = await scanResumes(skills);
    chrome.runtime.sendMessage({
      type:"RUNNER_RESULT",
      requestId,
      result:{skills, files:scan.files ?? [], message:scan.message, minScore:settings.minScore, jobTitle:message.job?.title ?? ""}
    });
  } catch (e) {
    chrome.runtime.sendMessage({
      type:"RUNNER_RESULT",
      requestId,
      result:{skills:[], files:[], message:`Scanner error: ${e?.message ?? e}`}
    });
  }
});

chrome.runtime.sendMessage({type:"RUNNER_READY", requestId});
