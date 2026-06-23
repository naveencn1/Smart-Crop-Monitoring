import driverFactory from '../drivers/driverFactory.js';
import excelReport from '../utilities/excelReport.js';
import logger from '../utilities/logger.js';
import fs from 'fs';
import path from 'path';

let suiteStartTime = null;

// Mocha Hooks Setup
before(async function () {
  logger.info('=== Commencing Mobile E2E Automation Suite ===');
  suiteStartTime = new Date();
  
  // Set up screenshots & logs directory structure if missing
  ['reports/failures', 'excel', 'logs'].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  try {
    const driver = await driverFactory.createDriver();
    
    // Fetch device characteristics to supply to the reports
    const caps = await driver.getCapabilities();
    const deviceName = caps.deviceName || caps['appium:deviceName'] || 'Android Device';
    const platformVersion = caps.platformVersion || caps['appium:platformVersion'] || '10.0';
    
    excelReport.setDeviceDetails(deviceName, platformVersion);
    excelReport.addLog(new Date().toISOString(), 'Global Setup', 'Initialize Appium Driver', 'Success', `Connected to ${deviceName} (Android ${platformVersion})`);
  } catch (error) {
    logger.error('CRITICAL: Appium Driver instantiation failed inside global hooks.', error);
    excelReport.addLog(new Date().toISOString(), 'Global Setup', 'Initialize Appium Driver', 'Error', error.message);
    await excelReport.generateReport();
    throw error;
  }
});

beforeEach(function () {
  logger.info(`>>> Starting Test: ${this.currentTest.title}`);
  this.testStartTime = new Date();
  excelReport.addLog(new Date().toISOString(), this.currentTest.title, 'Test Initiation', 'Success');
});

afterEach(async function () {
  const driver = driverFactory.getDriver();
  const testName = this.currentTest.title;
  const status = this.currentTest.state === 'passed' ? 'Passed' : (this.currentTest.state === 'failed' ? 'Failed' : 'Skipped');
  const duration = new Date() - this.testStartTime;

  let failureReason = '';
  let stackTrace = '';
  let screenshotPath = '';
  let activityName = '';

  if (status === 'Failed') {
    logger.error(`!!! Test Failed: "${testName}"`);
    failureReason = this.currentTest.err ? this.currentTest.err.message : 'Unknown Assertion Failure';
    stackTrace = this.currentTest.err ? this.currentTest.err.stack : '';

    // 1. Capture Activity
    try {
      activityName = await driver.getCurrentActivity();
    } catch (err) {
      activityName = 'UnknownActivity';
    }

    // 2. Capture Screenshot
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    screenshotPath = path.join('reports/failures', `screenshot_${safeName}.png`);
    try {
      await driver.saveScreenshot(screenshotPath);
      logger.info(`Screenshot captured for failed test: ${screenshotPath}`);
    } catch (err) {
      logger.error('Failed to capture failure screenshot:', err);
      screenshotPath = 'Failed to capture';
    }

    // 3. Dump Logcat
    const logcatPath = path.join('reports/failures', `logcat_${safeName}.txt`);
    try {
      const logs = await driver.getLogs('logcat');
      const logString = logs.map(l => `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
      fs.writeFileSync(logcatPath, logString, { encoding: 'utf8' });
      logger.info(`Device Logcat output dumped to: ${logcatPath}`);
    } catch (err) {
      logger.warn('Logcat capture failed or not supported by Appium on target device.');
    }

    excelReport.addLog(
      new Date().toISOString(),
      testName,
      'Failure Handler',
      'Error',
      `Reason: ${failureReason} (Activity: ${activityName})`
    );
  } else {
    logger.info(`<<< Test Passed: "${testName}" (${(duration / 1000).toFixed(2)}s)`);
    excelReport.addLog(new Date().toISOString(), testName, 'Test Execution', 'Success');
  }

  const titleParts = this.currentTest.title.split(' - ');
  const testId = titleParts[0];
  const scenarioDescription = titleParts.slice(1).join(' - ');

  // Record test results inside Excel reports list
  excelReport.addTest({
    id: testId,
    module: this.currentTest.parent.title || 'Mobile E2E',
    scenario: scenarioDescription || testName,
    status,
    startTime: this.testStartTime,
    endTime: new Date(),
    duration,
    failureReason,
    screenshotPath,
    activityName,
    stackTrace
  });
});

after(async function () {
  logger.info('=== Finalizing Mobile E2E Automation Suite ===');
  
  // Create Excel Report before shutting down driver
  try {
    await excelReport.generateReport();
    excelReport.addLog(new Date().toISOString(), 'Global Teardown', 'Excel Generation', 'Success');
  } catch (err) {
    logger.error('Failed to compile Excel spreadsheet:', err);
  }

  // Teardown session
  await driverFactory.quitDriver();
  
  const totalDuration = new Date() - suiteStartTime;
  logger.info(`=== Suite Execution Finished. Total Duration: ${(totalDuration / 1000).toFixed(2)}s ===`);
});
