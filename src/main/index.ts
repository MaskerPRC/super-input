import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import path from 'path'
import { initDatabase, closeDatabase, cleanOldLogs, getConfig } from './database'
import { setMainWindow } from './event-dispatcher'
import { startAllMonitors, stopAllMonitors } from './monitors'
import { startApiServer, stopApiServer } from './api-server'
import { startPolling, stopPolling } from './polling'
import { setupIpcHandlers } from './ipc'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 36
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    backgroundColor: '#ffffff',
    show: false
  })

  setMainWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // In development, load from dev server; in production, load built files
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Minimize to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTray(): void {
  // Create a simple 16x16 tray icon
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABhSURBVDiNY/z//z8DEwMDAwMDAwOTkpISIwMDA8P///8ZGBgYGJiUlJQY////z8DIyMjw//9/BgYGBoZ/f/8xMDAw/GNkZGT49/cfAwMDA8O/v/8YGBgYGP79/cfAwMDAAAAxGBUjDdZ0vgAAAABJRU5ErkJggg==',
      'base64'
    )
  )

  tray = new Tray(icon)
  tray.setToolTip('PC Agent')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => mainWindow?.show()
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

// Extend app type to include isQuitting flag
declare module 'electron' {
  interface App {
    isQuitting: boolean
  }
}

app.isQuitting = false

app.whenReady().then(async () => {
  // 1. Initialize database
  initDatabase()
  console.log('[App] Database initialized')

  // 2. Clean old logs
  const retentionDays = parseInt(getConfig('log_retention_days') || '30', 10)
  cleanOldLogs(retentionDays)

  // 3. Setup IPC handlers
  setupIpcHandlers()
  console.log('[App] IPC handlers registered')

  // 4. Start monitors
  startAllMonitors()
  console.log('[App] Monitors started')

  // 5. Start local API server
  const port = await startApiServer()
  console.log(`[App] API server on port ${port}`)

  // 6. Start polling (if enabled)
  startPolling()
  console.log('[App] Polling initialized')

  // 7. Create window and tray
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  app.isQuitting = true
  stopAllMonitors()
  stopPolling()
  stopApiServer()
  closeDatabase()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit - keep running in tray
  }
})
