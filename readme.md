# AlgoTester Bot

## Setup and Installation

### 1. Install Dependencies
Run the following command to install required dependencies:
```sh
npm install
```

### 2. Install WebDriver (Geckodriver for Firefox)
#### Check if Geckodriver is installed:
```sh
geckodriver --version
```
#### If not installed, install it using:
```sh
sudo apt update
sudo apt install firefox-geckodriver
```
Alternatively, you can download it manually from:
[Geckodriver Releases](https://github.com/mozilla/geckodriver/releases)

### 3. Install Selenium WebDriver
Ensure Selenium WebDriver is installed:
```sh
npm install selenium-webdriver
```

### 4. Verify Firefox Installation
Check if Firefox is installed:
```sh
firefox --version
```
If not installed, install it using:
```sh
sudo apt install firefox
```

## Browser Configuration
- By default, the bot is set to use **Firefox**.
- If you wish to use **Google Chrome**, ensure Chrome is installed and replace `'firefox'` with `'chrome'` in `setupBrowser.js`.

## Running the Application
Start the bot using:
```sh
node main.js
```

## Using Cloud Browsers (LambdaTest)
- The bot supports **LambdaTest** for cloud-based browser execution.
- Free tier offers **5 hours per month**.
- Credentials are required for cloud execution.
- When using LambdaTest, ensure continuous browser interaction to prevent it from sleeping.

## Alternative Methods Tried
- **Axios & Cheerio** were tested for web scraping, but the laptop's IP got blocked by the target website.
- The bot currently relies on **Selenium WebDriver** for data extraction, which remains the preferred method based on algorithm needs and live data availability.

## Notes
- Modify the code accordingly if using a different browser.
- Ensure the respective WebDriver (e.g., **ChromeDriver** for Chrome) is installed.

