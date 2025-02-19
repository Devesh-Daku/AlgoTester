
import { setupLogger }         from './src/logger.js';
import { runTradingAlgorithm } from './src/tradingAlgorithm.js';

const userName = 'username';
const email = 'email';

(async function main() {
  const log = await setupLogger(userName, email );

  try {
    await runTradingAlgorithm(log,2);
  } catch (error) {
    console.error('Error:', error);
  } finally {
  }
})();
