import {fetchData} from './YF_components/fetchData_YahooFinance.js';

async function runTradingAlgorithm(log) {
  try {
    let sharePriceElement, macdElement, signalLineElement;
    // let NIFTY50, MACD, SIGNAL;
    let balance, shares = 5, prevN50, prevMACD, prevSIGNAL, currentProfit=0, maxCapital, currCap;
    const t = 4.97; // Update interval in minutes

    let { nifty50, macd, signal } = await fetchData();
    let NIFTY50 = nifty50;
    let MACD = macd;
    let SIGNAL = signal;
    // Initialize trading variables
    balance = 5* NIFTY50;
    const startCap = balance;
    maxCapital = balance;
    prevN50 = NIFTY50;
    prevMACD = MACD;
    prevSIGNAL = SIGNAL;

    await log(`Initilized Values :
      NIFTY50: ${NIFTY50} 
      MACD: ${MACD}
      SIGNAL: ${SIGNAL}
      MaxCapital: assuming 10x of initial Nifty value  : (${balance}) 5 in share 5 in blalance.
        Balance: ${balance}
        Shares: asuming initial ${shares} shares we have.
      CurrentProfit: ${currentProfit}
      _______________________________________`);

    while (true) {
      try {
        await log(`Waiting ${t} minute(s) to update...`);
        await new Promise(resolve => setTimeout(resolve,  t*60000));
        // process.stdout.write('\x1b[1A\x1b[K');
        await log("Updating...4");
        await driver.navigate().refresh();
        
        let newData;
        let attempts = 0;
        const maxAttempts = 5; // Prevent infinite looping

        // Keep refreshing until NIFTY50 changes
        do {
          if (attempts > 0) {
            await log(`NIFTY50 unchanged. Refreshing again... Attempt ${attempts}/${maxAttempts}`);
            await driver.navigate().refresh();
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page to reload
          }

          newData = await fetchData();
          attempts++;
        } while (attempts < maxAttempts && newData.NIFTY50 === prevN50);

        if (attempts === maxAttempts) {
          await log("Max refresh attempts reached. Continuing with existing data.");
        }

        ({ nifty50, macd, signal } = newData);
        NIFTY50 = nifty50;
        MACD = macd;
        SIGNAL = signal;
        // Fetch updated elements
        // ({ NIFTY50, MACD, SIGNAL } = await fetchData(driver));

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

export  { runTradingAlgorithm };
