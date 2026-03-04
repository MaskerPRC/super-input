// PC Agent Browser Extension - Popup Script (Bilingual)

const i18n = {
  zh: {
    online: '在线',
    offline: '离线',
    error: '错误',
    currentPage: '当前页面',
    titleLabel: '标题',
    actions: '操作',
    reportPage: '上报页面信息',
    refreshStatus: '刷新状态',
    recentActivity: '最近活动',
    waiting: '等待中...',
    pageReported: '页面信息已上报',
    statusRefreshed: '状态已刷新',
    popupOpened: '弹窗已打开',
  },
  en: {
    online: 'ONLINE',
    offline: 'OFFLINE',
    error: 'ERROR',
    currentPage: 'Current Page',
    titleLabel: 'Title',
    actions: 'Actions',
    reportPage: 'Report Page Info',
    refreshStatus: 'Refresh Status',
    recentActivity: 'Recent Activity',
    waiting: 'Waiting...',
    pageReported: 'Page info reported',
    statusRefreshed: 'Status refreshed',
    popupOpened: 'Popup opened',
  }
};

let currentLang = localStorage.getItem('pc-agent-lang') || 'zh';

function t(key) {
  return i18n[currentLang]?.[key] || i18n.en[key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  btnLang.textContent = currentLang === 'zh' ? 'EN' : '中文';
}

const statusBadge = document.getElementById('statusBadge');
const pageUrl = document.getElementById('pageUrl');
const pageTitle = document.getElementById('pageTitle');
const btnReport = document.getElementById('btnReport');
const btnRefresh = document.getElementById('btnRefresh');
const btnLang = document.getElementById('btnLang');
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
      statusBadge.textContent = t('online');
      statusBadge.classList.add('connected');
    } else {
      statusBadge.textContent = t('offline');
      statusBadge.classList.remove('connected');
    }
  } catch {
    statusBadge.textContent = t('error');
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
    addLog(t('pageReported'));
  } catch (err) {
    addLog(`Error: ${err.message}`);
  }
});

btnRefresh.addEventListener('click', () => {
  refreshStatus();
  refreshPageInfo();
  addLog(t('statusRefreshed'));
});

btnLang.addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('pc-agent-lang', currentLang);
  applyI18n();
  refreshStatus();
});

// Initialize
applyI18n();
refreshStatus();
refreshPageInfo();
addLog(t('popupOpened'));
