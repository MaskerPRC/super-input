import axios from 'axios'
import { getConfig, insertPollingLog } from '../database'

let polling = false
let pollTimer: ReturnType<typeof setInterval> | null = null

async function poll(): Promise<void> {
  const pollingUrl = getConfig('polling_url')
  if (!pollingUrl) return

  try {
    const apiKey = getConfig('external_api_key')
    const headers: Record<string, string> = {}
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await axios.get(pollingUrl, { headers, timeout: 10000 })
    const commands: { action: string; data?: Record<string, unknown> }[] =
      response.data?.commands || []

    insertPollingLog(
      pollingUrl,
      response.status,
      JSON.stringify(response.data),
      commands.length
    )

    // Execute each command by calling local API
    const localPort = getConfig('local_api_port') || '18677'
    const localApiKey = getConfig('local_api_key')
    const localHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Source': 'polling'
    }
    if (localApiKey) {
      localHeaders['X-API-Key'] = localApiKey
    }

    for (const cmd of commands) {
      try {
        await axios.post(
          `http://127.0.0.1:${localPort}/api/actions/${cmd.action}`,
          cmd.data || {},
          { headers: localHeaders, timeout: 30000 }
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[Polling] Failed to execute command ${cmd.action}:`, message)
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    insertPollingLog(pollingUrl, null, JSON.stringify({ error: message }), 0)
    console.error('[Polling] Error:', message)
  }
}

export function startPolling(): void {
  if (polling) return
  const enabled = getConfig('polling_enabled')
  if (enabled !== 'true') return

  polling = true
  const interval = parseInt(getConfig('polling_interval') || '5000', 10)
  console.log(`[Polling] Started with interval ${interval}ms`)

  poll() // Immediate first poll
  pollTimer = setInterval(poll, interval)
}

export function stopPolling(): void {
  polling = false
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  console.log('[Polling] Stopped')
}

export function restartPolling(): void {
  stopPolling()
  startPolling()
}

export function isPollingActive(): boolean {
  return polling
}
