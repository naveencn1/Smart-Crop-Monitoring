const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

const captureFailureDetails = async (driver, testName) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const failureDir = path.join(config.paths.failures, testName.replace(/\s+/g, '_'));

    if (!fs.existsSync(failureDir)) {
      fs.mkdirSync(failureDir, { recursive: true });
    }

    const screenshotPath = path.join(failureDir, `${timestamp}-screenshot.png`);
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot, 'base64'));

    let logs = [];
    try {
      logs = await driver.getLogs('logcat');
    } catch (err) {
      logger.warn('Unable to capture logcat logs:', err.message);
    }

    const logPath = path.join(failureDir, `${timestamp}-logcat.txt`);
    fs.writeFileSync(logPath, logs.map((entry) => `[${entry.timestamp}] ${entry.level} ${entry.message}`).join('\n'));

    const activity = await driver.getCurrentActivity().catch(() => 'unknown');
    const packageName = await driver.getCurrentPackage().catch(() => 'unknown');

    fs.writeFileSync(
      path.join(failureDir, `${timestamp}-metadata.txt`),
      `Activity: ${activity}\nPackage: ${packageName}\nTest: ${testName}\nTimestamp: ${timestamp}`
    );

    logger.error(`Failure artifacts captured for ${testName}`);
    return {
      screenshotPath,
      logPath,
      activity,
      packageName
    };
  } catch (error) {
    logger.error('Failure capture failed:', error.message);
    return null;
  }
};

module.exports = {
  captureFailureDetails
};
