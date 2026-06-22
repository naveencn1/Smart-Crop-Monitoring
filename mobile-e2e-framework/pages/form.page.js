const BasePage = require('./base.page');

class FormPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameField = 'android=new UiSelector().resourceId("com.example.app:id/input_name")';
    this.emailField = 'android=new UiSelector().resourceId("com.example.app:id/input_email")';
    this.phoneField = 'android=new UiSelector().resourceId("com.example.app:id/input_phone")';
    this.passwordField = 'android=new UiSelector().resourceId("com.example.app:id/input_password")';
    this.dateField = 'android=new UiSelector().resourceId("com.example.app:id/input_date")';
    this.submitButton = 'android=new UiSelector().resourceId("com.example.app:id/submit_button")';
    this.checkbox = 'android=new UiSelector().resourceId("com.example.app:id/accept_terms")';
    this.dropdown = 'android=new UiSelector().resourceId("com.example.app:id/input_country")';
    this.toastMessage = 'android=new UiSelector().resourceId("android:id/message")';
    this.errorLabel = 'android=new UiSelector().resourceId("com.example.app:id/error_label")';
  }

  async submitForm(data) {
    await this.setValue(this.nameField, data.name || '');
    await this.setValue(this.emailField, data.email || '');
    await this.setValue(this.phoneField, data.phone || '');
    await this.setValue(this.passwordField, data.password || '');
    await this.setValue(this.dateField, data.date || '');
    await this.click(this.dropdown);
    await this.selectDropdownOption(data.country || 'India');

    if (data.acceptTerms) {
      await this.click(this.checkbox);
    }

    await this.click(this.submitButton);
  }

  async selectDropdownOption(optionText) {
    const optionSelector = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${optionText}"))`;
    await this.click(optionSelector);
  }

  async getValidationText() {
    return await this.getText(this.errorLabel);
  }

  async getToastMessage() {
    try {
      return await this.getText(this.toastMessage);
    } catch (error) {
      return null;
    }
  }
}

module.exports = FormPage;
