import { powerMonitor } from 'electron'
import { dispatchEvent } from '../event-dispatcher'
import { getConfig } from '../database'

let watching = false
let watchTimer: ReturnType<typeof setInterval> | null = null
let wasIdle = false

function checkIdle(): void {
  const threshold = parseInt(getConfig('idle_threshold') || '300', 10)
  const idleSeconds = powerMonitor.getSystemIdleTime()
  const isIdle = idleSeconds >= threshold

  if (isIdle && !wasIdle) {
    wasIdle = true
    dispatchEvent({
      type: 'idle',
      data: {
        action: 'idle-start',
        idle_seconds: idleSeconds
      }
    })
  } else if (!isIdle && wasIdle) {
    wasIdle = false
    dispatchEvent({
      type: 'idle',
      data: {
        action: 'idle-end',
        idle_seconds: idleSeconds
      }
    })
  }
}

export function startIdleMonitor(): void {
  if (watching) return
  watching = true
  wasIdle = false
  watchTimer = setInterval(checkIdle, 5000)
}

export function stopIdleMonitor(): void {
  watching = false
  if (watchTimer) {
    clearInterval(watchTimer)
    watchTimer = null
  }
}
