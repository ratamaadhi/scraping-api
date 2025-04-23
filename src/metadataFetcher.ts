import axios from 'axios';
import * as cheerio from 'cheerio';

interface Metadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
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
        // Use a common user-agent to mimic a browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Allow fetching from various sites, might need adjustments for specific site restrictions
      timeout: 10000, // 10 seconds timeout
    });

    const $ = cheerio.load(html);

    const getMetaTag = (name: string): string | undefined => {
      return $(`meta[name="${name}"]`).attr('content') || $(`meta[property="og:${name}"]`).attr('content') || $(`meta[property="twitter:${name}"]`).attr('content');
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
    console.error(`Error fetching metadata for ${url}:`, error.message);
    // Provide more specific error feedback if possible
    if (axios.isAxiosError(error)) {
        if (error.response) {
            throw new Error(`Failed to fetch URL: Status ${error.response.status}`);
        } else if (error.request) {
            throw new Error('Failed to fetch URL: No response received');
        }
    }
    throw new Error(`Failed to process metadata for ${url}`);
  }
}

export default fetchMetadata;
