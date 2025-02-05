const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const ltCapabilities = require('./capabilities');
const url = 'https://www.topstockresearch.com/rt/ViewInChart/NIFTY/MACD/Min5';
const userName = 'Devesh';
const email = 'suthar.d@outlook.com';
const USERNAME = ltCapabilities.capabilities["LT:Options"].username;
const KEY = ltCapabilities.capabilities["LT:Options"].accessKey;
const GRID_HOST = 'hub.lambdatest.com/wd/hub';
const gridUrl = 'https://' + USERNAME + ':' + KEY + '@' + GRID_HOST;


(async function scrapeLiveData() {
  const date = new Date();
  const logFileNmae = `log_${date.toISOString().replace(/:/g,'-')}.txt`;
  const logFileDir = './Logs';
  const logFilePath = path.join(logFileDir,logFileNmae);
  const logStream = fs.createWriteStream(logFilePath,{flag:'a'});
  logStream.write(`DATE, TIME of initilizaition : ${date.toLocaleString()}\n`);
  logStream.write(`User: ${userName}\n`);
  logStream.write(`Email:${email}\n\n\n`);
  
  function log(message){
    console.log(message);
    logStream.write(message + '\n');
  }

  let driver = await new Builder().usingServer(gridUrl).withCapabilities(ltCapabilities.capabilities).build();
  try {
    // Navigate to the target website
    await driver.get(url);
    try {
      // Wait until the page is fully loaded
      await driver.wait(until.elementLocated(By.css('body')), 10000);
      // Locate elements for Share Price, MACD, and Signal Line
      let sharePriceElement = await driver.findElement(By.xpath('//*[@id="mainController"]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[1]/td[2]'));
      let macdElement = await driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[4]/td[2]'));
      let signalLineElement = await driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[5]/td[2]'));
      // Extract text
      let NIFTY50 = parseFloat(await sharePriceElement.getText());
      let MACD = parseFloat(await macdElement.getText());
      let SIGNAL = parseFloat(await signalLineElement.getText());
      // Variables for trading algorithm
      let balance = 10 * NIFTY50;
      const startCap = balance;
      let shares = 0;
      let prevN50 = NIFTY50;
      let prevMACD = MACD;
      let prevSIGNAL = SIGNAL;
      let currentProfit = 0;
      let maxCapital = balance;
      let currCap;
      const t = 4.97; // Update interval in minutes
      await log(`NIFTY50 : ${NIFTY50} \nMACD : ${MACD}\nSIGNAL : ${SIGNAL}`);
      await log(`Current Capital: ${balance} \nMAX Capital: ${balance} \nShares: ${shares } \nInBalance: ${balance} \nCurrentProfit: ${currentProfit}\n`);
      while (true) {
        log(`Waiting ${t} minute(s) to update...`);
        await new Promise(resolve => setTimeout(resolve, t * 60000));
        log("Updating...");
        await driver.navigate().refresh();
        sharePriceElement = await driver.findElement(By.xpath('//*[@id="mainController"]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[1]/td[2]'));
        macdElement = await driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[4]/td[2]'));
        signalLineElement = await driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[5]/td[2]'));
        NIFTY50 = parseFloat(await sharePriceElement.getText());
        MACD = parseFloat(await macdElement.getText());
        SIGNAL = parseFloat(await signalLineElement.getText());
        await log(`NIFTY50 : ${NIFTY50} \nMACD : ${MACD}\nSIGNAL : ${SIGNAL}`);
        // Trading logic
        if (prevMACD < prevSIGNAL && MACD > SIGNAL) {
          if (MACD > 0) {
            let cap = Math.floor(balance / NIFTY50);
            shares += cap;
            balance -= cap * NIFTY50;
            await log(`BUY HIGH : share bough ${cap} , curr shares ${shares}`);
          } else {
            let cap = Math.floor(balance / NIFTY50 / 2);
            shares += cap;
            balance -= cap * NIFTY50;
            await log(`BUY LOW : share bought ${cap} , curr shares ${shares}`);
          }
        } else if (prevMACD > prevSIGNAL && MACD < SIGNAL) {
          if (SIGNAL > 0) {
            let cap = Math.floor(shares / 2);
            shares -= cap;
            balance += cap * NIFTY50;
            await log(`SELL LOW : share sold ${cap} , curr shares ${shares}`);
          } else {
            balance += shares * NIFTY50;
            shares = 0;
            await log(`SELL HIGH : share sold ${shares} , curr shares ${0}`);
          }
        } else {
            await log("NO BUY NO SELL CONTINUE...");
        }
          // Update capital and profit/loss
          currCap = balance + shares * NIFTY50;
          maxCapital = Math.max(currCap, maxCapital);
          currentProfit = currCap - startCap;
          await log(`Current Capital: ${currCap} \nMAX Capital: ${maxCapital} \nShares: ${shares} \nInBalance: ${balance} \nCurrentProfit: ${currentProfit}\n`);
          prevMACD = MACD;
          prevN50 = NIFTY50;
          prevSIGNAL = SIGNAL;
        }
      } catch (scrapeError) {
        await console.error('Error while scraping:', scrapeError);
      }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Do not close the browser as this runs indefinitely
    // await driver.quit();
  }
})();
