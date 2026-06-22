const { expect } = require('chai');
const { setupTestHooks } = require('./base.test');
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');
const FormPage = require('../pages/form.page');
const credentials = require('../testdata/credentials.json');
const formData = require('../testdata/formData.json');

const context = setupTestHooks();

describe('Form Validation Scenarios', function () {
  let loginPage;
  let dashboardPage;
  let formPage;

  before(function () {
    loginPage = new LoginPage(context.driver);
    dashboardPage = new DashboardPage(context.driver);
    formPage = new FormPage(context.driver);
  });

  beforeEach(async function () {
    if (!(await dashboardPage.isLoaded())) {
      await loginPage.login(credentials.valid.username, credentials.valid.password);
    }
    await dashboardPage.openFormModule();
  });

  it('should validate required fields on form submission', async function () {
    await formPage.submitForm(formData.requiredFields); 
    const validationText = await formPage.getValidationText();
    expect(validationText).to.match(/required|mandatory|please enter/i);
  });

  it('should validate email format', async function () {
    await formPage.submitForm(formData.invalidEmail);
    const validationText = await formPage.getValidationText();
    expect(validationText).to.match(/email|format|invalid/i);
  });

  it('should validate phone number rules', async function () {
    await formPage.submitForm(formData.invalidPhone);
    const validationText = await formPage.getValidationText();
    expect(validationText).to.match(/phone|number|digits|invalid/i);
  });

  it('should validate password complexity', async function () {
    await formPage.submitForm(formData.weakPassword);
    const validationText = await formPage.getValidationText();
    expect(validationText).to.match(/password|complex|uppercase|digit/i);
  });

  it('should successfully submit valid form data', async function () {
    await formPage.submitForm(formData.validSubmission);
    const toast = await formPage.getToastMessage();
    expect(toast).to.match(/success|submitted|completed/i);
  });
});
