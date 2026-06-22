import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

/**
 * Dynamically detects connected Android devices using adb command.
 * @returns {Array<{udid: string, state: string}>} Array of detected devices
 */
export function getConnectedDevices() {
  try {
    const stdout = execSync('adb devices', { encoding: 'utf8' });
    const lines = stdout.split('\n');
    const devices = [];
    
    // Parse adb devices output
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('*') && line.includes('\t')) {
        const [udid, state] = line.split('\t');
        if (state === 'device') {
          devices.push({ udid, state });
        }
      }
    }
    return devices;
  } catch (error) {
    // If adb is not installed or errors, return empty list
    return [];
  }
}

/**
 * Resolves the Android OS version for a given device UDID.
 * @param {string} udid 
 * @returns {string} Platform version (e.g. "12")
 */
export function getDevicePlatformVersion(udid) {
  try {
    const version = execSync(`adb -s ${udid} shell getprop ro.build.version.release`, { encoding: 'utf8' }).trim();
    return version || '11.0';
  } catch (error) {
    return '11.0';
  }
}

/**
 * Constructs the capability object based on configuration and connected devices.
 * Supports running tests against APK or installed apps.
 */
export function getAppiumConfig() {
  const host = process.env.APPIUM_HOST || '127.0.0.1';
  const port = parseInt(process.env.APPIUM_PORT || '4723', 10);
  const pathPrefix = process.env.APPIUM_PATH || '/';

  // Attempt dynamic device detection
  const connectedDevices = getConnectedDevices();
  let udid = process.env.DEVICE_NAME || 'emulator-5554';
  let platformVersion = process.env.PLATFORM_VERSION || '11.0';

  if (connectedDevices.length > 0) {
    // Select the first available device
    udid = connectedDevices[0].udid;
    platformVersion = getDevicePlatformVersion(udid);
  }

  // Construct WebdriverIO Options
  const wdioOptions = {
    hostname: host,
    port: port,
    path: pathPrefix,
    capabilities: {
      platformName: 'Android',
      'appium:automationName': process.env.AUTOMATION_NAME || 'UiAutomator2',
      'appium:deviceName': udid,
      'appium:udid': udid,
      'appium:platformVersion': platformVersion,
      'appium:newCommandTimeout': 240,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:ensureWebviewsHavePages': true,
      'appium:nativeWebScreenshot': true,
      // Grant all permissions automatically
      'appium:autoGrantPermissions': true,
      // Enable logcat capture
      'appium:gpsEnabled': true
    },
    logLevel: 'error',
    connectionRetryCount: 3,
    connectionRetryTimeout: 90000
  };

  // Configure application target
  const apkPath = process.env.APK_PATH;
  const appPackage = process.env.APP_PACKAGE;
  const appActivity = process.env.APP_ACTIVITY;

  if (apkPath && apkPath !== './app/app-release.apk') {
    // Resolve absolute path for APK
    wdioOptions.capabilities['appium:app'] = path.resolve(apkPath);
  } else if (appPackage && appActivity) {
    // Targeting pre-installed app
    wdioOptions.capabilities['appium:appPackage'] = appPackage;
    wdioOptions.capabilities['appium:appActivity'] = appActivity;
  } else {
    // Default fallback to mock values to allow test compilation
    wdioOptions.capabilities['appium:appPackage'] = 'com.example.app';
    wdioOptions.capabilities['appium:appActivity'] = 'com.example.app.MainActivity';
  }

  return wdioOptions;
}

export default getAppiumConfig;
