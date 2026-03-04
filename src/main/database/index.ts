import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { initializeSchema, DEFAULT_CONFIG } from './schema'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(): Database.Database {
  const dbPath = path.join(app.getPath('userData'), 'pc-agent.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  initializeSchema(db)
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
  }
}

// ── Config helpers ──

export function getConfig(key: string): string {
  const row = getDb().prepare('SELECT value FROM config WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? DEFAULT_CONFIG[key] ?? ''
}

export function setConfig(key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO config (key, value, updated_at) VALUES (?, ?, datetime('now','localtime'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(key, value)
}

export function getAllConfig(): Record<string, string> {
  const rows = getDb().prepare('SELECT key, value FROM config').all() as {
    key: string
    value: string
  }[]
  const config: Record<string, string> = {}
  for (const row of rows) {
    config[row.key] = row.value
  }
  return config
}

// ── Event log helpers ──

export function insertEventLog(eventType: string, eventData: object): number {
  const result = getDb()
    .prepare('INSERT INTO event_logs (event_type, event_data) VALUES (?, ?)')
    .run(eventType, JSON.stringify(eventData))
  return result.lastInsertRowid as number
}

export function updateEventPush(id: number, pushed: boolean, response?: string): void {
  getDb()
    .prepare('UPDATE event_logs SET pushed = ?, push_response = ? WHERE id = ?')
    .run(pushed ? 1 : 0, response ?? null, id)
}

export function getEventLogs(limit = 100, offset = 0, eventType?: string) {
  if (eventType) {
    return getDb()
      .prepare(
        'SELECT * FROM event_logs WHERE event_type = ? ORDER BY id DESC LIMIT ? OFFSET ?'
      )
      .all(eventType, limit, offset)
  }
  return getDb()
    .prepare('SELECT * FROM event_logs ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(limit, offset)
}

export function getEventLogCount(eventType?: string): number {
  if (eventType) {
    const row = getDb()
      .prepare('SELECT COUNT(*) as count FROM event_logs WHERE event_type = ?')
      .get(eventType) as { count: number }
    return row.count
  }
  const row = getDb()
    .prepare('SELECT COUNT(*) as count FROM event_logs')
    .get() as { count: number }
  return row.count
}

// ── Action log helpers ──

export function insertActionLog(
  actionType: string,
  actionData: object,
  source: string,
  result?: object
): number {
  const res = getDb()
    .prepare(
      'INSERT INTO action_logs (action_type, action_data, source, result) VALUES (?, ?, ?, ?)'
    )
    .run(actionType, JSON.stringify(actionData), source, result ? JSON.stringify(result) : null)
  return res.lastInsertRowid as number
}

export function getActionLogs(limit = 100, offset = 0) {
  return getDb()
    .prepare('SELECT * FROM action_logs ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(limit, offset)
}

export function getActionLogCount(): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as count FROM action_logs')
    .get() as { count: number }
  return row.count
}

// ── Polling log helpers ──

export function insertPollingLog(
  requestUrl: string,
  responseStatus: number | null,
  responseBody: string | null,
  commandsCount: number
): number {
  const res = getDb()
    .prepare(
      'INSERT INTO polling_logs (request_url, response_status, response_body, commands_count) VALUES (?, ?, ?, ?)'
    )
    .run(requestUrl, responseStatus, responseBody, commandsCount)
  return res.lastInsertRowid as number
}

export function getPollingLogs(limit = 100, offset = 0) {
  return getDb()
    .prepare('SELECT * FROM polling_logs ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(limit, offset)
}

// ── Browser command helpers ──

export function insertBrowserCommand(commandType: string, commandData: object): number {
  const res = getDb()
    .prepare('INSERT INTO browser_commands (command_type, command_data) VALUES (?, ?)')
    .run(commandType, JSON.stringify(commandData))
  return res.lastInsertRowid as number
}

export function getPendingBrowserCommands() {
  return getDb()
    .prepare("SELECT * FROM browser_commands WHERE status = 'pending' ORDER BY id ASC")
    .all()
}

export function updateBrowserCommandResult(id: number, status: string, result?: object): void {
  getDb()
    .prepare(
      `UPDATE browser_commands SET status = ?, result = ?, executed_at = datetime('now','localtime') WHERE id = ?`
    )
    .run(status, result ? JSON.stringify(result) : null, id)
}

// ── Clipboard file helpers ──

export function insertClipboardFile(data: {
  file_type: string
  file_name?: string
  file_size?: number
  file_path?: string
  mime_type?: string
  hash?: string
}): number {
  const res = getDb()
    .prepare(
      'INSERT INTO clipboard_files (file_type, file_name, file_size, file_path, mime_type, hash) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.file_type,
      data.file_name ?? null,
      data.file_size ?? null,
      data.file_path ?? null,
      data.mime_type ?? null,
      data.hash ?? null
    )
  return res.lastInsertRowid as number
}

// ── Cleanup ──

export function cleanOldLogs(retentionDays: number): void {
  const tables = ['event_logs', 'action_logs', 'polling_logs', 'clipboard_files']
  for (const table of tables) {
    getDb()
      .prepare(`DELETE FROM ${table} WHERE created_at < datetime('now', '-' || ? || ' days')`)
      .run(retentionDays)
  }
}

// ── Stats ──

export function getStats() {
  const eventCount = getDb()
    .prepare('SELECT COUNT(*) as count FROM event_logs')
    .get() as { count: number }
  const actionCount = getDb()
    .prepare('SELECT COUNT(*) as count FROM action_logs')
    .get() as { count: number }
  const pollingCount = getDb()
    .prepare('SELECT COUNT(*) as count FROM polling_logs')
    .get() as { count: number }
  const todayEvents = getDb()
    .prepare(
      "SELECT COUNT(*) as count FROM event_logs WHERE created_at >= date('now','localtime')"
    )
    .get() as { count: number }
  const todayActions = getDb()
    .prepare(
      "SELECT COUNT(*) as count FROM action_logs WHERE created_at >= date('now','localtime')"
    )
    .get() as { count: number }
  const eventsByType = getDb()
    .prepare('SELECT event_type, COUNT(*) as count FROM event_logs GROUP BY event_type')
    .all() as { event_type: string; count: number }[]

  return {
    totalEvents: eventCount.count,
    totalActions: actionCount.count,
    totalPolling: pollingCount.count,
    todayEvents: todayEvents.count,
    todayActions: todayActions.count,
    eventsByType
  }
}
