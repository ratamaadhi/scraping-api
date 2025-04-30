import axios from 'axios';
import type { CheerioAPI } from 'cheerio';
import * as cheerio from 'cheerio';

interface Metadata {
  title?: string;
  description?: string;
  image?: string;
  url: URL; // Use URL type for the URL
}

export default async function fetchMetadata(url: string): Promise<Metadata> {
  try {
    validateURL(url);
    const html = await getHTMLContent(url);
    const $: CheerioAPI = cheerio.load(html);
    
    return {
      title: cleanText(getMetaTag($, 'title')),
      description: cleanText(getMetaTag($, 'description')),
      image: getMetaTag($, 'image'),
      url: new URL(getMetaTag($, 'url') || url), // Use original URL as fallback
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    throw new Error(`Failed to process metadata for ${url}`);
  }
}

function validateURL(url: string): void {
  try {
    new URL(url);
  } catch (e) {
    throw new Error('Invalid URL');
  }
}

async function getHTMLContent(url: string): Promise<string> {
  const { data: html } = await axios.get(url, {
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.1,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  });
  return html;
}

function getMetaTag($: CheerioAPI, name: string): string | undefined {
  const metaTags = [
    `meta[name="${name}"]`,
    `meta[property="og:${name}"]`,
    `meta[property="twitter:${name}"]`
  ];
  
  for (const tag of metaTags) {
    const content = $(tag).attr('content');
    if (content) return content;
  }
  
  return undefined;
}

function cleanText(text?: string): string | undefined {
  return text?.trim();
}
