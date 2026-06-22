const logger = require('./logger');

const tap = async (driver, x, y) => {
  await driver.touchAction({ action: 'tap', x, y });
};

const doubleTap = async (driver, selector) => {
  const element = await driver.$(selector);
  const location = await element.getLocation();
  await driver.touchAction([
    { action: 'tap', x: location.x + 5, y: location.y + 5 },
    { action: 'wait', ms: 150 },
    { action: 'tap', x: location.x + 5, y: location.y + 5 }
  ]);
};

const longPress = async (driver, selector, duration = 1200) => {
  const element = await driver.$(selector);
  const location = await element.getLocation();
  await driver.touchAction([
    { action: 'longPress', x: location.x + 5, y: location.y + 5 },
    { action: 'wait', ms: duration },
    { action: 'release' }
  ]);
};

const swipe = async (driver, startX, startY, endX, endY, duration = 800) => {
  await driver.touchAction([
    { action: 'press', x: startX, y: startY },
    { action: 'wait', ms: duration },
    { action: 'moveTo', x: endX, y: endY },
    { action: 'release' }
  ]);
};

const swipeLeft = async (driver) => {
  const { width, height } = await driver.getWindowSize();
  await swipe(driver, width * 0.85, height / 2, width * 0.15, height / 2);
};

const swipeRight = async (driver) => {
  const { width, height } = await driver.getWindowSize();
  await swipe(driver, width * 0.15, height / 2, width * 0.85, height / 2);
};

const swipeUp = async (driver) => {
  const { width, height } = await driver.getWindowSize();
  await swipe(driver, width / 2, height * 0.8, width / 2, height * 0.2);
};

const swipeDown = async (driver) => {
  const { width, height } = await driver.getWindowSize();
  await swipe(driver, width / 2, height * 0.2, width / 2, height * 0.8);
};

const scrollUntilVisible = async (driver, selector, maxSwipes = 5) => {
  for (let i = 0; i < maxSwipes; i += 1) {
    const element = await driver.$(selector);
    if (await element.isDisplayed()) {
      return element;
    }
    await swipeUp(driver);
  }
  throw new Error(`Element not visible after ${maxSwipes} scrolls: ${selector}`);
};

const dragAndDrop = async (driver, sourceSelector, targetSelector) => {
  const source = await driver.$(sourceSelector);
  const target = await driver.$(targetSelector);
  const start = await source.getLocation();
  const end = await target.getLocation();

  await driver.touchAction([
    { action: 'press', x: start.x + 10, y: start.y + 10 },
    { action: 'wait', ms: 600 },
    { action: 'moveTo', x: end.x + 10, y: end.y + 10 },
    { action: 'release' }
  ]);
};

const pinch = async (driver, selector) => {
  const element = await driver.$(selector);
  const location = await element.getLocation();
  const size = await element.getSize();
  const centerX = location.x + size.width / 2;
  const centerY = location.y + size.height / 2;

  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX - 50, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 400, x: centerX - 10, y: centerY }
      ]
    },
    {
      type: 'pointer',
      id: 'finger2',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX + 50, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 400, x: centerX + 10, y: centerY }
      ]
    }
  ]);
};

const zoom = async (driver, selector) => {
  const element = await driver.$(selector);
  const location = await element.getLocation();
  const size = await element.getSize();
  const centerX = location.x + size.width / 2;
  const centerY = location.y + size.height / 2;

  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX - 10, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 400, x: centerX - 100, y: centerY },
        { type: 'pointerUp', button: 0 }
      ]
    },
    {
      type: 'pointer',
      id: 'finger2',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX + 10, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 400, x: centerX + 100, y: centerY },
        { type: 'pointerUp', button: 0 }
      ]
    }
  ]);
};

module.exports = {
  tap,
  doubleTap,
  longPress,
  swipeLeft,
  swipeRight,
  swipeUp,
  swipeDown,
  scrollUntilVisible,
  dragAndDrop,
  pinch,
  zoom
};
