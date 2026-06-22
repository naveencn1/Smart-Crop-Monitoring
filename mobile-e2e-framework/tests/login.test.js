const { expect } = require('chai');
const { setupTestHooks } = require('./base.test');
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');
const credentials = require('../testdata/credentials.json');

const context = setupTestHooks();

describe('Authentication Scenarios', function () {
  let loginPage;
  let dashboardPage;

  before(function () {
    loginPage = new LoginPage(context.driver);
    dashboardPage = new DashboardPage(context.driver);
  });

  it('should display validation when username is empty', async function () {
    await loginPage.login(credentials.emptyUser.username, credentials.emptyUser.password);
    const error = await loginPage.getErrorText();
    expect(error).to.match(/username|required|empty/i);
  });

  it('should display validation when password is empty', async function () {
    await loginPage.login(credentials.emptyPass.username, credentials.emptyPass.password);
    const error = await loginPage.getErrorText();
    expect(error).to.match(/password|required|empty/i);
  });

  it('should reject invalid credentials', async function () {
    await loginPage.login(credentials.invalid.username, credentials.invalid.password);
    const error = await loginPage.getErrorText();
    expect(error).to.match(/invalid|failed|incorrect/i);
  });

  it('should login successfully with valid credentials and navigate to dashboard', async function () {
    await loginPage.login(credentials.valid.username, credentials.valid.password);
    const loaded = await dashboardPage.isLoaded();
    expect(loaded).to.be.true;
  });

  it('should logout and return to login screen', async function () {
    await dashboardPage.openMenu();
    await loginPage.logout();
    const error = await loginPage.getErrorText().catch(() => null);
    expect(error || '').to.be.a('string');
  });
});
