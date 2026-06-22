const { expect } = require('chai');
const { setupTestHooks } = require('./base.test');
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');

const context = setupTestHooks();

describe('Navigation and App Behavior', function () {
  let loginPage;
  let dashboardPage;

  before(function () {
    loginPage = new LoginPage(context.driver);
    dashboardPage = new DashboardPage(context.driver);
  });

  it('should preserve session after app relaunch', async function () {
    await loginPage.login('testuser', 'Test@1234');
    expect(await dashboardPage.isLoaded()).to.be.true;
    await context.driver.reset();
    const stillLoaded = await dashboardPage.isLoaded().catch(() => false);
    expect(stillLoaded).to.be.true;
  });

  it('should support back button navigation', async function () {
    await context.driver.back();
    const onLogin = await loginPage.isDisplayed(loginPage.loginButton);
    expect(onLogin).to.be.true;
  });

  it('should navigate via dashboard menu and verify screen transitions', async function () {
    await loginPage.login('testuser', 'Test@1234');
    await dashboardPage.openMenu();
    const profileVisible = await dashboardPage.isDisplayed(dashboardPage.profileCard);
    expect(profileVisible).to.be.true;
  });
});
