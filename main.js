const { By, until } = require('selenium-webdriver');
const { setupBrowser } = require('./src/setupBrowser');
const { setupLogger } = require('./src/logger');
const { runTradingAlgorithm } = require('./src/tradingAlgorithm');
// const { connectToMongoDB } = require('./src/connectMongo');

const url = 'https://www.topstockresearch.com/rt/ViewInChart/NIFTY/MACD/Min5';
const userName = 'username';
const email = 'email';

(async function main() {
  // let db = await connectToMongoDB();
  let driver = await setupBrowser();
  const log = await setupLogger(userName, email );

  try {
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    await runTradingAlgorithm(driver, log);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // if (db) await db.client.close();
    await driver.quit();
  }
})();
