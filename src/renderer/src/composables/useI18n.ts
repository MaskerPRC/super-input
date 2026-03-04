import { ref, computed } from 'vue'

export type Locale = 'zh' | 'en'

const currentLocale = ref<Locale>('zh')

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    // Sidebar
    'nav.dashboard': '仪表盘',
    'nav.events': '事件日志',
    'nav.actions': '动作日志',
    'nav.polling': '轮询',
    'nav.settings': '设置',

    // Status bar
    'status.api': 'API',
    'status.polling': '轮询',
    'status.monitors': '监控',

    // Dashboard
    'dashboard.title': '仪表盘',
    'dashboard.subtitle': '系统监控总览',
    'dashboard.todayEvents': '今日事件',
    'dashboard.todayActions': '今日动作',
    'dashboard.totalEvents': '总事件数',
    'dashboard.totalActions': '总动作数',
    'dashboard.monitorStatus': '监控状态',
    'dashboard.eventDistribution': '事件分布',
    'dashboard.noEvents': '暂无事件',
    'dashboard.liveEvents': '实时事件',
    'dashboard.realtime': '实时',
    'dashboard.waiting': '等待事件中...',

    // Event Log
    'events.title': '事件日志',
    'events.subtitle': '由系统监控器捕获的事件',
    'events.all': '全部',
    'events.refresh': '刷新',
    'events.id': 'ID',
    'events.type': '类型',
    'events.data': '数据',
    'events.pushed': '已推送',
    'events.time': '时间',
    'events.yes': '是',
    'events.no': '否',

    // Action Log
    'actions.title': '动作日志',
    'actions.subtitle': '通过本地 API 执行的动作',
    'actions.refresh': '刷新',
    'actions.id': 'ID',
    'actions.type': '类型',
    'actions.source': '来源',
    'actions.data': '数据',
    'actions.result': '结果',
    'actions.time': '时间',

    // Polling
    'polling.title': '轮询',
    'polling.subtitle': '外部服务轮询状态与历史',
    'polling.start': '启动轮询',
    'polling.stop': '停止轮询',
    'polling.refresh': '刷新',
    'polling.status': '状态',
    'polling.endpoint': '端点',
    'polling.logEntries': '日志条目',
    'polling.active': '运行中',
    'polling.stopped': '已停止',
    'polling.notSet': '未设置',
    'polling.id': 'ID',
    'polling.url': 'URL',
    'polling.responseStatus': '状态码',
    'polling.cmds': '指令数',
    'polling.response': '响应',
    'polling.time': '时间',

    // Settings
    'settings.title': '设置',
    'settings.subtitle': '配置监控器、API 端点和轮询',
    'settings.saved': '已保存',
    'settings.language': '语言',
    'settings.languageHint': '界面显示语言',
    'settings.chinese': '中文',
    'settings.english': 'English',

    'settings.externalApi': '外部 API',
    'settings.pushUrl': '推送端点 URL',
    'settings.pushUrlHint': '系统事件将通过 POST 发送到此地址',
    'settings.apiKey': 'API 密钥',

    'settings.polling': '轮询',
    'settings.pollingUrl': '轮询端点 URL',
    'settings.pollingUrlHint': '应用将轮询此地址获取待执行指令',
    'settings.pollingInterval': '轮询间隔 (ms)',
    'settings.pollingEnabled': '启用',

    'settings.localApi': '本地 API 服务',
    'settings.port': '端口',
    'settings.localApiKey': 'API 密钥 (可选)',
    'settings.localApiKeyHint': '留空则无需认证',

    'settings.monitors': '监控器',
    'settings.monitor.clipboard': '剪贴板',
    'settings.monitor.clipboard.desc': '文字、图片、文件变化',
    'settings.monitor.window': '窗口',
    'settings.monitor.window.desc': '活动窗口追踪',
    'settings.monitor.power': '电源',
    'settings.monitor.power.desc': '开机、休眠、唤醒、关机',
    'settings.monitor.lock': '锁屏',
    'settings.monitor.lock.desc': '锁屏/解锁检测',
    'settings.monitor.usb': 'USB',
    'settings.monitor.usb.desc': '设备插拔',
    'settings.monitor.network': '网络',
    'settings.monitor.network.desc': '连接与 IP 变化',
    'settings.monitor.idle': '空闲',
    'settings.monitor.idle.desc': '系统空闲检测',

    'settings.clipboard': '剪贴板设置',
    'settings.watchTypes': '监听类型',
    'settings.watchTypesHint': '逗号分隔: text, image, file',
    'settings.maxFileSize': '最大文件大小 (字节)',
    'settings.pushText': '推送文字',
    'settings.pushImages': '推送图片',
    'settings.pushFiles': '推送文件',

    'settings.maintenance': '维护',
    'settings.logRetention': '日志保留 (天)',
    'settings.cleanup': '清理旧日志',

    // Table
    'table.noData': '暂无数据',
    'table.showing': '显示',
    'table.records': '条记录',
    'table.prev': '上一页',
    'table.next': '下一页',
  },

  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.events': 'Events',
    'nav.actions': 'Actions',
    'nav.polling': 'Polling',
    'nav.settings': 'Settings',

    // Status bar
    'status.api': 'API',
    'status.polling': 'POLLING',
    'status.monitors': 'MONITORS',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'System monitor overview',
    'dashboard.todayEvents': 'Today Events',
    'dashboard.todayActions': 'Today Actions',
    'dashboard.totalEvents': 'Total Events',
    'dashboard.totalActions': 'Total Actions',
    'dashboard.monitorStatus': 'Monitor Status',
    'dashboard.eventDistribution': 'Event Distribution',
    'dashboard.noEvents': 'No events yet',
    'dashboard.liveEvents': 'Live Events',
    'dashboard.realtime': 'REAL-TIME',
    'dashboard.waiting': 'Waiting for events...',

    // Event Log
    'events.title': 'Event Log',
    'events.subtitle': 'System events captured by monitors',
    'events.all': 'ALL',
    'events.refresh': 'REFRESH',
    'events.id': 'ID',
    'events.type': 'Type',
    'events.data': 'Data',
    'events.pushed': 'Pushed',
    'events.time': 'Time',
    'events.yes': 'YES',
    'events.no': 'NO',

    // Action Log
    'actions.title': 'Action Log',
    'actions.subtitle': 'Actions executed via local API',
    'actions.refresh': 'REFRESH',
    'actions.id': 'ID',
    'actions.type': 'Type',
    'actions.source': 'Source',
    'actions.data': 'Data',
    'actions.result': 'Result',
    'actions.time': 'Time',

    // Polling
    'polling.title': 'Polling',
    'polling.subtitle': 'External service polling status and history',
    'polling.start': 'START POLLING',
    'polling.stop': 'STOP POLLING',
    'polling.refresh': 'REFRESH',
    'polling.status': 'Status',
    'polling.endpoint': 'Endpoint',
    'polling.logEntries': 'Log Entries',
    'polling.active': 'ACTIVE',
    'polling.stopped': 'STOPPED',
    'polling.notSet': 'NOT SET',
    'polling.id': 'ID',
    'polling.url': 'URL',
    'polling.responseStatus': 'Status',
    'polling.cmds': 'Cmds',
    'polling.response': 'Response',
    'polling.time': 'Time',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure monitors, API endpoints, and polling',
    'settings.saved': 'Saved',
    'settings.language': 'Language',
    'settings.languageHint': 'Interface display language',
    'settings.chinese': '中文',
    'settings.english': 'English',

    'settings.externalApi': 'External API',
    'settings.pushUrl': 'Push Endpoint URL',
    'settings.pushUrlHint': 'System events will be POSTed to this URL',
    'settings.apiKey': 'API Key',

    'settings.polling': 'Polling',
    'settings.pollingUrl': 'Polling Endpoint URL',
    'settings.pollingUrlHint': 'The app will poll this URL for pending commands',
    'settings.pollingInterval': 'Polling Interval (ms)',
    'settings.pollingEnabled': 'Enabled',

    'settings.localApi': 'Local API Server',
    'settings.port': 'Port',
    'settings.localApiKey': 'API Key (optional)',
    'settings.localApiKeyHint': 'Leave empty for no auth',

    'settings.monitors': 'Monitors',
    'settings.monitor.clipboard': 'Clipboard',
    'settings.monitor.clipboard.desc': 'Text, image, file changes',
    'settings.monitor.window': 'Window',
    'settings.monitor.window.desc': 'Active window tracking',
    'settings.monitor.power': 'Power',
    'settings.monitor.power.desc': 'Boot, suspend, resume, shutdown',
    'settings.monitor.lock': 'Lock Screen',
    'settings.monitor.lock.desc': 'Lock/unlock detection',
    'settings.monitor.usb': 'USB',
    'settings.monitor.usb.desc': 'Device plug/unplug',
    'settings.monitor.network': 'Network',
    'settings.monitor.network.desc': 'Connection & IP changes',
    'settings.monitor.idle': 'Idle',
    'settings.monitor.idle.desc': 'System idle detection',

    'settings.clipboard': 'Clipboard Settings',
    'settings.watchTypes': 'Watch Types',
    'settings.watchTypesHint': 'Comma-separated: text, image, file',
    'settings.maxFileSize': 'Max File Size (bytes)',
    'settings.pushText': 'Push Text',
    'settings.pushImages': 'Push Images',
    'settings.pushFiles': 'Push Files',

    'settings.maintenance': 'Maintenance',
    'settings.logRetention': 'Log Retention (days)',
    'settings.cleanup': 'CLEANUP OLD LOGS',

    // Table
    'table.noData': 'No data',
    'table.showing': 'Showing',
    'table.records': 'records',
    'table.prev': 'PREV',
    'table.next': 'NEXT',
  }
}

export function useI18n() {
  const locale = computed(() => currentLocale.value)

  function t(key: string): string {
    return messages[currentLocale.value]?.[key] ?? key
  }

  function setLocale(l: Locale) {
    currentLocale.value = l
  }

  function toggleLocale() {
    currentLocale.value = currentLocale.value === 'zh' ? 'en' : 'zh'
  }

  return { t, locale, setLocale, toggleLocale }
}

export function initLocale(lang: string) {
  if (lang === 'en' || lang === 'zh') {
    currentLocale.value = lang as Locale
  }
}
