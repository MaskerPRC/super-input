import { powerMonitor } from 'electron'
import { dispatchEvent } from '../event-dispatcher'

let listening = false

export function startPowerMonitor(): void {
  if (listening) return
  listening = true

  // App start event (acts as boot detection)
  dispatchEvent({
    type: 'power',
    data: { action: 'app-start' }
  })

  powerMonitor.on('suspend', () => {
    dispatchEvent({
      type: 'power',
      data: { action: 'suspend' }
    })
  })

  powerMonitor.on('resume', () => {
    dispatchEvent({
      type: 'power',
      data: { action: 'resume' }
    })
  })

  powerMonitor.on('shutdown', () => {
    dispatchEvent({
      type: 'power',
      data: { action: 'shutdown' }
    })
  })

  // on-ac / on-battery for laptops
  powerMonitor.on('on-ac', () => {
    dispatchEvent({
      type: 'power',
      data: { action: 'on-ac' }
    })
  })

  powerMonitor.on('on-battery', () => {
    dispatchEvent({
      type: 'power',
      data: { action: 'on-battery' }
    })
  })
}

export function stopPowerMonitor(): void {
  // Electron powerMonitor listeners cannot be individually removed easily,
  // but we set the flag so they won't be re-registered.
  listening = false
}
