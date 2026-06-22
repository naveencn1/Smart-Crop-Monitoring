const logger = require('./logger');

const waitForVisible = async (driver, selector, timeout = 30000) => {
  const element = await driver.$(selector);
  await element.waitForDisplayed({ timeout });
  return element;
};

const waitForClickable = async (driver, selector, timeout = 30000) => {
  const element = await driver.$(selector);
  await element.waitForClickable({ timeout });
  return element;
};

const waitForEnabled = async (driver, selector, timeout = 30000) => {
  const element = await driver.$(selector);
  await element.waitForEnabled({ timeout });
  return element;
};

const safeTap = async (driver, selector, timeout = 30000) => {
  const element = await waitForClickable(driver, selector, timeout);
  await element.click();
};

module.exports = {
  waitForVisible,
  waitForClickable,
  waitForEnabled,
  safeTap
};
