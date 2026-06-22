import BasePage from './basePage.js';
import logger from '../utilities/logger.js';

export class FormPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get nameInput() { return 'id:com.example.app:id/et_form_name'; }
  get emailInput() { return 'id:com.example.app:id/et_form_email'; }
  get phoneInput() { return 'id:com.example.app:id/et_form_phone'; }
  get pwdComplexityInput() { return 'id:com.example.app:id/et_form_password'; }
  get dateInput() { return 'id:com.example.app:id/et_form_date'; }
  
  // Selection Controls
  get spinnerDropdown() { return 'id:com.example.app:id/spinner_crop_type'; }
  get spinnerItemText() { return 'xpath://android.widget.TextView[@resource-id="android:id/text1"]'; }
  get checkboxAcceptTerms() { return 'id:com.example.app:id/cb_accept_terms'; }
  get radioDroneMonitorEnabled() { return 'id:com.example.app:id/radio_drone_enabled'; }
  get radioDroneMonitorDisabled() { return 'id:com.example.app:id/radio_drone_disabled'; }

  // Buttons
  get submitButton() { return 'id:com.example.app:id/btn_form_submit'; }

  // Form Field Validation Messages
  get nameErrorLabel() { return 'id:com.example.app:id/tv_error_name'; }
  get emailErrorLabel() { return 'id:com.example.app:id/tv_error_email'; }
  get phoneErrorLabel() { return 'id:com.example.app:id/tv_error_phone'; }
  get pwdErrorLabel() { return 'id:com.example.app:id/tv_error_password'; }
  get dateErrorLabel() { return 'id:com.example.app:id/tv_error_date'; }
  get termsErrorLabel() { return 'id:com.example.app:id/tv_error_terms'; }

  /**
   * Fills form fields
   * @param {object} data Form input parameters
   */
  async fillForm(data) {
    logger.info('Filling out validation test form data');
    await this.hideKeyboard();

    if (data.name !== undefined) {
      await this.typeValue(this.nameInput, data.name);
    }
    if (data.email !== undefined) {
      await this.typeValue(this.emailInput, data.email);
    }
    if (data.phone !== undefined) {
      await this.typeValue(this.phoneInput, data.phone);
    }
    if (data.password !== undefined) {
      await this.typeValue(this.pwdComplexityInput, data.password);
    }
    if (data.date !== undefined) {
      await this.typeValue(this.dateInput, data.date);
    }

    await this.hideKeyboard();
  }

  /**
   * Interacts with spinner element to pick item by text value.
   * @param {string} optionText 
   */
  async selectSpinnerOption(optionText) {
    logger.info(`Selecting spinner dropdown item: "${optionText}"`);
    await this.click(this.spinnerDropdown);
    // Locate the matching dropdown list view item
    const targetXPath = `xpath://android.widget.CheckedTextView[@text="${optionText}"]`;
    await this.click(targetXPath);
  }

  /**
   * Toggles terms checkbox.
   * @param {boolean} shouldCheck 
   */
  async toggleTermsCheckbox(shouldCheck) {
    logger.debug(`Setting Terms checkbox to: ${shouldCheck}`);
    const el = await this.driver.$(this.checkboxAcceptTerms);
    const isChecked = (await el.getAttribute('checked')) === 'true';
    if (isChecked !== shouldCheck) {
      await el.click();
    }
  }

  /**
   * Toggles drone monitoring option.
   * @param {boolean} enable 
   */
  async selectDroneOption(enable) {
    const selector = enable ? this.radioDroneMonitorEnabled : this.radioDroneMonitorDisabled;
    logger.debug(`Clicking radio button: ${enable ? 'Enabled' : 'Disabled'}`);
    await this.click(selector);
  }

  /**
   * Triggers validation checks by clicking submit button.
   */
  async submit() {
    logger.info('Submitting application validation form');
    await this.hideKeyboard();
    await this.click(this.submitButton);
  }

  /**
   * Fetch verification/validation message for any specific field.
   * @param {'name'|'email'|'phone'|'password'|'date'|'terms'} field 
   * @returns {Promise<string>}
   */
  async getFieldValidationError(field) {
    let selector;
    switch (field) {
      case 'name': selector = this.nameErrorLabel; break;
      case 'email': selector = this.emailErrorLabel; break;
      case 'phone': selector = this.phoneErrorLabel; break;
      case 'password': selector = this.pwdErrorLabel; break;
      case 'date': selector = this.dateErrorLabel; break;
      case 'terms': selector = this.termsErrorLabel; break;
      default: throw new Error(`Unknown validation field: ${field}`);
    }

    try {
      const el = await this.waitForDisplayed(selector, 3000);
      const msg = await el.getText();
      logger.info(`Field [${field}] Validation Message: "${msg}"`);
      return msg;
    } catch (err) {
      return '';
    }
  }
}

export default FormPage;
