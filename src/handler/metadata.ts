import type { Context } from 'hono';
import { z } from 'zod';
import fetchMetadata from '../metadataFetcher.js';

// Define Zod schema for URL validation
const urlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL format' }),
});

// Metadata fetch handler
export const handleMetadataFetch = async (c: Context) => {
  const url = c.req.query('url');
  const validationResult = urlSchema.safeParse({ url });

  if (!validationResult.success) {
    // Combine Zod error messages for a clearer response
    const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
    return c.text(`Invalid input: ${errorMessages}`, 400);
  }

  const validatedUrl = validationResult.data.url; // Use validated URL

  try {
    const metadata = await fetchMetadata(validatedUrl); // Use validatedUrl and remove duplicate
    return c.json(metadata);
  } catch (error: any) {
    console.error(`Error fetching metadata for ${validatedUrl}:`, error); // Log with validatedUrl
    return c.text(error.message || 'Failed to fetch metadata', 500);
  }
};
