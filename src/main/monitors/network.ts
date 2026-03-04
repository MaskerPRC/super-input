import { exec } from 'child_process'
import { dispatchEvent } from '../event-dispatcher'

let watching = false
let watchTimer: ReturnType<typeof setInterval> | null = null
let lastNetworkState = ''
let lastIpAddresses = ''

interface NetworkInterface {
  name: string
  ip: string
  mac: string
  status: string
}

function getNetworkInterfaces(): Promise<NetworkInterface[]> {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -NonInteractive -Command "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | ForEach-Object { $adapter = $_; $ip = (Get-NetIPAddress -InterfaceIndex $_.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress; [PSCustomObject]@{Name=$_.Name;IP=if($ip){$ip}else{''};MAC=$_.MacAddress;Status=$_.Status} } | ConvertTo-Json -Compress"`
    exec(cmd, { timeout: 10000 }, (err, stdout) => {
      if (err) {
        resolve([])
        return
      }
      try {
        const trimmed = stdout.trim()
        if (!trimmed) {
          resolve([])
          return
        }
        const parsed = JSON.parse(trimmed)
        const items = Array.isArray(parsed) ? parsed : [parsed]
        resolve(
          items.map((i: { Name?: string; IP?: string; MAC?: string; Status?: string }) => ({
            name: i.Name || '',
            ip: i.IP || '',
            mac: i.MAC || '',
            status: i.Status || ''
          }))
        )
      } catch {
        resolve([])
      }
    })
  })
}

async function checkNetwork(): Promise<void> {
  const interfaces = await getNetworkInterfaces()
  const currentState = interfaces.map((i) => `${i.name}:${i.status}`).sort().join('|')
  const currentIps = interfaces.map((i) => `${i.name}:${i.ip}`).sort().join('|')

  if (lastNetworkState && currentState !== lastNetworkState) {
    dispatchEvent({
      type: 'network',
      data: {
        action: 'connection-change',
        interfaces
      }
    })
  } else if (lastIpAddresses && currentIps !== lastIpAddresses) {
    dispatchEvent({
      type: 'network',
      data: {
        action: 'ip-change',
        interfaces
      }
    })
  }

  lastNetworkState = currentState
  lastIpAddresses = currentIps
}

export function startNetworkMonitor(): void {
  if (watching) return
  watching = true
  lastNetworkState = ''
  lastIpAddresses = ''
  checkNetwork()
  watchTimer = setInterval(checkNetwork, 5000)
}

export function stopNetworkMonitor(): void {
  watching = false
  if (watchTimer) {
    clearInterval(watchTimer)
    watchTimer = null
  }
}
