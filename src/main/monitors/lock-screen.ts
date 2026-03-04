import { powerMonitor } from 'electron'
import { dispatchEvent } from '../event-dispatcher'

let listening = false

export function startLockScreenMonitor(): void {
  if (listening) return
  listening = true

  powerMonitor.on('lock-screen', () => {
    dispatchEvent({
      type: 'lock',
      data: { action: 'lock-screen' }
    })
  })

  powerMonitor.on('unlock-screen', () => {
    dispatchEvent({
      type: 'lock',
      data: { action: 'unlock-screen' }
    })
  })
}

export function stopLockScreenMonitor(): void {
  listening = false
}
