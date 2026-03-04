import { clipboard, NativeImage } from 'electron'
import crypto from 'crypto'
import { dispatchEvent } from '../event-dispatcher'
import { getConfig } from '../database'

let watching = false
let watchTimer: ReturnType<typeof setInterval> | null = null
let lastTextHash = ''
let lastImageHash = ''
let lastFilePaths = ''

function hashContent(content: string | Buffer): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

function checkClipboard(): void {
  const watchTypes = getConfig('clipboard_watch_types').split(',')
  const maxFileSize = parseInt(getConfig('clipboard_max_file_size') || '10485760', 10)

  // Check text
  if (watchTypes.includes('text')) {
    try {
      const text = clipboard.readText()
      if (text) {
        const textHash = hashContent(text)
        if (textHash !== lastTextHash) {
          lastTextHash = textHash
          const shouldPush = getConfig('clipboard_push_text') === 'true'
          dispatchEvent({
            type: 'clipboard',
            data: {
              content_type: 'text',
              content: shouldPush && text.length <= maxFileSize ? text : undefined,
              length: text.length,
              hash: textHash,
              truncated: text.length > maxFileSize
            }
          })
        }
      }
    } catch {
      // ignore read errors
    }
  }

  // Check image
  if (watchTypes.includes('image')) {
    try {
      const image: NativeImage = clipboard.readImage()
      if (!image.isEmpty()) {
        const pngBuffer = image.toPNG()
        const imageHash = hashContent(pngBuffer)
        if (imageHash !== lastImageHash) {
          lastImageHash = imageHash
          const shouldPush = getConfig('clipboard_push_image') === 'true'
          const size = image.getSize()
          dispatchEvent({
            type: 'clipboard',
            data: {
              content_type: 'image',
              width: size.width,
              height: size.height,
              size_bytes: pngBuffer.length,
              content: shouldPush && pngBuffer.length <= maxFileSize
                ? pngBuffer.toString('base64')
                : undefined,
              hash: imageHash,
              truncated: pngBuffer.length > maxFileSize
            }
          })
        }
      }
    } catch {
      // ignore read errors
    }
  }

  // Check files (Windows: FileNameW format)
  if (watchTypes.includes('file')) {
    try {
      const rawBuffer = clipboard.readBuffer('FileNameW')
      if (rawBuffer && rawBuffer.length > 0) {
        // Decode UTF-16LE file paths separated by null characters
        const decoded = rawBuffer.toString('utf16le').replace(/\0+$/, '')
        if (decoded && decoded !== lastFilePaths) {
          lastFilePaths = decoded
          const filePaths = decoded.split('\0').filter(Boolean)
          const shouldPush = getConfig('clipboard_push_file') === 'true'
          dispatchEvent({
            type: 'clipboard',
            data: {
              content_type: 'file',
              file_paths: shouldPush ? filePaths : undefined,
              file_count: filePaths.length,
              hash: hashContent(decoded)
            }
          })
        }
      }
    } catch {
      // FileNameW not available on all platforms
    }
  }
}

export function startClipboardMonitor(): void {
  if (watching) return
  watching = true
  // Reset state
  lastTextHash = ''
  lastImageHash = ''
  lastFilePaths = ''
  // Initialize with current clipboard content to avoid false trigger on start
  try { lastTextHash = hashContent(clipboard.readText() || '') } catch { /* */ }
  try {
    const img = clipboard.readImage()
    if (!img.isEmpty()) lastImageHash = hashContent(img.toPNG())
  } catch { /* */ }
  watchTimer = setInterval(checkClipboard, 500)
}

export function stopClipboardMonitor(): void {
  watching = false
  if (watchTimer) {
    clearInterval(watchTimer)
    watchTimer = null
  }
}
