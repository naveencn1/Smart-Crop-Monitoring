const { remote } = require('webdriverio');
const config = require('../config/config');
const logger = require('../utilities/logger');

const buildCapabilities = () => {
  const baseCaps = {
    platformName: config.device.platformName,
    automationName: config.device.automationName,
    deviceName: config.device.deviceName,
    platformVersion: config.device.platformVersion,
    newCommandTimeout: 240,
    autoGrantPermissions: true,
    autoAcceptAlerts: true,
    unicodeKeyboard: true,
    resetKeyboard: true
  };

  if (config.device.udid) {
    baseCaps.udid = config.device.udid;
  }

  if (config.app.useInstalledApp) {
    return {
      ...baseCaps,
      appPackage: config.app.package,
      appActivity: config.app.activity,
      noReset: true,
      fullReset: false
    };
  }

  return {
    ...baseCaps,
    app: config.app.apkPath,
    appPackage: config.app.package,
    appActivity: config.app.activity,
    noReset: false,
    fullReset: false
  };
};

const createDriver = async () => {
  const capabilities = buildCapabilities();
  logger.info('Creating Appium session with capabilities', capabilities);

  return await remote({
    protocol: 'http',
    hostname: config.appium.host,
    port: config.appium.port,
    path: config.appium.basePath,
    capabilities,
    connectionRetryCount: 2,
    logLevel: 'error'
  });
};

const closeDriver = async (driver) => {
  try {
    if (driver && driver.sessionId) {
      await driver.deleteSession();
      logger.info('Appium session closed successfully');
    }
  } catch (error) {
    logger.warn('Failed to close Appium session:', error.message);
  }
};

module.exports = {
  createDriver,
  closeDriver
};
