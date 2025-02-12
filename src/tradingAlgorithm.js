const {fetchData} = require('./fetchData');

async function runTradingAlgorithm(driver, log, db) {
  try {
    let sharePriceElement, macdElement, signalLineElement;
    // let NIFTY50, MACD, SIGNAL;
    let balance, shares = 0, prevN50, prevMACD, prevSIGNAL, currentProfit=0, maxCapital, currCap;
    const t = 4.97; // Update interval in minutes

    let { NIFTY50, MACD, SIGNAL } = await fetchData(driver);

    // Initialize trading variables
    balance = 10 * NIFTY50;
    const startCap = balance;
    maxCapital = balance;
    prevN50 = NIFTY50;
    prevMACD = MACD;
    prevSIGNAL = SIGNAL;

    await log(`Initilized Values :
      NIFTY50: ${NIFTY50} 
      MACD: ${MACD}
      SIGNAL: ${SIGNAL}
      MaxCapital: assuming 10x of initial Nifty value(${balance})
      Balance: ${balance}
      Shares: ${shares}
      CurrentProfit: ${currentProfit}
      _______________________________________`);

    while (true) {
      try {
        await log(`Waiting ${t} minute(s) to update...`);
        await new Promise(resolve => setTimeout(resolve,  t*60000));
        // process.stdout.write('\x1b[1A\x1b[K');
        await log("Updating...4");
        await driver.navigate().refresh();
        
        // Fetch updated elements
        ({ NIFTY50, MACD, SIGNAL } = await fetchData(driver));

        let message = '';
        // Trading logic
        if (prevMACD < prevSIGNAL && MACD > SIGNAL) {
          const cap = MACD > 0 ? Math.floor(balance / NIFTY50) : Math.floor(balance / NIFTY50 / 2);
          shares += cap;
          balance -= cap * NIFTY50;
          message = (`BUY ${MACD > 0 ? 'HIGH' : 'LOW'}: shares bought ${cap}, current shares ${shares}\n`);
        } else if (prevMACD > prevSIGNAL && MACD < SIGNAL) {
          if (SIGNAL > 0) {
            const cap = Math.floor(shares / 2);
            shares -= cap;
            balance += cap * NIFTY50;
            message = (`SELL LOW: shares sold ${cap}, current shares ${shares}\n`);
          } else {
            balance += shares * NIFTY50;
            message = (`SELL HIGH: shares sold ${shares}, current shares 0\n`);
            shares = 0;
          }
        } else {
          message = ("NO BUY NO SELL CONTINUE...\n");
        }

        // Update capital and profit/loss
        currCap = balance + shares * NIFTY50;
        maxCapital = Math.max(currCap, maxCapital);
        currentProfit = currCap - startCap;
        await log(`
          time : ${new Date().toLocaleString()}
          Update (${t}minutes later):
          ${message}
            *NIFTY50: ${NIFTY50}
            *MACD: ${MACD}
            *SIGNAL: ${SIGNAL}
            ->Current Cap: ${currCap}
                ->Balance: ${balance}
                ->Shares : ${shares}
            >MAX Cap Ever : ${maxCapital}
            >CurrentProfit: ${currentProfit}
            -------------------------------------------------
          `);
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
