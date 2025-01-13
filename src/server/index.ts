import path from 'node:path'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
// import { logger } from 'hono/logger'
import type { AutoloadRoutesOptions } from 'universal-autorouter'
import vike from 'vike-node/hono'

const app = new Hono()

app.use(cors())

let autoloadRoutes
const autoloadRoutesOptions: AutoloadRoutesOptions = {
  prefix: '/api',
  routesDir: path.resolve(import.meta.dirname, 'api')
}
if (process.env.NODE_ENV === 'production') {
  ({ default: autoloadRoutes } = await import('universal-autorouter'))
  autoloadRoutesOptions.pattern = '**/*.mjs'
} else {
  ({ default: autoloadRoutes } = await import('universal-autorouter-hono'))
  autoloadRoutesOptions.pattern = '**/*.ts'
  autoloadRoutesOptions.viteDevServer = globalThis.__vikeNode!.viteDevServer
}

await autoloadRoutes(app, autoloadRoutesOptions)

// app.use(logger())

app.use(vike())

const port = +(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port
}, () => console.log(`Server running at http://localhost:${port}`))
