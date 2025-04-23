import axios from 'axios';
import * as cheerio from 'cheerio';

interface Metadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string; // Consider making this a URL type
}

async function fetchMetadata(url: string): Promise<Metadata> {
  try {
    // Validate URL
    try {
      new URL(url);
    } catch (_) {
      throw new Error('Invalid URL provided');
    }

    const { data: html } = await axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; Bot/0.1; +http://example.com)'
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    const getMetaTag = (name: string): string | undefined => {
      // Consolidate meta tag retrieval
      return $(`meta[name="${name}"], meta[property="og:${name}"], meta[property="twitter:${name}"]`).attr('content');
    };

    const title = getMetaTag('title') || $('title').first().text();
    const description = getMetaTag('description');
    const image = getMetaTag('image');
    const siteUrl = getMetaTag('url') || url; // Use original URL as fallback

    // Basic cleanup
    const cleanText = (text?: string): string | undefined => text?.trim();

    return {
      title: cleanText(title),
      description: cleanText(description),
      image: image, // URLs usually don't need trimming
      url: siteUrl,
    };
  } catch (error: any) {
    console.error(`Error fetching metadata for ${url}:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Failed to fetch ${url}: Status ${error.response.status}`);
      } else if (error.request) {
        throw new Error(`Failed to fetch ${url}: No response received`);
      }
    }
    throw new Error(`Failed to process metadata for ${url}`);
  }
}

export default fetchMetadata;
