import {fetchData} from './YF_components/fetchData_YahooFinance.js';

async function runTradingAlgorithm(log,interval=5) {
  try {
    let sharePriceElement, macdElement, signalLineElement;
    // let NIFTY50, MACD, SIGNAL;
    let balance, shares = 5, prevN50, prevMACD, prevSIGNAL, currentProfit=0, maxCapital, currCap;
     // Update interval in minutes

    let { nifty50, macd, signal } = await fetchData(false ,interval);
    let NIFTY50 = nifty50;
    let MACD = macd;
    let SIGNAL = signal;

    if(MACD <0 && SIGNAL <0 ) {
      if(MACD < SIGNAL) shares = 2;
      else shares = 5;
    }
    else if(MACD >0 && SIGNAL >0) {
      if(MACD < SIGNAL) shares = 4;
      else shares = 8;
    } 
    else if(MACD > 0 && SIGNAL < 0) shares = 8;
    else shares = 2;
    // Initialize trading variables
    balance = (10-shares)* NIFTY50;
    const startCap = 10*NIFTY50;
    maxCapital = startCap;
    prevN50 = NIFTY50;
    prevMACD = MACD;
    prevSIGNAL = SIGNAL;

    await log(`🚀Initilized Values :
      💰NIFTY50: ${NIFTY50} 
      📉 MACD: ${MACD}
      📈SIGNAL: ${SIGNAL}
      MaxCapital: assuming 10x of initial Nifty value  : (${balance}) ${shares} in shares ${10-shares} in blalance.
        Balance: ${balance}
        Shares: asuming initial ${shares} shares we have.
      CurrentProfit: ${currentProfit}
      _______________________________________`);

    while (true) {
      try {
        await log(`Waiting ${interval} minute(s) to update...`);
        await new Promise(resolve => setTimeout(resolve,  interval*60000 -1));
        // process.stdout.write('\x1b[1A\x1b[K');
        await log("Updating...");
        
        let newData;
        let attempts = 0;
        const maxAttempts = 5; // Prevent infinite looping

        // Keep refreshing until NIFTY50 changes
        do {
          if (attempts > 0) {
            await log(`NIFTY50 unchanged. Refreshing again... Attempt ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for page to reload
          }

          newData = await fetchData(false ,interval);
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
          🕛: ${new Date().toLocaleString()}
          ⌛: (${interval}minutes later):
          💭${message}
            💰NIFTY50: ${NIFTY50}
            📉MACD: ${MACD}
            📈SIGNAL: ${SIGNAL}
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
