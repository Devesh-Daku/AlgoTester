const { By } = require('selenium-webdriver');

async function fetchData(driver) {
  try {
    async function getElementValue(element) {
      return parseFloat(await element.getText());
    }

    async function fetchElements() {
      return await Promise.all([
        driver.findElement(By.xpath('//*[@id="mainController"]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[1]/td[2]')),
        driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[4]/td[2]')),
        driver.findElement(By.xpath('/html/body/div[1]/div[2]/div/div[3]/div[2]/div/div[6]/div/div/div[2]/div/table/tbody/tr[5]/td[2]'))
      ]);
    }

    // Fetch elements and extract values
    const [sharePriceElement, macdElement, signalLineElement] = await fetchElements();
    const [NIFTY50, MACD, SIGNAL] = await Promise.all([
      getElementValue(sharePriceElement),
      getElementValue(macdElement),
      getElementValue(signalLineElement)
    ]);

    return { NIFTY50, MACD, SIGNAL };
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
}

module.exports = { fetchData };
