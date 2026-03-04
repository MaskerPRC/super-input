import { Router } from 'express'
import {
  insertBrowserCommand,
  getPendingBrowserCommands,
  updateBrowserCommandResult,
  insertEventLog
} from '../../database'

const router = Router()

// Browser extension reports data (current URL, page title, etc.)
router.post('/report', (req, res) => {
  const { url, title, selection, type = 'page-info', ...rest } = req.body

  insertEventLog('browser', {
    type,
    url,
    title,
    selection,
    ...rest
  })

  res.json({ success: true })
})

// Browser extension polls for pending commands
router.get('/commands', (_req, res) => {
  const commands = getPendingBrowserCommands()
  // Mark them as 'sent' so they don't get picked up again
  for (const cmd of commands as { id: number }[]) {
    updateBrowserCommandResult(cmd.id, 'sent')
  }
  res.json({ commands })
})

// Browser extension reports command execution result
router.post('/command-result', (req, res) => {
  const { id, status, result } = req.body
  if (!id) {
    res.status(400).json({ error: 'command id is required' })
    return
  }
  updateBrowserCommandResult(id, status || 'completed', result)
  res.json({ success: true })
})

// Client enqueues a command for the browser extension
router.post('/command', (req, res) => {
  const { type, data } = req.body
  if (!type) {
    res.status(400).json({ error: 'command type is required' })
    return
  }
  const id = insertBrowserCommand(type, data || {})
  res.json({ success: true, command_id: id })
})

export default router
