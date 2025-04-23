import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import fetchMetadata from './metadataFetcher.js'

const app = new Hono()

app.use(cors())

app.get('/metadata', async (c) => {
  const url = c.req.query('url')
  if (!url) {
    return c.text('URL query parameter is required', 400)
  }

  try {
    const metadata = await fetchMetadata(url)
    return c.json(metadata)
  } catch (error) {
    return c.text('Failed to fetch metadata', 500)
  }
})

app.get('/health', (c) => c.text('OK'))

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
