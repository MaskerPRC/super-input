import { getConfig } from '../database'
import { startClipboardMonitor, stopClipboardMonitor } from './clipboard'
import { startWindowMonitor, stopWindowMonitor } from './window'
import { startPowerMonitor, stopPowerMonitor } from './power'
import { startLockScreenMonitor, stopLockScreenMonitor } from './lock-screen'
import { startUsbMonitor, stopUsbMonitor } from './usb'
import { startNetworkMonitor, stopNetworkMonitor } from './network'
import { startIdleMonitor, stopIdleMonitor } from './idle'

const monitors = {
  clipboard: { start: startClipboardMonitor, stop: stopClipboardMonitor, configKey: 'monitor_clipboard' },
  window: { start: startWindowMonitor, stop: stopWindowMonitor, configKey: 'monitor_window' },
  power: { start: startPowerMonitor, stop: stopPowerMonitor, configKey: 'monitor_power' },
  lock: { start: startLockScreenMonitor, stop: stopLockScreenMonitor, configKey: 'monitor_lock' },
  usb: { start: startUsbMonitor, stop: stopUsbMonitor, configKey: 'monitor_usb' },
  network: { start: startNetworkMonitor, stop: stopNetworkMonitor, configKey: 'monitor_network' },
  idle: { start: startIdleMonitor, stop: stopIdleMonitor, configKey: 'monitor_idle' }
}

export type MonitorName = keyof typeof monitors

export function startAllMonitors(): void {
  for (const [name, monitor] of Object.entries(monitors)) {
    const enabled = getConfig(monitor.configKey)
    if (enabled === 'true') {
      console.log(`[Monitor] Starting: ${name}`)
      monitor.start()
    }
  }
}

export function stopAllMonitors(): void {
  for (const [name, monitor] of Object.entries(monitors)) {
    console.log(`[Monitor] Stopping: ${name}`)
    monitor.stop()
  }
}

export function startMonitor(name: MonitorName): void {
  monitors[name]?.start()
}

export function stopMonitor(name: MonitorName): void {
  monitors[name]?.stop()
}

export function getMonitorStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {}
  for (const [name, monitor] of Object.entries(monitors)) {
    status[name] = getConfig(monitor.configKey) === 'true'
  }
  return status
}
