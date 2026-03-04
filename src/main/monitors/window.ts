import { exec } from 'child_process'
import { dispatchEvent } from '../event-dispatcher'

let watching = false
let watchTimer: ReturnType<typeof setInterval> | null = null
let lastWindowTitle = ''
let lastProcessName = ''

interface WindowInfo {
  title: string
  processName: string
  pid: number
  path: string
}

function getActiveWindow(): Promise<WindowInfo | null> {
  return new Promise((resolve) => {
    // PowerShell command to get active window info on Windows
    const psCmd = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Text;
        public class WinAPI {
          [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
          [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
          [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
        }
"@
      $hwnd = [WinAPI]::GetForegroundWindow()
      $sb = New-Object System.Text.StringBuilder 256
      [WinAPI]::GetWindowText($hwnd, $sb, 256) | Out-Null
      $title = $sb.ToString()
      $pid = 0
      [WinAPI]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
      $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
      $name = if($proc){$proc.ProcessName}else{""}
      $path = if($proc){$proc.Path}else{""}
      Write-Output "$title|$name|$pid|$path"
    `.replace(/\n/g, ' ')

    exec(
      `powershell -NoProfile -NonInteractive -Command "${psCmd}"`,
      { timeout: 5000 },
      (err, stdout) => {
        if (err) {
          resolve(null)
          return
        }
        const parts = stdout.trim().split('|')
        if (parts.length >= 4) {
          resolve({
            title: parts[0],
            processName: parts[1],
            pid: parseInt(parts[2], 10),
            path: parts[3]
          })
        } else {
          resolve(null)
        }
      }
    )
  })
}

async function checkWindow(): Promise<void> {
  const info = await getActiveWindow()
  if (!info || !info.title) return

  // Only dispatch when window changes
  if (info.title !== lastWindowTitle || info.processName !== lastProcessName) {
    lastWindowTitle = info.title
    lastProcessName = info.processName
    dispatchEvent({
      type: 'window',
      data: {
        title: info.title,
        process_name: info.processName,
        pid: info.pid,
        path: info.path
      }
    })
  }
}

export function startWindowMonitor(): void {
  if (watching) return
  watching = true
  lastWindowTitle = ''
  lastProcessName = ''
  watchTimer = setInterval(checkWindow, 1000)
}

export function stopWindowMonitor(): void {
  watching = false
  if (watchTimer) {
    clearInterval(watchTimer)
    watchTimer = null
  }
}
