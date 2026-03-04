import { BrowserWindow } from 'electron'
import axios from 'axios'
import { insertEventLog, updateEventPush, getConfig } from './database'

export interface SystemEvent {
  type: string
  data: Record<string, unknown>
  timestamp?: string
}

let mainWindow: BrowserWindow | null = null

export function setMainWindow(win: BrowserWindow): void {
  mainWindow = win
}

export async function dispatchEvent(event: SystemEvent): Promise<void> {
  event.timestamp = event.timestamp ?? new Date().toISOString()

  // 1. Save to SQLite
  const logId = insertEventLog(event.type, event.data)

  // 2. Push to Vue renderer via IPC
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('system-event', {
      id: logId,
      ...event
    })
  }

  // 3. POST to external API
  const externalUrl = getConfig('external_api_url')
  if (externalUrl) {
    try {
      const apiKey = getConfig('external_api_key')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await axios.post(
        externalUrl,
        {
          event_type: event.type,
          event_data: event.data,
          timestamp: event.timestamp
        },
        { headers, timeout: 10000 }
      )

      updateEventPush(logId, true, JSON.stringify({ status: response.status }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      updateEventPush(logId, false, JSON.stringify({ error: message }))
    }
  }
}
