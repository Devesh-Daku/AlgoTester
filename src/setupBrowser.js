const { Builder } = require('selenium-webdriver');
const ltCapabilities = require('./capabilities');

const GRID_HOST = 'hub.lambdatest.com/wd/hub';
const gridUrl = `https://${ltCapabilities.capabilities["LT:Options"].username}:${ltCapabilities.capabilities["LT:Options"].accessKey}@${GRID_HOST}`;

async function setupBrowser() {
  return await new Builder()
    .usingServer(gridUrl)
    .withCapabilities(ltCapabilities.capabilities)
    .build();
}

module.exports = { setupBrowser };
