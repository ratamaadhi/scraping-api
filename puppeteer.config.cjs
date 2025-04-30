const { homedir } = require('os');
const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory:
    process.env.NODE_ENV === 'production'
      ? process.env.PUPPETEER_CACHE_DIR
      : join(homedir(), '.cache', 'puppeteer'),
};
