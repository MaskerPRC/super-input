import { exec } from 'child_process'
import { dispatchEvent } from '../event-dispatcher'

let watching = false
let watchTimer: ReturnType<typeof setInterval> | null = null
let lastDeviceList = ''

interface UsbDevice {
  deviceId: string
  name: string
  status: string
}

function getUsbDevices(): Promise<UsbDevice[]> {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -NonInteractive -Command "Get-PnpDevice -Class USB -Status OK | Select-Object InstanceId,FriendlyName,Status | ConvertTo-Json -Compress"`
    exec(cmd, { timeout: 10000 }, (err, stdout) => {
      if (err) {
        resolve([])
        return
      }
      try {
        const parsed = JSON.parse(stdout.trim())
        const devices = Array.isArray(parsed) ? parsed : [parsed]
        resolve(
          devices.map((d: { InstanceId?: string; FriendlyName?: string; Status?: string }) => ({
            deviceId: d.InstanceId || '',
            name: d.FriendlyName || '',
            status: d.Status || ''
          }))
        )
      } catch {
        resolve([])
      }
    })
  })
}

async function checkUsb(): Promise<void> {
  const devices = await getUsbDevices()
  const deviceKey = devices.map((d) => d.deviceId).sort().join('|')

  if (lastDeviceList && deviceKey !== lastDeviceList) {
    // Determine added/removed
    const oldSet = new Set(lastDeviceList.split('|'))
    const newSet = new Set(deviceKey.split('|'))

    const added = devices.filter((d) => !oldSet.has(d.deviceId))
    const removed = lastDeviceList
      .split('|')
      .filter((id) => id && !newSet.has(id))

    if (added.length > 0) {
      dispatchEvent({
        type: 'usb',
        data: {
          action: 'connected',
          devices: added
        }
      })
    }
    if (removed.length > 0) {
      dispatchEvent({
        type: 'usb',
        data: {
          action: 'disconnected',
          device_ids: removed
        }
      })
    }
  }

  lastDeviceList = deviceKey
}

export function startUsbMonitor(): void {
  if (watching) return
  watching = true
  lastDeviceList = ''
  // Initial scan
  checkUsb()
  watchTimer = setInterval(checkUsb, 3000)
}

export function stopUsbMonitor(): void {
  watching = false
  if (watchTimer) {
    clearInterval(watchTimer)
    watchTimer = null
  }
}
