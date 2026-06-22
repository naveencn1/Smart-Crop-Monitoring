const BasePage = require('./base.page');

class SettingsPage extends BasePage {
  get notificationToggle() {
    return '~notificationToggle';
  }

  get emailNotificationToggle() {
    return '~emailNotificationToggle';
  }

  get pushNotificationToggle() {
    return '~pushNotificationToggle';
  }

  get soundToggle() {
    return '~soundToggle';
  }

  get vibrateToggle() {
    return '~vibrateToggle';
  }

  get languageSelector() {
    return '~languageSelector';
  }

  get themeSelector() {
    return '~themeSelector';
  }

  get temperatureUnitSelector() {
    return '~temperatureUnitSelector';
  }

  get refreshRateSelector() {
    return '~refreshRateSelector';
  }

  get aboutButton() {
    return '~aboutButton';
  }

  get privacyButton() {
    return '~privacyButton';
  }

  get termsButton() {
    return '~termsButton';
  }

  get feedbackButton() {
    return '~feedbackButton';
  }

  get versionText() {
    return '~versionText';
  }

  get cacheButton() {
    return '~clearCacheButton';
  }

  get dataButton() {
    return '~clearDataButton';
  }

  async toggleNotifications(enabled) {
    const toggle = await this.driver.$(this.notificationToggle);
    const isEnabled = await toggle.getAttribute('value') === 'true';
    if (isEnabled !== enabled) {
      await this.click(this.notificationToggle);
    }
  }

  async toggleEmailNotifications(enabled) {
    const toggle = await this.driver.$(this.emailNotificationToggle);
    const isEnabled = await toggle.getAttribute('value') === 'true';
    if (isEnabled !== enabled) {
      await this.click(this.emailNotificationToggle);
    }
  }

  async toggleSound(enabled) {
    const toggle = await this.driver.$(this.soundToggle);
    const isEnabled = await toggle.getAttribute('value') === 'true';
    if (isEnabled !== enabled) {
      await this.click(this.soundToggle);
    }
  }

  async selectLanguage(language) {
    await this.click(this.languageSelector);
    const option = await this.driver.$(`~${language}Option`);
    await option.click();
  }

  async selectTheme(theme) {
    await this.click(this.themeSelector);
    const option = await this.driver.$(`~${theme}Option`);
    await option.click();
  }

  async selectTemperatureUnit(unit) {
    await this.click(this.temperatureUnitSelector);
    const option = await this.driver.$(`~${unit}Option`);
    await option.click();
  }

  async selectRefreshRate(rate) {
    await this.click(this.refreshRateSelector);
    const option = await this.driver.$(`~${rate}Option`);
    await option.click();
  }

  async openAbout() {
    await this.click(this.aboutButton);
  }

  async openPrivacy() {
    await this.click(this.privacyButton);
  }

  async openTerms() {
    await this.click(this.termsButton);
  }

  async openFeedback() {
    await this.click(this.feedbackButton);
  }

  async getVersion() {
    return await this.getText(this.versionText);
  }

  async clearCache() {
    await this.click(this.cacheButton);
  }

  async clearData() {
    await this.click(this.dataButton);
  }
}

module.exports = SettingsPage;
