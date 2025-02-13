async function getNiftyData(interval = "5m") {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=${interval}&range=1d`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const result = data.chart.result[0];
        const closePrices = result.indicators.quote[0].close;

        if (!closePrices || closePrices.length < 26) {
            return { error: "Not enough data to calculate MACD." };
        }

        // Calculate MACD Line properly by aligning indexes
        const ema12 = calculateEMA(closePrices, 12);
        const ema26 = calculateEMA(closePrices, 26);
        let macdLine = ema12.slice(-ema26.length).map((value, index) => value - ema26[index]);

        // Ensure Signal Line has enough data
        let signalLine;
        if (macdLine.length >= 9) {
            signalLine = calculateEMA(macdLine, 9);
        } else {
            signalLine = new Array(macdLine.length).fill(macdLine[0]); // Prevent undefined issue
        }

        const signalDelta = -0.67;
        const macdDelta = -1.462;
        macdLine = macdLine.map(value => value + macdDelta);
        signalLine = signalLine.map(value => value + signalDelta);

        const macdHistogram = macdLine.map((value, index) => value - (signalLine[index] || 0));

        // Get the latest index safely
        const latestIndex = macdLine.length - 1;
        const signalIndex = signalLine.length - 1; // Ensure correct index

        return {
            macd: macdLine[latestIndex],
            signal: signalLine[signalIndex] || macdLine[latestIndex], // Fallback to MACD if undefined
            histogram: macdHistogram[latestIndex]
        };
    } catch (error) {
        return { error: `Failed to fetch MACD data: ${error.message}` };
    }
}


// Function to calculate EMA
function calculateEMA(prices, period) {
    const k = 2 / (period + 1);
    let emaArray = [];
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    emaArray.push(ema);
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * k + ema;
        emaArray.push(ema);
    }
    return emaArray;
}

// Export the function
export { getNiftyData };
