# AlgoTester Bot

## Setup and Installation

### 1. Clone the Repository
```sh
git clone <repo-url>
cd AlgoTester
```

### 2. Install Dependencies
Run the following command to install required dependencies:
```sh
npm install
```

### 3. Running the Application
Start the bot using:
```sh
node main.js
```

## Description

This application fetches **live NIFTY50 data** from **Yahoo Finance** and uses historical price data to calculate:
- **MACD (Moving Average Convergence Divergence) Line**
- **Signal Line**

These values are then passed to an **algorithm** that runs a **paper trading simulation**, logging all trades based on predefined trading rules.

### 📝 **Paper Trading Log**
- The bot **simulates trading** using the **calculated MACD and Signal Line**.
- Every trade (buy/sell decision) is **recorded in a log file**.
- This log can be used to **analyze performance** throughout the trading day.

## How It Works
1. **Fetches real-time NIFTY50 data** from **Yahoo Finance**.
2. **Calculates MACD and Signal Line** using historical price data.
3. **Runs a trading algorithm** to decide whether to **BUY, SELL, or HOLD**.
4. **Logs all transactions** in a **paper trading log file** for analysis.

## Alternative Methods Tried
- **Axios & Cheerio** were tested for web scraping but resulted in an **IP block** from the target website.
- **Selenium WebDriver** was used earlier but is **now removed** for a more efficient API-based approach.

## Notes
- No browser or WebDriver setup is required anymore.
- Ensure you have a **stable internet connection** for live data fetching.

