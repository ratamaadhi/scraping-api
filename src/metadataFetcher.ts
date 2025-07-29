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
      'User-Agent':
        'WhatsApp/2.21.12.21 A',
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
