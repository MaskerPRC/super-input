import express from 'express'
import cors from 'cors'
import { getConfig } from '../database'
import actionsRouter from './routes/actions'
import statusRouter from './routes/status'
import browserRouter from './routes/browser'
import docsRouter from './routes/docs'

let server: ReturnType<typeof express.application.listen> | null = null

export function startApiServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const app = express()

    // Middleware
    app.use(cors())
    app.use(express.json({ limit: '50mb' }))

    // Optional API key auth
    app.use((req, res, next) => {
      const apiKey = getConfig('local_api_key')
      if (apiKey) {
        const provided =
          req.headers['x-api-key'] ||
          req.headers['authorization']?.replace('Bearer ', '')
        if (provided !== apiKey) {
          res.status(401).json({ error: 'Unauthorized' })
          return
        }
      }
      next()
    })

    // Routes
    app.use('/api/docs', docsRouter)
    app.use('/api/actions', actionsRouter)
    app.use('/api/status', statusRouter)
    app.use('/api/browser', browserRouter)

    // Start server
    const port = parseInt(getConfig('local_api_port') || '18677', 10)
    server = app.listen(port, '127.0.0.1', () => {
      console.log(`[API Server] Listening on http://127.0.0.1:${port}`)
      resolve(port)
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        server = app.listen(port + 1, '127.0.0.1', () => {
          console.log(`[API Server] Port ${port} in use, using ${port + 1}`)
          resolve(port + 1)
        })
      } else {
        reject(err)
      }
    })
  })
}

export function stopApiServer(): void {
  if (server) {
    server.close()
    server = null
  }
}
