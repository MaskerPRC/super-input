import { Router } from 'express'
import os from 'os'
import { app } from 'electron'
import { getStats } from '../../database'
import { getMonitorStatus } from '../../monitors'

const router = Router()

router.get('/', (_req, res) => {
  const stats = getStats()
  const monitors = getMonitorStatus()
  const uptime = process.uptime()

  res.json({
    status: 'running',
    app_version: app.getVersion(),
    uptime_seconds: Math.floor(uptime),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      total_memory: os.totalmem(),
      free_memory: os.freemem(),
      cpus: os.cpus().length
    },
    monitors,
    stats
  })
})

export default router
