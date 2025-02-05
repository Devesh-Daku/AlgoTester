const { By } = require('selenium-webdriver');

async function runTradingAlgorithm(driver, log, db) {
  try {
    let sharePriceElement, macdElement, signalLineElement;
    let NIFTY50, MACD, SIGNAL;
    let balance, shares = 0, prevN50, prevMACD, prevSIGNAL, currentProfit=0, maxCapital, currCap;
    const t = 0.97; // Update interval in minutes

    // Function to fetch and parse element values
    async function getElementValue(element) {
      return parseFloat(await element.getText());
    }

    // Function to fetch all required elements
    async function fetchElements() {
      [sharePriceElement, macdElement, signalLineElement] = await Promise.all([
        driver.findElement(By.xpath('//*[@id="mainController"]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[1]/td[2]')),
        driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[4]/td[2]')),
        driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[5]/td[2]'))
      ]);
    }

    // Initial fetch of elements
    await fetchElements();

    // Extract initial values
    [NIFTY50, MACD, SIGNAL] = await Promise.all([
      getElementValue(sharePriceElement),
      getElementValue(macdElement),
      getElementValue(signalLineElement)
    ]);

    // Initialize trading variables
    balance = 10 * NIFTY50;
    const startCap = balance;
    maxCapital = balance;
    prevN50 = NIFTY50;
    prevMACD = MACD;
    prevSIGNAL = SIGNAL;

    await log(`Initial - NIFTY50: ${NIFTY50} \nMACD: ${MACD}\nSIGNAL: ${SIGNAL}`);
    await log(` Initial Capital: ${balance}\n Shares: ${shares}\n CurrentProfit: ${currentProfit}\n`);

    while (true) {
      try {
        await log(`Waiting ${t} minute(s) to update...`);
        await new Promise(resolve => setTimeout(resolve,  60000));
        // process.stdout.write('\x1b[1A\x1b[K');
        await log("Updating...4");
        await driver.navigate().refresh();
        await new Promise(resolve => setTimeout(resolve,  60000));
        await log("Updating...3");
        await driver.navigate().refresh();
        await new Promise(resolve => setTimeout(resolve,  60000));
        await log("Updating...2");
        await driver.navigate().refresh();
        await new Promise(resolve => setTimeout(resolve,  60000));
        await log("Updating...1");
        await driver.navigate().refresh();
        await new Promise(resolve => setTimeout(resolve,t*60000));
        await log("Updating...");
        await driver.navigate().refresh();

        // Fetch updated elements
        await fetchElements();

        // Extract updated values
        [NIFTY50, MACD, SIGNAL] = await Promise.all([
          getElementValue(sharePriceElement),
          getElementValue(macdElement),
          getElementValue(signalLineElement)
        ]);

        await log(`Updated - NIFTY50: ${NIFTY50}\n MACD: ${MACD}\n SIGNAL: ${SIGNAL}\n`);

        // Trading logic
        if (prevMACD < prevSIGNAL && MACD > SIGNAL) {
          const cap = MACD > 0 ? Math.floor(balance / NIFTY50) : Math.floor(balance / NIFTY50 / 2);
          shares += cap;
          balance -= cap * NIFTY50;
          await log(`BUY ${MACD > 0 ? 'HIGH' : 'LOW'}: shares bought ${cap}, current shares ${shares}\n`);
        } else if (prevMACD > prevSIGNAL && MACD < SIGNAL) {
          if (SIGNAL > 0) {
            const cap = Math.floor(shares / 2);
            shares -= cap;
            balance += cap * NIFTY50;
            await log(`SELL LOW: shares sold ${cap}, current shares ${shares}\n`);
          } else {
            balance += shares * NIFTY50;
            await log(`SELL HIGH: shares sold ${shares}, current shares 0\n`);
            shares = 0;
          }
        } else {
          await log("NO BUY NO SELL CONTINUE...\n");
        }

        // Update capital and profit/loss
        currCap = balance + shares * NIFTY50;
        maxCapital = Math.max(currCap, maxCapital);
        currentProfit = currCap - startCap;
        await log(`Current Capital: ${currCap}\nMAX Capital: ${maxCapital}\nShares: ${shares} \nInBalance: ${balance}\nCurrentProfit: ${currentProfit}\n`);

        // Update previous values
        prevMACD = MACD;
        prevN50 = NIFTY50;
        prevSIGNAL = SIGNAL;

      } catch (iterationError) {
        await log(`Error in iteration: ${iterationError.message}`);
        // Decide whether to continue or break based on the error
      }
    }
  } catch (algorithmError) {
    await log(`Fatal error in trading algorithm: ${algorithmError.message}`);
    throw algorithmError;
  }
}

module.exports = { runTradingAlgorithm };
