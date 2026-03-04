import { BrowserWindow, screen } from 'electron'

export interface CustomDialogOptions {
  type?: 'info' | 'warning' | 'error' | 'question'
  title: string
  message: string
  detail?: string
  buttons?: string[]
  alwaysOnTop?: boolean
  position?: string // top-left|top-center|top-right|center-left|center|center-right|bottom-left|bottom-center|bottom-right
  width?: number
  height?: number
}

const TYPE_ICONS: Record<string, string> = {
  info: '\u2139',     // ℹ
  warning: '\u26A0',  // ⚠
  error: '\u2716',    // ✖
  question: '\u2753'  // ❓
}

function calcPosition(
  pos: string,
  winWidth: number,
  winHeight: number
): { x: number; y: number } {
  const display = screen.getPrimaryDisplay()
  const { width: sw, height: sh } = display.workAreaSize
  const { x: ox, y: oy } = display.workArea

  const margin = 20
  const positions: Record<string, { x: number; y: number }> = {
    'top-left':      { x: ox + margin,                        y: oy + margin },
    'top-center':    { x: ox + Math.round((sw - winWidth) / 2), y: oy + margin },
    'top-right':     { x: ox + sw - winWidth - margin,        y: oy + margin },
    'center-left':   { x: ox + margin,                        y: oy + Math.round((sh - winHeight) / 2) },
    'center':        { x: ox + Math.round((sw - winWidth) / 2), y: oy + Math.round((sh - winHeight) / 2) },
    'center-right':  { x: ox + sw - winWidth - margin,        y: oy + Math.round((sh - winHeight) / 2) },
    'bottom-left':   { x: ox + margin,                        y: oy + sh - winHeight - margin },
    'bottom-center': { x: ox + Math.round((sw - winWidth) / 2), y: oy + sh - winHeight - margin },
    'bottom-right':  { x: ox + sw - winWidth - margin,        y: oy + sh - winHeight - margin }
  }

  return positions[pos] || positions['center']
}

export function showCustomDialog(opts: CustomDialogOptions): Promise<{ response: number; buttonLabel: string }> {
  return new Promise((resolve) => {
    const w = opts.width || 420
    const h = opts.height || 260
    const pos = calcPosition(opts.position || 'center', w, h)
    const btns = opts.buttons && opts.buttons.length > 0 ? opts.buttons : ['OK']
    const icon = TYPE_ICONS[opts.type || 'info'] || TYPE_ICONS.info

    const dialogWin = new BrowserWindow({
      width: w,
      height: h,
      x: pos.x,
      y: pos.y,
      frame: false,
      resizable: false,
      movable: true,
      alwaysOnTop: opts.alwaysOnTop ?? false,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    const buttonsHtml = btns
      .map(
        (label, i) =>
          `<button class="btn${i === 0 ? ' btn-primary' : ''}" onclick="respond(${i})">${escapeHtml(label)}</button>`
      )
      .join('')

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;overflow:hidden}
  body{font-family:'JetBrains Mono',monospace;font-size:13px;background:#fff;color:#000;
    border:3px solid #000;display:flex;flex-direction:column}
  .titlebar{height:32px;background:#000;color:#fff;display:flex;align-items:center;
    justify-content:space-between;padding:0 12px;-webkit-app-region:drag;flex-shrink:0}
  .titlebar-text{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px}
  .close-btn{-webkit-app-region:no-drag;background:none;border:none;color:#fff;
    font-size:14px;cursor:pointer;padding:0 4px;opacity:0.7}
  .close-btn:hover{opacity:1}
  .body{flex:1;padding:20px;display:flex;gap:16px;overflow:auto}
  .icon{font-size:32px;flex-shrink:0;width:40px;text-align:center;line-height:40px}
  .content{flex:1;min-width:0}
  .msg{font-size:14px;font-weight:700;line-height:1.4;word-wrap:break-word}
  .detail{font-size:12px;color:#555;margin-top:8px;line-height:1.4;word-wrap:break-word}
  .footer{padding:12px 20px;display:flex;justify-content:flex-end;gap:8px;
    border-top:2px solid #000;flex-shrink:0}
  .btn{padding:6px 16px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
    text-transform:uppercase;letter-spacing:1px;border:2px solid #000;background:#fff;color:#000;
    cursor:pointer;box-shadow:3px 3px 0 #000}
  .btn:hover{background:#000;color:#fff;box-shadow:4px 4px 0 #333}
  .btn:active{box-shadow:1px 1px 0 #000;transform:translate(2px,2px)}
  .btn-primary{background:#000;color:#fff}
  .btn-primary:hover{background:#fff;color:#000}
</style></head>
<body>
  <div class="titlebar">
    <span class="titlebar-text">${escapeHtml(opts.title)}</span>
    <button class="close-btn" onclick="respond(0)">\u2715</button>
  </div>
  <div class="body">
    <div class="icon">${icon}</div>
    <div class="content">
      <div class="msg">${escapeHtml(opts.message)}</div>
      ${opts.detail ? `<div class="detail">${escapeHtml(opts.detail)}</div>` : ''}
    </div>
  </div>
  <div class="footer">${buttonsHtml}</div>
  <script>
    function respond(index) {
      const title = document.title;
      document.title = '__response__' + index;
    }
  </script>
</body></html>`

    dialogWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    dialogWin.once('ready-to-show', () => {
      dialogWin.show()
    })

    // Listen for title change as IPC-free communication channel
    dialogWin.on('page-title-updated', (_e, title) => {
      if (title.startsWith('__response__')) {
        const index = parseInt(title.replace('__response__', ''), 10)
        resolve({ response: index, buttonLabel: btns[index] || '' })
        dialogWin.close()
      }
    })

    dialogWin.on('closed', () => {
      // If closed without response (e.g. Alt+F4), return 0
      resolve({ response: 0, buttonLabel: btns[0] || '' })
    })
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
