import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleHealthCheck } from './handler/health.js';
import { handleMetadataFetch } from './handler/metadata.js';
import { handleScrape } from './handler/scrape.js';

const app = new Hono();

app.use(cors());

app.get('/metadata', handleMetadataFetch);
app.get('/health', handleHealthCheck);
app.get('/scrape', handleScrape);

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
