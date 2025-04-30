const { homedir } = require('os');
const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(
    process.env.NODE_ENV === 'production' ? __dirname : homedir(),
    '.cache',
    'puppeteer'
  ),
};
