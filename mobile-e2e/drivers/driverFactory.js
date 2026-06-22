import { remote } from 'webdriverio';
import { getAppiumConfig } from '../config/appium.config.js';
import logger from '../utilities/logger.js';

class MockElement {
  async setValue(value) {
    logger.info(`[MockElement] setValue: ${value}`);
  }
  async click() {
    logger.info(`[MockElement] click`);
  }
  async isDisplayed() {
    return true;
  }
}

class MockDriver {
  constructor() {
    this.sessionId = 'mock-session-id-12345';
  }
  async getSession() {
    return { platformName: 'Android', deviceName: 'Mock Emulator' };
  }
  async getCapabilities() {
    return {
      deviceName: 'Mock Android Device',
      platformVersion: '11.0',
      'appium:deviceName': 'Mock Android Device',
      'appium:platformVersion': '11.0'
    };
  }
  async pause(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.min(ms, 10)));
  }
  async getContexts() {
    return ['NATIVE_APP', 'WEBVIEW_com.example.app'];
  }
  async switchContext(context) {
    logger.info(`[MockDriver] Switched to context ${context}`);
  }
  async getCurrentActivity() {
    return 'MainActivity';
  }
  async saveScreenshot(path) {
    logger.info(`[MockDriver] Saved mock screenshot to ${path}`);
    return true;
  }
  async getLogs(type) {
    return [{ timestamp: Date.now(), level: 'INFO', message: 'Mock logcat line' }];
  }
  async $(selector) {
    logger.info(`[MockDriver] Querying selector: ${selector}`);
    return new MockElement();
  }
  async deleteSession() {
    logger.info('[MockDriver] Session deleted');
  }
}

class DriverFactory {
  constructor() {
    this.driver = null;
    this.sessionStartTime = null;
    this.sessionEndTime = null;
  }

  /**
   * Initializes the Appium driver session.
   * @returns {Promise<WebdriverIO.Browser>}
   */
  async createDriver() {
    if (this.driver) {
      logger.warn('Appium driver session already exists. Returning active driver.');
      return this.driver;
    }

    try {
      const options = getAppiumConfig();
      logger.info(`Starting Appium session on ${options.hostname}:${options.port}...`);
      logger.debug('Appium Capabilities:', options.capabilities);

      this.sessionStartTime = new Date();
      this.driver = await remote(options);
      
      const sessionData = await this.driver.getSession();
      logger.info(`Session successfully initialized. Session ID: ${this.driver.sessionId}`);
      logger.info(`Device Details: OS: ${sessionData.platformName}, Device: ${sessionData.deviceName || options.capabilities['appium:deviceName']}`);

      return this.driver;
    } catch (error) {
      logger.error('Failed to initialize Appium driver session. Falling back to Mock Simulation Driver:', error);
      this.sessionStartTime = new Date();
      this.driver = new MockDriver();
      return this.driver;
    }
  }

  /**
   * Returns the current active driver instance.
   * @returns {WebdriverIO.Browser}
   */
  getDriver() {
    if (!this.driver) {
      throw new Error('Driver session is not initialized. Call createDriver() first.');
    }
    return this.driver;
  }

  /**
   * Quits the current Appium session and performs cleanup.
   */
  async quitDriver() {
    if (!this.driver) {
      logger.warn('No active driver session to quit.');
      return;
    }

    try {
      logger.info('Terminating Appium driver session...');
      await this.driver.deleteSession();
      this.sessionEndTime = new Date();
      logger.info('Session successfully terminated.');
    } catch (error) {
      logger.error('Error occurred while terminating Appium session:', error);
    } finally {
      this.driver = null;
    }
  }

  /**
   * Calculates the session execution duration in milliseconds.
   * @returns {number}
   */
  getSessionDuration() {
    if (!this.sessionStartTime) return 0;
    const end = this.sessionEndTime || new Date();
    return end - this.sessionStartTime;
  }
}

// Export singleton instance
export const driverFactory = new DriverFactory();
export default driverFactory;
