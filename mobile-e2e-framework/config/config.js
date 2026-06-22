const path = require('path');
const rootDir = path.resolve(__dirname, '..');

require('dotenv').config({ path: path.join(rootDir, '.env') });

module.exports = {
  appium: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    basePath: process.env.APPIUM_BASE_PATH || '/wd/hub'
  },
  app: {
    apkPath: process.env.APK_PATH || path.join(rootDir, 'app', 'app-release.apk'),
    package: process.env.APP_PACKAGE || 'com.example.app',
    activity: process.env.APP_ACTIVITY || '.MainActivity',
    useInstalledApp: process.env.USE_INSTALLED_APP === 'true'
  },
  device: {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    platformVersion: process.env.PLATFORM_VERSION || '13.0',
    deviceName: process.env.DEVICE_NAME || 'Android Emulator',
    udid: process.env.DEVICE_UDID || ''
  },
  test: {
    timeout: Number(process.env.TEST_TIMEOUT || 600000),
    appLaunchTimeout: Number(process.env.APP_LAUNCH_TIMEOUT || 90000),
    waitForTimeout: Number(process.env.WAIT_FOR_TIMEOUT || 30000)
  },
  paths: {
    reports: path.join(rootDir, 'reports'),
    htmlReport: path.join(rootDir, 'reports', 'html'),
    failures: path.join(rootDir, 'reports', 'failures'),
    screenshots: path.join(rootDir, 'screenshots'),
    logs: path.join(rootDir, 'logs'),
    excel: path.join(rootDir, 'excel')
  }
};
