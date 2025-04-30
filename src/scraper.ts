import puppeteer, { type LaunchOptions } from 'puppeteer';

interface ScrapeResult {
  title: string | null;
  description: string | null;
  image: string | null;
  url?: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  let browser: puppeteer.Browser | null = null;

  try {
    const launchOptions: LaunchOptions = {
      headless: true,
      args: ['--disable-http2'],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/opt/render/.cache/puppeteer/chrome/linux-135.0.7049.95/chrome-linux64/chrome'
          : undefined,
    };

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    );

    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });
    if (!response || !response.ok()) {
      throw new Error(
        `Failed to load page: ${url}, Status: ${response?.status()}`
      );
    }

    const finalUrl = response.url() || page.url();
    const title = await page.title();

    const description = await getElementAttribute(
      page,
      'meta[property="og:description"]',
      'content'
    );
    const image = await getElementAttribute(
      page,
      'meta[property="og:image"]',
      'content'
    );
    const siteUrl =
      (await getElementAttribute(page, 'meta[property="og:url"]', 'content')) ||
      finalUrl;

    return {
      title,
      description,
      image,
      url: siteUrl,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function getElementAttribute(
  page: puppeteer.Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  return page.evaluate(
    (selector, attribute) => {
      const element = document.querySelector(selector);
      if (element) {
        return element.getAttribute(attribute);
      }
      return null;
    },
    selector,
    attribute
  );
}
