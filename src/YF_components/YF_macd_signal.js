async function getNiftyData(interval = "5m") {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=${interval}&range=5d`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Validate response structure
        if (!data.chart || !data.chart.result || !data.chart.result[0]) {
            throw new Error("Invalid response structure from API");
        }

        const result = data.chart.result[0];
        if (!result.indicators || !result.indicators.quote || !result.indicators.quote[0].close) {
            throw new Error("Missing close price data from API response");
        }

        const closePrices = result.indicators.quote[0].close.filter(price => price !== null); // Remove null values

        if (closePrices.length < 26) {
            return { error: "Not enough data to calculate MACD." };
        }

        // Compute EMAs
        const ema12 = calculateEMA(closePrices, 12);
        const ema26 = calculateEMA(closePrices, 26);

        // Align EMA indices
        const macdLine = ema12.slice(-ema26.length).map((value, index) => value - ema26[index]);

        if (macdLine.length < 9) {
            return { error: "Not enough MACD values to calculate the signal line." };
        }

        // Compute Signal Line on the last 9 MACD values
        const signalLine = calculateEMA(macdLine.slice(-9), 9);

        // Get latest values
        const latestMacd = macdLine[macdLine.length - 1];
        const latestSignal = signalLine[signalLine.length - 1];

        return {
            macd: parseFloat(latestMacd.toFixed(2)),  // Ensure precision
            signal: parseFloat(latestSignal.toFixed(2))
        };

    } catch (error) {
        return { error: `Failed to fetch MACD data: ${error.message}` };
    }
}

// Function to calculate EMA
function calculateEMA(prices, period) {
    if (prices.length < period) return [];

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
