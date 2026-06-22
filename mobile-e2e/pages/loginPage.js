import BasePage from './basePage.js';
import logger from '../utilities/logger.js';

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get usernameInput() { return 'id:com.example.app:id/username'; }
  get passwordInput() { return 'id:com.example.app:id/password'; }
  get loginButton() { return 'id:com.example.app:id/btn_login'; }
  get errorMessageLabel() { return 'id:com.example.app:id/tv_error_message'; }
  get usernameValidationLabel() { return 'id:com.example.app:id/tv_username_validation'; }
  get passwordValidationLabel() { return 'id:com.example.app:id/tv_password_validation'; }

  /**
   * Performs login flow
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    logger.info(`Attempting login with username: "${username}"`);
    
    // Hide keyboard if covering inputs
    await this.hideKeyboard();

    if (username !== null && username !== undefined) {
      await this.typeValue(this.usernameInput, username);
    }
    if (password !== null && password !== undefined) {
      await this.typeValue(this.passwordInput, password);
    }
    
    await this.click(this.loginButton);
  }

  /**
   * Clears username and password input fields.
   */
  async clearInputs() {
    logger.debug('Clearing login inputs');
    const userEl = await this.driver.$(this.usernameInput);
    const passEl = await this.driver.$(this.passwordInput);
    await userEl.clearValue();
    await passEl.clearValue();
  }

  /**
   * Fetch validation message for empty or invalid input formatting
   * @param {'username'|'password'} field 
   * @returns {Promise<string>}
   */
  async getValidationMessage(field) {
    const selector = field === 'username' ? this.usernameValidationLabel : this.passwordValidationLabel;
    try {
      const el = await this.waitForDisplayed(selector, 3000);
      return await el.getText();
    } catch (err) {
      logger.debug(`No validation message visible for field [${field}]`);
      return '';
    }
  }

  /**
   * Fetch credentials mismatch or lock out error label contents.
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    try {
      const el = await this.waitForDisplayed(this.errorMessageLabel, 4000);
      return await el.getText();
    } catch (err) {
      logger.debug('No global login error message label visible.');
      return '';
    }
  }
}

export default LoginPage;
