// PC Agent Browser Extension - Background Service Worker

const API_BASE = 'http://127.0.0.1:18677';
const POLL_INTERVAL = 3000; // 3 seconds

let isConnected = false;

// ── Polling for commands ──

async function pollCommands() {
  try {
    const response = await fetch(`${API_BASE}/api/browser/commands`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    isConnected = true;

    if (data.commands && data.commands.length > 0) {
      for (const cmd of data.commands) {
        await executeCommand(cmd);
      }
    }
  } catch (err) {
    isConnected = false;
    console.log('[PC Agent] Connection failed:', err.message);
  }
}

// ── Command execution ──

async function executeCommand(cmd) {
  const { id, command_type, command_data } = cmd;
  let parsedData = {};
  try {
    parsedData = typeof command_data === 'string' ? JSON.parse(command_data) : command_data;
  } catch {
    parsedData = {};
  }

  let result = {};
  let status = 'completed';

  try {
    switch (command_type) {
      case 'open-tab': {
        const tab = await chrome.tabs.create({ url: parsedData.url });
        result = { tabId: tab.id, url: tab.url };
        break;
      }
      case 'close-tab': {
        const tabId = parsedData.tabId;
        if (tabId) {
          await chrome.tabs.remove(tabId);
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab) await chrome.tabs.remove(activeTab.id);
        }
        result = { success: true };
        break;
      }
      case 'navigate': {
        const tabId = parsedData.tabId;
        if (tabId) {
          await chrome.tabs.update(tabId, { url: parsedData.url });
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab) await chrome.tabs.update(activeTab.id, { url: parsedData.url });
        }
        result = { success: true };
        break;
      }
      case 'get-page-info': {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab) {
          result = {
            tabId: activeTab.id,
            url: activeTab.url,
            title: activeTab.title,
            favIconUrl: activeTab.favIconUrl,
            status: activeTab.status
          };
        }
        break;
      }
      case 'get-tabs': {
        const tabs = await chrome.tabs.query({});
        result = {
          tabs: tabs.map(t => ({
            id: t.id,
            url: t.url,
            title: t.title,
            active: t.active,
            windowId: t.windowId
          }))
        };
        break;
      }
      case 'execute-script': {
        const targetTabId = parsedData.tabId;
        let execTabId;
        if (targetTabId) {
          execTabId = targetTabId;
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          execTabId = activeTab?.id;
        }
        if (execTabId) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: execTabId },
            func: (code) => {
              return eval(code);
            },
            args: [parsedData.code]
          });
          result = { results: results.map(r => r.result) };
        }
        break;
      }
      case 'get-selection': {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => window.getSelection()?.toString() || ''
          });
          result = { selection: results[0]?.result || '' };
        }
        break;
      }
      case 'screenshot': {
        const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        result = { image: dataUrl };
        break;
      }
      default:
        status = 'error';
        result = { error: `Unknown command: ${command_type}` };
    }
  } catch (err) {
    status = 'error';
    result = { error: err.message };
  }

  // Report result back to PC Agent
  try {
    await fetch(`${API_BASE}/api/browser/command-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, result })
    });
  } catch (err) {
    console.error('[PC Agent] Failed to report result:', err);
  }
}

// ── Report page info ──

async function reportPageInfo() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) return;

    await fetch(`${API_BASE}/api/browser/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page-info',
        url: activeTab.url,
        title: activeTab.title,
        favIconUrl: activeTab.favIconUrl
      })
    });
  } catch {
    // ignore
  }
}

// ── Tab change listener ──

chrome.tabs.onActivated.addListener(async () => {
  await reportPageInfo();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    const tab = await chrome.tabs.get(tabId);
    if (tab.active) {
      await reportPageInfo();
    }
  }
});

// ── Alarm-based polling (more reliable than setInterval in service workers) ──

chrome.alarms.create('poll-commands', { periodInMinutes: 0.05 }); // ~3 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'poll-commands') {
    pollCommands();
  }
});

// ── Message handler from popup/content scripts ──

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-status') {
    sendResponse({ connected: isConnected, apiBase: API_BASE });
  } else if (message.type === 'report-page') {
    reportPageInfo().then(() => sendResponse({ success: true }));
    return true; // async response
  }
  return false;
});

// Initial poll
pollCommands();
