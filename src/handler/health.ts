import type { Context } from 'hono';

// Health check handler
export const handleHealthCheck = (c: Context) => c.text('OK');
