// PC Agent Browser Extension - Popup Script

const statusBadge = document.getElementById('statusBadge');
const pageUrl = document.getElementById('pageUrl');
const pageTitle = document.getElementById('pageTitle');
const btnReport = document.getElementById('btnReport');
const btnRefresh = document.getElementById('btnRefresh');
const activityLog = document.getElementById('activityLog');

const logs = [];

function addLog(message) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  logs.unshift(`[${time}] ${message}`);
  if (logs.length > 20) logs.pop();
  activityLog.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
}

async function refreshStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'get-status' });
    if (response.connected) {
      statusBadge.textContent = 'ONLINE';
      statusBadge.classList.add('connected');
    } else {
      statusBadge.textContent = 'OFFLINE';
      statusBadge.classList.remove('connected');
    }
  } catch {
    statusBadge.textContent = 'ERROR';
    statusBadge.classList.remove('connected');
  }
}

async function refreshPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      pageUrl.textContent = tab.url || '-';
      pageUrl.title = tab.url || '';
      pageTitle.textContent = tab.title || '-';
      pageTitle.title = tab.title || '';
    }
  } catch {
    // ignore
  }
}

btnReport.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ type: 'report-page' });
    addLog('Page info reported');
  } catch (err) {
    addLog(`Error: ${err.message}`);
  }
});

btnRefresh.addEventListener('click', () => {
  refreshStatus();
  refreshPageInfo();
  addLog('Status refreshed');
});

// Initialize
refreshStatus();
refreshPageInfo();
addLog('Popup opened');
