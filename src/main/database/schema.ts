import Database from 'better-sqlite3'

export const SCHEMA_SQL = `
-- 事件日志
CREATE TABLE IF NOT EXISTS event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  pushed INTEGER DEFAULT 0,
  push_response TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

-- 动作日志
CREATE TABLE IF NOT EXISTS action_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  action_data TEXT NOT NULL,
  source TEXT NOT NULL,
  result TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

-- 轮询日志
CREATE TABLE IF NOT EXISTS polling_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  commands_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

-- 配置表
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

-- 剪贴板文件缓存
CREATE TABLE IF NOT EXISTS clipboard_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_type TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  file_path TEXT,
  mime_type TEXT,
  hash TEXT,
  pushed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

-- 浏览器指令队列
CREATE TABLE IF NOT EXISTS browser_commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command_type TEXT NOT NULL,
  command_data TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  executed_at TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created ON event_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_action_logs_type ON action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_action_logs_created ON action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_polling_logs_created ON polling_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_browser_commands_status ON browser_commands(status);
`

export const DEFAULT_CONFIG: Record<string, string> = {
  external_api_url: '',
  external_api_key: '',
  polling_url: '',
  polling_interval: '5000',
  polling_enabled: 'false',
  local_api_port: '18677',
  local_api_key: '',
  monitor_clipboard: 'true',
  monitor_window: 'true',
  monitor_power: 'true',
  monitor_lock: 'true',
  monitor_usb: 'true',
  monitor_network: 'true',
  monitor_idle: 'true',
  idle_threshold: '300',
  clipboard_watch_types: 'text,image,file',
  clipboard_max_file_size: '10485760',
  clipboard_push_text: 'true',
  clipboard_push_image: 'true',
  clipboard_push_file: 'true',
  log_retention_days: '30'
}

export function initializeSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)

  const insertConfig = db.prepare(
    'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)'
  )
  const insertMany = db.transaction(() => {
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      insertConfig.run(key, value)
    }
  })
  insertMany()
}
