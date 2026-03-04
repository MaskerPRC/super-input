import { Notification, clipboard, shell, desktopCapturer } from 'electron'
import { insertActionLog } from '../../database'
import { showCustomDialog } from './custom-dialog'
import type { Request, Response } from 'express'

export async function handleNotification(req: Request, res: Response): Promise<void> {
  const { title, body, icon } = req.body
  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' })
    return
  }

  const notif = new Notification({ title, body, icon: icon || undefined })
  notif.show()

  insertActionLog('notification', req.body, req.headers['x-source'] as string || 'local-api', { success: true })
  res.json({ success: true })
}

export async function handleDialog(req: Request, res: Response): Promise<void> {
  const { type = 'info', title, message, buttons, detail, alwaysOnTop, position, width, height } = req.body
  if (!title || !message) {
    res.status(400).json({ error: 'title and message are required' })
    return
  }

  try {
    const result = await showCustomDialog({
      type: type as 'info' | 'warning' | 'error' | 'question',
      title,
      message,
      detail,
      buttons: buttons || ['OK'],
      alwaysOnTop: !!alwaysOnTop,
      position: position || 'center',
      width,
      height
    })
    const actionResult = { response: result.response, buttonLabel: result.buttonLabel }
    insertActionLog('dialog', req.body, req.headers['x-source'] as string || 'local-api', actionResult)
    res.json({ success: true, ...actionResult })
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: errMsg })
  }
}

export async function handleClipboardWrite(req: Request, res: Response): Promise<void> {
  const { type = 'text', content } = req.body
  if (!content) {
    res.status(400).json({ error: 'content is required' })
    return
  }

  if (type === 'text') {
    clipboard.writeText(content)
  } else if (type === 'image') {
    // Expect base64 PNG
    const img = require('electron').nativeImage.createFromBuffer(Buffer.from(content, 'base64'))
    clipboard.writeImage(img)
  }

  insertActionLog('clipboard', req.body, req.headers['x-source'] as string || 'local-api', { success: true })
  res.json({ success: true })
}

export async function handleShellOpen(req: Request, res: Response): Promise<void> {
  const { target } = req.body
  if (!target) {
    res.status(400).json({ error: 'target is required' })
    return
  }

  await shell.openExternal(target)
  insertActionLog('shell-open', req.body, req.headers['x-source'] as string || 'local-api', { success: true })
  res.json({ success: true })
}

export async function handleScreenshot(req: Request, res: Response): Promise<void> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    })
    const primary = sources[0]
    if (!primary) {
      res.status(500).json({ error: 'No screen source found' })
      return
    }

    const screenshot = primary.thumbnail.toPNG().toString('base64')
    insertActionLog('screenshot', req.body || {}, req.headers['x-source'] as string || 'local-api', { success: true, size: screenshot.length })
    res.json({ success: true, image: screenshot })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: message })
  }
}

export async function handleTts(req: Request, res: Response): Promise<void> {
  const { text, rate, voice } = req.body
  if (!text) {
    res.status(400).json({ error: 'text is required' })
    return
  }

  try {
    const say = require('say')
    await new Promise<void>((resolve, reject) => {
      say.speak(text, voice || null, rate || 1.0, (err: Error | null) => {
        if (err) reject(err)
        else resolve()
      })
    })

    insertActionLog('tts', req.body, req.headers['x-source'] as string || 'local-api', { success: true })
    res.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: message })
  }
}
