import type { Context } from 'hono';
import { z } from 'zod';
import { scrapeUrl } from '../scraper.js';

// Define Zod schema for URL validation
const urlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL format' }),
});

// Scrape handler
export const handleScrape = async (c: Context) => {
  const url = c.req.query('url');
  const validationResult = urlSchema.safeParse({ url });

  if (!validationResult.success) {
    // Combine Zod error messages for a clearer response
    const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
    return c.text(`Invalid input: ${errorMessages}`, 400);
  }

  const validatedUrl = validationResult.data.url; // Use validated URL

  try {
    const result = await scrapeUrl(validatedUrl); // Use validatedUrl and remove duplicate
    return c.json(result);
  } catch (error: any) {
    console.error(`Error scraping ${validatedUrl}:`, error); // Log with validatedUrl
    return c.text(error.message || 'Failed to scrape page', 500);
  }
};
