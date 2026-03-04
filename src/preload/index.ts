import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Config
  getConfig: () => ipcRenderer.invoke('config:getAll'),
  getConfigValue: (key: string) => ipcRenderer.invoke('config:get', key),
  setConfig: (key: string, value: string) => ipcRenderer.invoke('config:set', key, value),

  // Event Logs
  getEventLogs: (limit?: number, offset?: number, eventType?: string) =>
    ipcRenderer.invoke('events:list', limit, offset, eventType),
  getEventLogCount: (eventType?: string) => ipcRenderer.invoke('events:count', eventType),

  // Action Logs
  getActionLogs: (limit?: number, offset?: number) =>
    ipcRenderer.invoke('actions:list', limit, offset),
  getActionLogCount: () => ipcRenderer.invoke('actions:count'),

  // Polling Logs
  getPollingLogs: (limit?: number, offset?: number) =>
    ipcRenderer.invoke('polling:list', limit, offset),

  // Stats
  getStats: () => ipcRenderer.invoke('stats:get'),

  // Monitor Control
  getMonitorStatus: () => ipcRenderer.invoke('monitors:status'),
  startMonitor: (name: string) => ipcRenderer.invoke('monitors:start', name),
  stopMonitor: (name: string) => ipcRenderer.invoke('monitors:stop', name),
  startAllMonitors: () => ipcRenderer.invoke('monitors:startAll'),
  stopAllMonitors: () => ipcRenderer.invoke('monitors:stopAll'),

  // Polling Control
  startPolling: () => ipcRenderer.invoke('polling:start'),
  stopPolling: () => ipcRenderer.invoke('polling:stop'),
  restartPolling: () => ipcRenderer.invoke('polling:restart'),
  isPollingActive: () => ipcRenderer.invoke('polling:isActive'),

  // Browser Commands
  sendBrowserCommand: (type: string, data: object) =>
    ipcRenderer.invoke('browser:sendCommand', type, data),

  // Cleanup
  cleanupLogs: () => ipcRenderer.invoke('logs:cleanup'),

  // System Event Listener
  onSystemEvent: (callback: (event: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on('system-event', handler)
    return () => ipcRenderer.removeListener('system-event', handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
