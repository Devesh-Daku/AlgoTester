async function fetchNiftyData() {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=5m&range=1d`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];

        if (!timestamps || !quote.close) {
            return { error: "No data available" };
        }

        // Get the latest data
        const latestIndex = timestamps.length - 1;
        return {
            time: new Date(timestamps[latestIndex] * 1000).toLocaleTimeString(),
            open: quote.open[latestIndex],
            high: quote.high[latestIndex],
            low: quote.low[latestIndex],
            close: quote.close[latestIndex]
        };
    } catch (error) {
        return { error: `Error fetching NIFTY50 data: ${error.message}` };
    }
}

// Export the function
export { fetchNiftyData };
