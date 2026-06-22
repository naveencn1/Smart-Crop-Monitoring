class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async click(selector) {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout: 30000 });
    await element.click();
  }

  async setValue(selector, value) {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout: 30000 });
    await element.clearValue();
    await element.setValue(value);
  }

  async getText(selector) {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout: 30000 });
    return await element.getText();
  }

  async isDisplayed(selector) {
    const element = await this.driver.$(selector);
    return await element.isDisplayed();
  }

  async takeScreenshot(filePath) {
    const screenshot = await this.driver.takeScreenshot();
    const buffer = Buffer.from(screenshot, 'base64');
    require('fs').writeFileSync(filePath, buffer);
  }

  async getCurrentActivity() {
    return await this.driver.getCurrentActivity();
  }

  async getCurrentPackage() {
    return await this.driver.getCurrentPackage();
  }
}

module.exports = BasePage;
