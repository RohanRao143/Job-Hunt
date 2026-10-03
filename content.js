(() => {
  if (window.top !== window.self) return;
  const SITE = detectSite(location.hostname);
  if (!SITE) return;

  const RUN_ID = "rms-run";
  const MODAL_ID = "rms-modal";

  function detectSite(host) {
    if (/linkedin\.com$/.test(host)) return "linkedin";
    if (/indeed\.com$/.test(host)) return "indeed";
    if (/jobstreet\./.test(host)) return "jobstreet";
    if (/seek\./.test(host)) return "seek";
    if (/monster\.com$/.test(host)) return "monster";
    if (/stepstone\./.test(host)) return "stepstone";
    if (/totaljobs\.com$/.test(host)) return "totaljobs";
    if (/cv-library\.co\.uk$/.test(host)) return "cv-library";
    if (/eures\.europa\.eu$/.test(host)) return "eures";
    if (/glassdoor\.(com|co\.uk)$/.test(host)) return "glassdoor";
    if (/reed\.co\.uk$/.test(host)) return "reed";
    if (/cwjobs\.co\.uk$/.test(host)) return "cwjobs";
    if (/jobsite\.co\.uk$/.test(host)) return "jobsite";
    if (/xing\.com$/.test(host)) return "xing";
    if (/eurojobs\.com$/.test(host)) return "eurojobs";
    if (/wellfound\.com$/.test(host)) return "wellfound";
    if (/dice\.com$/.test(host)) return "dice";
    if (/ziprecruiter\.com$/.test(host)) return "ziprecruiter";
    return null;
  }

  const SITE_SELECTORS = {
    linkedin: {
      title: ["h1", ".job-details-jobs-unified-top-card__job-title", ".top-card-layout__title"],
      body: [".jobs-description__content", ".jobs-box__html-content", ".jobs-description-content__text", "main"]
    },
    indeed: {
      title: ["h1[data-testid='jobsearch-JobInfoHeader-title']", "h1.jobsearch-JobInfoHeader-title", "h1"],
      body: ["#jobDescriptionText", "[data-testid='jobDescriptionText']", "main"]
    },
    jobstreet: {
      title: ["h1[data-automation='job-detail-title']", "h1"],
      body: ["[data-automation='jobDescription']", "[data-automation='job-detail-description']", "main"]
    },
    seek: {
      title: ["h1", "[data-testid='job-detail-title']"],
      body: ["[data-automation='jobDescription']", "[data-testid='jobDescription']", "main"]
    },
    monster: {
      title: ["h1[data-testid='svx-job-title']", "h1"],
      body: ["[data-testid='svx-job-description']", "main"]
    },
    stepstone: {
      title: ["h1", "[data-at='job-title']"],
      body: ["[data-at='job-description']", "main"]
    },
    "totaljobs": {
      title: ["h1"],
      body: ["[data-testid='job-description']", "main"]
    },
    "cv-library": {
      title: ["h1"],
      body: ["#job-description", "[data-testid='job-description']", "main"]
    },
    eures: {
      title: ["h1"],
      body: ["main", "article"]
    },
    glassdoor: {
      title: ["h1"],
      body: ["#jobDescriptionText", "[data-test='jobDescription']", "main"]
    },
    reed: {
      title: ["h1", "[data-qa='job-title']"],
      body: ["#jobDescription", "[data-qa='job-description']", "main"]
    },
    cwjobs: {
      title: ["h1"],
      body: ["#job-description", "[data-testid='job-description']", "main"]
    },
    jobsite: {
      title: ["h1"],
      body: ["#job-description", "main"]
    },
    xing: {
      title: ["h1"],
      body: ["main", "article"]
    },
    eurojobs: {
      title: ["h1"],
      body: ["main", "article"]
    },
    wellfound: {
      title: ["h1"],
      body: ["main", "article"]
    },
    dice: {
      title: ["h1"],
      body: ["main", "article"]
    },
    ziprecruiter: {
      title: ["h1"],
      body: ["main", "article"]
    }
  };

  function firstText(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      const t = el?.innerText?.trim();
      if (t && t.length > 2) return t;
    }
    return "";
  }

  function extractJob() {
    const cfg = SITE_SELECTORS[SITE];
    const title = firstText(cfg.title) || document.title.replace(/\s*[|\-–—].*$/, "").trim();
    const body = firstText(cfg.body) || document.body?.innerText || "";
    const cleaned = body.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n").trim();
    return { site: SITE, url: location.href, title, text: cleaned.slice(0, 120000) };
  }

  function openModal(job) {
    document.getElementById(MODAL_ID)?.remove();
    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = `
      <section id="rms-card" role="dialog" aria-modal="true">
        <button class="rms-close" aria-label="Close">×</button>
        <h2>${escapeHtml(job.title || "Job match")}</h2>
        <div class="muted">${escapeHtml(SITE)} · ${escapeHtml(location.hostname)}</div>
        <div id="rms-content" style="margin-top:16px">
          <div class="rms-empty">Extracting skills and scanning configured resumes…</div>
        </div>
      </section>`;
    document.documentElement.appendChild(modal);
    modal.querySelector(".rms-close").onclick = () => modal.remove();
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    return modal.querySelector("#rms-content");
  }

  function renderResult(container, result) {
    const skills = result.skills || [];
    const files = result.files || [];
    container.innerHTML = `
      <div><b>Skills extracted</b> <span class="muted">(${skills.length})</span></div>
      <div class="skills">${skills.length ? skills.map(s => `<span class="rms-chip">${escapeHtml(s)}</span>`).join("") : `<span class="muted">No known skills detected. You can add custom skills in Settings.</span>`}</div>
      <div class="rms-actions">
        <button class="rms-btn" id="rms-copy">Copy skills</button>
        <button class="rms-btn secondary" id="rms-refresh">Rescan resumes</button>
      </div>
      <div><b>Resume matches</b></div>
      <div style="margin-top:8px">${files.length ? files.map(f => `
        <div class="row">
          <div style="flex:1"><div>${escapeHtml(f.name)}</div><div class="rms-bar"><div class="rms-fill" style="width:${f.score}%"></div></div></div>
          <div class="rms-score">${f.score}%</div>
        </div>`).join("") : `<div class="rms-empty">${escapeHtml(result.message || "No PDF resumes found. Configure a resume folder in Settings.")}</div>`}</div>
      <div class="muted" style="margin-top:12px">Scoring is local and heuristic: detected skills are matched against extracted resume text. It is a comparison aid, not an application decision.</div>`;
    container.querySelector("#rms-copy").onclick = async () => {
      await navigator.clipboard.writeText(skills.join(", "));
      container.querySelector("#rms-copy").textContent = "Copied";
      setTimeout(() => container.querySelector("#rms-copy").textContent = "Copy skills", 1200);
    };
    container.querySelector("#rms-refresh").onclick = () => requestScan(job, container);
  }

  function requestScan(job, container) {
    container.innerHTML = `<div class="rms-empty">Scanning configured resumes…</div>`;
    chrome.runtime.sendMessage({type: "SCAN_JOB", job}, result => {
      if (chrome.runtime.lastError) {
        container.innerHTML = `<div class="rms-empty">${escapeHtml(chrome.runtime.lastError.message)}</div>`;
        return;
      }
      renderResult(container, result || {});
    });
  }

  function addRunButton() {
    if (document.getElementById(RUN_ID)) return;
    const b = document.createElement("button");
    b.id = RUN_ID;
    b.textContent = "Run resume match";
    b.title = "Extract job skills and compare your local resumes";
    b.onclick = () => {
      const job = extractJob();
      const container = openModal(job);
      requestScan(job, container);
    };
    document.documentElement.appendChild(b);
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  chrome.runtime.sendMessage({type:"GET_SETTINGS"}, settings => {
    if (chrome.runtime.lastError) return;
    if (settings?.enabledSites?.includes(SITE)) {
      addRunButton();
      new MutationObserver(() => addRunButton()).observe(document.documentElement, {childList:true, subtree:true});
    }
  });
})();