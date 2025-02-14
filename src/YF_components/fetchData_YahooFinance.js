import { fetchNiftyData } from "./YF_nifty50.js";
import { getNiftyData } from "./YF_macd_signal.js";

async function fetchData(print = true , interval = 5) {
    try {
        const niftyData = await fetchNiftyData(`${interval}m`);
        const macdData = await getNiftyData(`${interval}m`);

        if (niftyData.error) console.error(niftyData.error);
        if (macdData.error) console.error(macdData.error);

        // Combine all latest data
        const latestData = {
            nifty50: niftyData.close,
            macd: macdData.macd,
            signal: macdData.signal
        };

        // Decide whether to print or return data
        if (print) {
            console.log(`💰 NIFTY50 Close: ${latestData.nifty50}`);
            console.log(`📉 MACD Line: ${latestData.macd}`);
            console.log(`📈 Signal Line: ${latestData.signal}`);
            console.log("----------------------------");
        } else {
            return latestData;
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Export function for external use
export { fetchData };

// Run automatically every 5 minutes
// setInterval(fetchData, 5 * 60 * 1000);

// Run immediately on start
// fetchData(true);
