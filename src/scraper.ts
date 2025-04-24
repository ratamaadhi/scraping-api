import puppeteer from 'puppeteer';

interface ScrapeResult {
  title: string | null;
  description: string | null;
  image: string | null;
  url?: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-http2'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for network activity to settle

    const title = await page.title();

    const getMetaTag = async (name: string): Promise<string | null> => {
      try {
        const selector = `meta[name="${name}"], meta[property="og:${name}"], meta[property="twitter:${name}"]`;

        const element = await page.$(selector);
        if (!element) {
          return null;
        }

        return await page.evaluate((el) => el.getAttribute('content'), element);
      } catch (error) {
        console.error(`Error getting meta tag ${name} for ${url}:`, error);
        return null;
      }
    };

    const description = await getMetaTag('description');
    const image = await getMetaTag('image');
    const siteUrl = (await getMetaTag('url')) || url;

    return {
      title,
      description,
      image,
      url: siteUrl,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    // Re-throw a more specific error or return a structured error object
    throw new Error(`Failed to scrape page: ${url}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
