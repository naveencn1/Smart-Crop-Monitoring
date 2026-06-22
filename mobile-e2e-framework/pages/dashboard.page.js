const BasePage = require('./base.page');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboardTitle = 'android=new UiSelector().resourceId("com.example.app:id/dashboard_title")';
    this.profileCard = 'android=new UiSelector().resourceId("com.example.app:id/profile_card")';
    this.menuButton = 'android=new UiSelector().description("Open navigation drawer")';
    this.formsTile = 'android=new UiSelector().resourceId("com.example.app:id/forms_tile")';
    this.toastMessage = 'android=new UiSelector().resourceId("android:id/message")';
  }

  async isLoaded() {
    return await this.isDisplayed(this.dashboardTitle);
  }

  async openMenu() {
    await this.click(this.menuButton);
  }

  async openFormModule() {
    await this.click(this.formsTile);
  }

  async getToastText() {
    try {
      return await this.getText(this.toastMessage);
    } catch (error) {
      return null;
    }
  }
}

module.exports = DashboardPage;
