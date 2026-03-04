import { Router } from 'express'
import {
  handleNotification,
  handleDialog,
  handleClipboardWrite,
  handleShellOpen,
  handleScreenshot,
  handleTts
} from '../handlers/actions'

const router = Router()

router.post('/notification', handleNotification)
router.post('/dialog', handleDialog)
router.post('/clipboard', handleClipboardWrite)
router.post('/shell-open', handleShellOpen)
router.post('/screenshot', handleScreenshot)
router.post('/tts', handleTts)

export default router
