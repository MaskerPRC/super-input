import { ipcMain } from 'electron'
import {
  getAllConfig,
  getConfig,
  setConfig,
  getEventLogs,
  getEventLogCount,
  getActionLogs,
  getActionLogCount,
  getPollingLogs,
  getStats,
  cleanOldLogs,
  insertBrowserCommand
} from '../database'
import {
  startMonitor,
  stopMonitor,
  startAllMonitors,
  stopAllMonitors,
  getMonitorStatus,
  MonitorName
} from '../monitors'
import { startPolling, stopPolling, restartPolling, isPollingActive } from '../polling'

export function setupIpcHandlers(): void {
  // ── Config ──
  ipcMain.handle('config:getAll', () => getAllConfig())
  ipcMain.handle('config:get', (_e, key: string) => getConfig(key))
  ipcMain.handle('config:set', (_e, key: string, value: string) => {
    setConfig(key, value)
    return true
  })

  // ── Event Logs ──
  ipcMain.handle('events:list', (_e, limit?: number, offset?: number, eventType?: string) =>
    getEventLogs(limit, offset, eventType)
  )
  ipcMain.handle('events:count', (_e, eventType?: string) => getEventLogCount(eventType))

  // ── Action Logs ──
  ipcMain.handle('actions:list', (_e, limit?: number, offset?: number) =>
    getActionLogs(limit, offset)
  )
  ipcMain.handle('actions:count', () => getActionLogCount())

  // ── Polling Logs ──
  ipcMain.handle('polling:list', (_e, limit?: number, offset?: number) =>
    getPollingLogs(limit, offset)
  )

  // ── Stats ──
  ipcMain.handle('stats:get', () => getStats())

  // ── Monitor Control ──
  ipcMain.handle('monitors:status', () => getMonitorStatus())
  ipcMain.handle('monitors:start', (_e, name: MonitorName) => {
    startMonitor(name)
    setConfig(`monitor_${name}`, 'true')
    return true
  })
  ipcMain.handle('monitors:stop', (_e, name: MonitorName) => {
    stopMonitor(name)
    setConfig(`monitor_${name}`, 'false')
    return true
  })
  ipcMain.handle('monitors:startAll', () => {
    startAllMonitors()
    return true
  })
  ipcMain.handle('monitors:stopAll', () => {
    stopAllMonitors()
    return true
  })

  // ── Polling Control ──
  ipcMain.handle('polling:start', () => {
    setConfig('polling_enabled', 'true')
    startPolling()
    return true
  })
  ipcMain.handle('polling:stop', () => {
    setConfig('polling_enabled', 'false')
    stopPolling()
    return true
  })
  ipcMain.handle('polling:restart', () => {
    restartPolling()
    return true
  })
  ipcMain.handle('polling:isActive', () => isPollingActive())

  // ── Browser Commands ──
  ipcMain.handle('browser:sendCommand', (_e, type: string, data: object) => {
    const id = insertBrowserCommand(type, data)
    return id
  })

  // ── Cleanup ──
  ipcMain.handle('logs:cleanup', () => {
    const days = parseInt(getConfig('log_retention_days') || '30', 10)
    cleanOldLogs(days)
    return true
  })
}
