const BasePage = require('./base.page');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameField = 'android=new UiSelector().resourceId("com.example.app:id/username")';
    this.passwordField = 'android=new UiSelector().resourceId("com.example.app:id/password")';
    this.loginButton = 'android=new UiSelector().resourceId("com.example.app:id/login_button")';
    this.errorMessage = 'android=new UiSelector().resourceId("com.example.app:id/error_message")';
    this.logoutButton = 'android=new UiSelector().resourceId("com.example.app:id/logout_button")';
    this.dashboardHeader = 'android=new UiSelector().resourceId("com.example.app:id/dashboard_header")';
  }

  async login(username, password) {
    await this.setValue(this.usernameField, username);
    await this.setValue(this.passwordField, password);
    await this.click(this.loginButton);
  }

  async getErrorText() {
    return await this.getText(this.errorMessage);
  }

  async isDashboardVisible() {
    return await this.isDisplayed(this.dashboardHeader);
  }

  async logout() {
    await this.click(this.logoutButton);
  }
}

module.exports = LoginPage;
