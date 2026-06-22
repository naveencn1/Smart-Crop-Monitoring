import logger from './logger.js';

export class Gestures {
  /**
   * Helper to get screen center or element center
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} [element] Optional element
   */
  static async getCoordinates(driver, element = null) {
    if (element) {
      const rect = await element.getBoundingRect();
      const x = Math.round(rect.x + rect.width / 2);
      const y = Math.round(rect.y + rect.height / 2);
      return { x, y };
    } else {
      const { width, height } = await driver.getWindowRect();
      return { x: Math.round(width / 2), y: Math.round(height / 2) };
    }
  }

  /**
   * Performs a click/tap gesture on a specific element or coordinates.
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} element 
   */
  static async tap(driver, element) {
    logger.debug('Executing: Tap');
    const { x, y } = await this.getCoordinates(driver, element);
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y, duration: 0 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();
  }

  /**
   * Performs a double-tap gesture.
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} element 
   */
  static async doubleTap(driver, element) {
    logger.debug('Executing: Double Tap');
    const { x, y } = await this.getCoordinates(driver, element);
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y, duration: 0 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .pause(100)
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();
  }

  /**
   * Performs a long press gesture.
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} element 
   * @param {number} duration Duration in milliseconds
   */
  static async longPress(driver, element, duration = 1500) {
    logger.debug(`Executing: Long Press (duration: ${duration}ms)`);
    const { x, y } = await this.getCoordinates(driver, element);
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y, duration: 0 })
      .down({ button: 0 })
      .pause(duration)
      .up({ button: 0 })
      .perform();
  }

  /**
   * Performs a swipe gesture between two coordinates.
   * @param {WebdriverIO.Browser} driver 
   * @param {number} startX 
   * @param {number} startY 
   * @param {number} endX 
   * @param {number} endY 
   * @param {number} duration Swipe time in ms
   */
  static async swipe(driver, startX, startY, endX, endY, duration = 600) {
    logger.debug(`Executing: Swipe from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: startX, y: startY, duration: 0 })
      .down({ button: 0 })
      .pause(100) // Stabilize touch down
      .move({ x: endX, y: endY, duration })
      .up({ button: 0 })
      .perform();
  }

  /**
   * Swipe up (scrolls content down)
   */
  static async swipeUp(driver, percentage = 0.5) {
    logger.debug('Executing: Swipe Up');
    const { width, height } = await driver.getWindowRect();
    const startX = Math.round(width / 2);
    const startY = Math.round(height * 0.8);
    const endY = Math.round(height * (0.8 - percentage));
    await this.swipe(driver, startX, startY, startX, endY);
  }

  /**
   * Swipe down (scrolls content up)
   */
  static async swipeDown(driver, percentage = 0.5) {
    logger.debug('Executing: Swipe Down');
    const { width, height } = await driver.getWindowRect();
    const startX = Math.round(width / 2);
    const startY = Math.round(height * 0.2);
    const endY = Math.round(height * (0.2 + percentage));
    await this.swipe(driver, startX, startY, startX, endY);
  }

  /**
   * Swipe left (scrolls horizontal lists to the right)
   */
  static async swipeLeft(driver, percentage = 0.5) {
    logger.debug('Executing: Swipe Left');
    const { width, height } = await driver.getWindowRect();
    const startY = Math.round(height / 2);
    const startX = Math.round(width * 0.8);
    const endX = Math.round(width * (0.8 - percentage));
    await this.swipe(driver, startX, startY, endX, startY);
  }

  /**
   * Swipe right (scrolls horizontal lists to the left)
   */
  static async swipeRight(driver, percentage = 0.5) {
    logger.debug('Executing: Swipe Right');
    const { width, height } = await driver.getWindowRect();
    const startY = Math.round(height / 2);
    const startX = Math.round(width * 0.2);
    const endX = Math.round(width * (0.2 + percentage));
    await this.swipe(driver, startX, startY, endX, startY);
  }

  /**
   * Scrolls using swipes until target element is displayed or visible on screen.
   * @param {WebdriverIO.Browser} driver 
   * @param {string} targetSelector WebdriverIO selector
   * @param {number} maxSwipes Max attempts before throwing error
   * @param {boolean} directionDown Scroll direction (true=down/swipeUp, false=up/swipeDown)
   */
  static async scrollUntilVisible(driver, targetSelector, maxSwipes = 10, directionDown = true) {
    logger.debug(`Executing: Scroll Until Visible for selector: ${targetSelector}`);
    let swipes = 0;
    while (swipes < maxSwipes) {
      const element = await driver.$(targetSelector);
      if (await element.isDisplayed()) {
        logger.debug(`Found element: ${targetSelector} after ${swipes} swipes.`);
        return element;
      }
      if (directionDown) {
        await this.swipeUp(driver, 0.4);
      } else {
        await this.swipeDown(driver, 0.4);
      }
      swipes++;
    }
    throw new Error(`Element ${targetSelector} was not found visible after ${maxSwipes} scrolls.`);
  }

  /**
   * Performs drag and drop gesture from source element to target element.
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} sourceElement 
   * @param {WebdriverIO.Element} targetElement 
   */
  static async dragAndDrop(driver, sourceElement, targetElement) {
    logger.debug('Executing: Drag and Drop');
    const sourceCoords = await this.getCoordinates(driver, sourceElement);
    const targetCoords = await this.getCoordinates(driver, targetElement);

    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: sourceCoords.x, y: sourceCoords.y, duration: 0 })
      .down({ button: 0 })
      .pause(500) // Grab wait
      .move({ x: targetCoords.x, y: targetCoords.y, duration: 1000 })
      .up({ button: 0 })
      .perform();
  }

  /**
   * Performs pinch gesture (shrinking element).
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} [element] Optional element
   */
  static async pinch(driver, element = null) {
    logger.debug('Executing: Pinch Gesture');
    const center = await this.getCoordinates(driver, element);
    const { width, height } = await driver.getWindowRect();
    const offset = Math.round(Math.min(width, height) * 0.15);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: center.x - offset, y: center.y - offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: center.x, y: center.y },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: center.x + offset, y: center.y + offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: center.x, y: center.y },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  /**
   * Performs zoom gesture (expanding element).
   * @param {WebdriverIO.Browser} driver 
   * @param {WebdriverIO.Element} [element] Optional element
   */
  static async zoom(driver, element = null) {
    logger.debug('Executing: Zoom Gesture');
    const center = await this.getCoordinates(driver, element);
    const { width, height } = await driver.getWindowRect();
    const offset = Math.round(Math.min(width, height) * 0.15);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: center.x, y: center.y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: center.x - offset, y: center.y - offset },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: center.x, y: center.y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: center.x + offset, y: center.y + offset },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }
}

export default Gestures;
