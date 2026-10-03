const pending = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_SETTINGS") {
    chrome.storage.local.get({
      enabledSites: ["linkedin","indeed","jobstreet","seek","monster","stepstone","totaljobs","cv-library","eures"],
      minScore: 55,
      customSkills: []
    }).then(sendResponse);
    return true;
  }

  if (message?.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    return;
  }

  if (message?.type === "SCAN_JOB") {
    const requestId = crypto.randomUUID();
    pending.set(requestId, {
      tabId: sender.tab?.id ?? null,
      sendResponse,
      job: message.job,
      windowId: null
    });
    chrome.windows.create({
      url: chrome.runtime.getURL(`runner.html?requestId=${encodeURIComponent(requestId)}`),
      type: "popup",
      width: 1,
      height: 1,
      focused: false
    }).then(w => {
      const p = pending.get(requestId);
      if (p) p.windowId = w.id;
    }).catch(err => {
      const p = pending.get(requestId);
      pending.delete(requestId);
      p?.sendResponse({skills:[],files:[],message:`Could not start local scanner: ${err.message}`});
    });
    return true;
  }

  if (message?.type === "RUNNER_READY") {
    const p = pending.get(message.requestId);
    if (p) chrome.runtime.sendMessage({type:"RUNNER_JOB", requestId:message.requestId, job:p.job}).catch(()=>{});
    return;
  }

  if (message?.type === "RUNNER_RESULT") {
    const p = pending.get(message.requestId);
    if (!p) return;
    pending.delete(message.requestId);
    try { p.sendResponse(message.result); } catch {}
    if (p.windowId != null) chrome.windows.remove(p.windowId).catch(()=>{});
  }
});