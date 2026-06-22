import logger from '../utilities/logger.js';
import fs from 'fs';
import path from 'path';

export class BasePage {
  /**
   * @param {WebdriverIO.Browser} driver 
   */
  constructor(driver) {
    if (!driver) {
      throw new Error('Driver instance is required for Page Object initialization.');
    }
    this.driver = driver;
    this.perfTimers = {};
  }

  /**
   * Waits for an element to be displayed.
   * @param {string} selector 
   * @param {number} timeout 
   * @returns {Promise<WebdriverIO.Element>}
   */
  async waitForDisplayed(selector, timeout = 10000) {
    logger.debug(`Waiting for element to be displayed: ${selector}`);
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout, message: `Element ${selector} was not displayed after ${timeout}ms` });
    return el;
  }

  /**
   * Waits for an element to be clickable.
   * @param {string} selector 
   * @param {number} timeout 
   * @returns {Promise<WebdriverIO.Element>}
   */
  async waitForClickable(selector, timeout = 10000) {
    logger.debug(`Waiting for element to be clickable: ${selector}`);
    const el = await this.waitForDisplayed(selector, timeout);
    await el.waitForClickable({ timeout, message: `Element ${selector} was not clickable after ${timeout}ms` });
    return el;
  }

  /**
   * Type text into an input field.
   * @param {string} selector 
   * @param {string} text 
   */
  async typeValue(selector, text) {
    logger.info(`Typing "${text}" into field ${selector}`);
    const el = await this.waitForClickable(selector);
    await el.setValue(text);
  }

  /**
   * Click an element.
   * @param {string} selector 
   */
  async click(selector) {
    logger.info(`Clicking element ${selector}`);
    const el = await this.waitForClickable(selector);
    await el.click();
  }

  /**
   * Fetch toast message content.
   * Uses UIAutomator2 xpath locator.
   * @returns {Promise<string>}
   */
  async getToastMessage(timeout = 5000) {
    logger.info('Waiting for Toast message...');
    const toastSelector = 'xpath://android.widget.Toast';
    try {
      const el = await this.waitForDisplayed(toastSelector, timeout);
      const text = await el.getText();
      logger.info(`Toast captured: "${text}"`);
      return text;
    } catch (err) {
      logger.warn('Toast message not found or timed out.');
      return '';
    }
  }

  /**
   * Hides the keyboard if active.
   */
  async hideKeyboard() {
    try {
      if (await this.driver.isKeyboardShown()) {
        logger.debug('Hiding onscreen keyboard.');
        await this.driver.hideKeyboard();
      }
    } catch (err) {
      logger.debug('Keyboard was not active or could not be hidden.');
    }
  }

  /**
   * Capture screenshot to failure directory or custom path
   * @param {string} filename 
   * @returns {Promise<string>} path to screenshot
   */
  async captureScreenshot(filename) {
    const screenshotDir = 'reports/failures';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    const filePath = path.join(screenshotDir, safeFilename);
    
    try {
      await this.driver.saveScreenshot(filePath);
      logger.info(`Screenshot saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Failed to capture screenshot:', error);
      return '';
    }
  }

  /**
   * Start measuring screen/app launch/API performance.
   * @param {string} label Timer label
   */
  startPerformanceTimer(label) {
    this.perfTimers[label] = { start: new Date() };
    logger.debug(`Performance Timer started [${label}]`);
  }

  /**
   * Stop timer and return elapsed duration in ms.
   * @param {string} label Timer label
   * @returns {number} Duration in ms
   */
  stopPerformanceTimer(label) {
    if (!this.perfTimers[label]) {
      logger.warn(`Performance Timer [${label}] was never started.`);
      return 0;
    }
    const duration = new Date() - this.perfTimers[label].start;
    logger.info(`Performance Timer [${label}] completed: ${duration}ms`);
    delete this.perfTimers[label];
    return duration;
  }

  /**
   * Dynamic Screen UI component identification.
   * Analyzes page source and compiles a list of interactable nodes.
   * Enables AI agents to automatically discover UI paths.
   */
  async analyzeScreenStructure() {
    logger.info('Analyzing screen structure for component auto-discovery...');
    const sourceXml = await this.driver.getPageSource();
    
    // Parse using RegExp for resource-ids, classes, text, and layout bounds
    // Matching Android nodes: <node class="..." resource-id="..." text="..." content-desc="..." bounds="..." ... />
    const nodeRegex = /<node\s+[^>]*?class="([^"]*)"(?:[^>]*?text="([^"]*)")?(?:[^>]*?resource-id="([^"]*)")?(?:[^>]*?content-desc="([^"]*)")?(?:[^>]*?bounds="([^"]*)")?[^>]*?>/g;
    
    const components = [];
    let match;
    
    while ((match = nodeRegex.exec(sourceXml)) !== null) {
      const [_, className, text, resourceId, contentDesc, bounds] = match;
      
      const isInteractable = 
        className.includes('Button') || 
        className.includes('EditText') || 
        className.includes('CheckBox') || 
        className.includes('RadioButton') || 
        className.includes('Spinner') ||
        className.includes('ImageButton') ||
        resourceId || 
        contentDesc;

      if (isInteractable) {
        components.push({
          class: className || '',
          text: text || '',
          resourceId: resourceId || '',
          contentDesc: contentDesc || '',
          bounds: bounds || '',
          suggestedSelector: resourceId ? `id:${resourceId}` : (contentDesc ? `accessibility id:${contentDesc}` : '')
        });
      }
    }

    logger.info(`Discovered ${components.length} interactable UI components on current screen.`);
    return components;
  }
}

export default BasePage;
