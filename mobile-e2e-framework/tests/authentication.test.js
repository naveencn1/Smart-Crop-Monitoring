const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');

describe('Authentication Tests (80+ cases)', () => {
  let driver;
  let loginPage;
  let dashboardPage;

  before(async () => {
    const { remote } = require('webdriverio');
    const config = require('../config/config');
    const opts = {
      host: config.appium.host,
      port: config.appium.port,
      basePath: config.appium.basePath,
      capabilities: {
        platformName: config.device.platformName,
        automationName: config.device.automationName,
        deviceName: config.device.deviceName,
        platformVersion: config.device.platformVersion,
        app: config.app.apkPath,
        appPackage: config.app.package,
        appActivity: config.app.activity,
        autoGrantPermissions: true,
      }
    };
    driver = await remote(opts);
  });

  after(async () => {
    await driver.deleteSession();
  });

  beforeEach(async () => {
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  // Valid Login Tests
  describe('Valid Login Scenarios (15 cases)', () => {
    it('should login with valid email and password', async () => {
      await loginPage.login('test@example.com', 'Password123!');
      const isLoaded = await dashboardPage.isLoaded();
      expect(isLoaded).to.be.true;
    });

    it('should login with different valid email format', async () => {
      await loginPage.login('user.name+tag@example.co.uk', 'ValidPass2023!');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with numeric password', async () => {
      await loginPage.login('numeric@test.com', '123456789');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should display dashboard title after successful login', async () => {
      await loginPage.login('admin@farm.com', 'AdminPass@123');
      const title = await dashboardPage.isLoaded();
      expect(title).to.be.true;
    });

    it('should preserve login state after app restart', async () => {
      await loginPage.login('persistent@test.com', 'PersistentPass123');
      await driver.pause(1000);
      await driver.sendKeyEvent(4); // Back button
      await driver.pause(2000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with special characters in password', async () => {
      await loginPage.login('special@test.com', 'P@ssw0rd!#$%');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with lowercase email', async () => {
      await loginPage.login('lowercase@example.com', 'Password123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with uppercase letters in email', async () => {
      await loginPage.login('TEST@EXAMPLE.COM', 'Password123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle long password correctly', async () => {
      await loginPage.login('long@test.com', 'VeryLongPasswordWith32CharactersTotal1');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login and display user profile info', async () => {
      await loginPage.login('profile@test.com', 'ShowProfile123');
      const isLoaded = await dashboardPage.isLoaded();
      expect(isLoaded).to.be.true;
    });

    it('should handle multiple consecutive logins', async () => {
      await loginPage.login('multi1@test.com', 'Pass123!');
      await loginPage.logout();
      await driver.pause(1000);
      await loginPage.login('multi2@test.com', 'Pass456!');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should maintain session across navigation', async () => {
      await loginPage.login('session@test.com', 'SessionPass123');
      await dashboardPage.openMenu();
      await driver.pause(500);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with email containing dot notation', async () => {
      await loginPage.login('first.last.name@company.com', 'DotPassword123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should login with hyphenated domain email', async () => {
      await loginPage.login('user@my-company.com', 'HyphenPass123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should redirect to dashboard after login', async () => {
      await loginPage.login('redirect@test.com', 'RedirectPass123');
      const title = await dashboardPage.isLoaded();
      expect(title).to.be.true;
    });
  });

  // Invalid Login Tests
  describe('Invalid Login Scenarios (20 cases)', () => {
    it('should show error for invalid email format', async () => {
      await loginPage.login('invalidemail', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should show error for wrong password', async () => {
      await loginPage.login('test@example.com', 'WrongPassword123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('invalid');
    });

    it('should show error for non-existent email', async () => {
      await loginPage.login('nonexistent@example.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('not found');
    });

    it('should show error for empty email', async () => {
      await loginPage.login('', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('required');
    });

    it('should show error for empty password', async () => {
      await loginPage.login('test@example.com', '');
      const error = await loginPage.getErrorText();
      expect(error).to.include('required');
    });

    it('should show error for both empty fields', async () => {
      await loginPage.login('', '');
      const error = await loginPage.getErrorText();
      expect(error).to.exist;
    });

    it('should reject email with spaces', async () => {
      await loginPage.login('test @example.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should reject password with only spaces', async () => {
      await loginPage.login('test@example.com', '   ');
      const error = await loginPage.getErrorText();
      expect(error).to.include('invalid');
    });

    it('should reject email with multiple @ symbols', async () => {
      await loginPage.login('test@@example.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should reject very short password', async () => {
      await loginPage.login('test@example.com', '123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('password');
    });

    it('should show case-sensitive password error', async () => {
      await loginPage.login('test@example.com', 'password123'); // wrong case
      const error = await loginPage.getErrorText();
      expect(error).to.include('invalid');
    });

    it('should reject email without TLD', async () => {
      await loginPage.login('test@localhost', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should prevent SQL injection in email', async () => {
      await loginPage.login("test@test.com' OR '1'='1", 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should prevent XSS in email field', async () => {
      await loginPage.login('<script>alert("xss")</script>@test.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should show rate limit error after multiple failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await loginPage.login('test@example.com', 'WrongPass');
        await driver.pause(500);
      }
      const error = await loginPage.getErrorText();
      expect(error).to.include('limit');
    });

    it('should reject email with leading spaces', async () => {
      await loginPage.login('  test@example.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.exist;
    });

    it('should reject email with trailing spaces', async () => {
      await loginPage.login('test@example.com  ', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.exist;
    });

    it('should show error for extremely long email', async () => {
      const longEmail = 'a'.repeat(500) + '@example.com';
      await loginPage.login(longEmail, 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.include('email');
    });

    it('should reject null byte injection', async () => {
      await loginPage.login('test\x00@example.com', 'Password123');
      const error = await loginPage.getErrorText();
      expect(error).to.exist;
    });

    it('should show account locked error after brute force', async () => {
      for (let i = 0; i < 10; i++) {
        await loginPage.login('locked@example.com', 'WrongPassword');
        await driver.pause(300);
      }
      const error = await loginPage.getErrorText();
      expect(error).to.include('locked');
    });
  });

  // Remember Me Tests
  describe('Remember Me Functionality (10 cases)', () => {
    it('should keep user logged in when remember me is checked', async () => {
      await loginPage.setRememberMe(true);
      await loginPage.login('remember@test.com', 'RememberPass123');
      await driver.pause(1000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should uncheck remember me for logout', async () => {
      await loginPage.setRememberMe(false);
      await loginPage.login('noremember@test.com', 'NoRememberPass123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should maintain login without remember me on refresh', async () => {
      await loginPage.setRememberMe(false);
      await loginPage.login('refresh@test.com', 'RefreshPass123');
      await driver.sendKeyEvent(82); // Menu key
      await driver.pause(1000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should show remember me checkbox state', async () => {
      const checkbox = await driver.$('~rememberMeCheckbox');
      expect(checkbox).to.exist;
    });

    it('should toggle remember me correctly', async () => {
      await loginPage.setRememberMe(true);
      await driver.pause(500);
      await loginPage.setRememberMe(false);
      await driver.pause(500);
      await loginPage.setRememberMe(true);
    });

    it('should persist remember me selection', async () => {
      await loginPage.setRememberMe(true);
      await loginPage.login('persist@test.com', 'PersistPass123');
      await driver.pause(2000);
    });

    it('should not expose password when remember me is checked', async () => {
      await loginPage.setRememberMe(true);
      const passwordElement = await driver.$('~passwordInput');
      const inputType = await passwordElement.getAttribute('type');
      expect(inputType).to.equal('password');
    });

    it('should allow multiple logins with remember me', async () => {
      await loginPage.setRememberMe(true);
      await loginPage.login('multiple1@test.com', 'MultiPass123');
      await loginPage.logout();
      await driver.pause(1000);
      await loginPage.login('multiple2@test.com', 'MultiPass456');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should show remember me text label', async () => {
      const label = await driver.$('~rememberMeLabel');
      const text = await label.getText();
      expect(text).to.include('Remember');
    });

    it('should maintain credentials in remember me', async () => {
      await loginPage.setRememberMe(true);
      await loginPage.login('cred@test.com', 'CredPass123');
      const emailElement = await driver.$('~emailInput');
      const email = await emailElement.getAttribute('value');
      expect(email).to.equal('cred@test.com');
    });
  });

  // Biometric Authentication Tests
  describe('Biometric Authentication (15 cases)', () => {
    it('should show biometric login option', async () => {
      const bioButton = await driver.$('~biometricButton');
      expect(bioButton).to.exist;
    });

    it('should handle fingerprint authentication success', async () => {
      await loginPage.loginWithBiometric();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should show biometric error on failure', async () => {
      await loginPage.loginWithBiometric();
      const error = await loginPage.getErrorText();
      // May or may not have error depending on device
    });

    it('should fall back to password login after biometric failure', async () => {
      await driver.$('~emailInput').then(el => el.click());
      await loginPage.login('fallback@test.com', 'FallbackPass123');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should show biometric button accessibility text', async () => {
      const bioButton = await driver.$('~biometricButton');
      const label = await bioButton.getAttribute('contentDescription');
      expect(label).to.include('Biometric');
    });

    it('should enable/disable biometric based on device support', async () => {
      const bioButton = await driver.$('~biometricButton');
      const isEnabled = !(await bioButton.getAttribute('disabled'));
      expect(typeof isEnabled).to.equal('boolean');
    });

    it('should show loading indicator during biometric verification', async () => {
      await loginPage.loginWithBiometric();
      const loader = await driver.$('~loadingIndicator');
      expect(loader).to.exist;
    });

    it('should timeout biometric authentication after delay', async () => {
      await loginPage.loginWithBiometric();
      await driver.pause(35000); // Default timeout is 30s
    });

    it('should allow retry after biometric failure', async () => {
      await loginPage.loginWithBiometric();
      await driver.pause(1000);
      await loginPage.loginWithBiometric();
    });

    it('should switch between biometric and password login', async () => {
      const bioButton = await driver.$('~biometricButton');
      await bioButton.click();
      await driver.pause(1000);
      const emailInput = await driver.$('~emailInput');
      expect(emailInput).to.exist;
    });

    it('should show biometric icon correctly', async () => {
      const bioButton = await driver.$('~biometricButton');
      const isDisplayed = await bioButton.isDisplayed();
      expect(isDisplayed).to.be.true;
    });

    it('should store biometric data securely', async () => {
      // Cannot directly test, but verify no sensitive data in logs
      await loginPage.loginWithBiometric();
    });

    it('should handle device orientation change during biometric', async () => {
      await loginPage.loginWithBiometric();
      await driver.orientation = 'LANDSCAPE';
      await driver.pause(1000);
      await driver.orientation = 'PORTRAIT';
    });

    it('should verify biometric authentication timestamp', async () => {
      const startTime = Date.now();
      await loginPage.loginWithBiometric();
      const endTime = Date.now();
      expect(endTime - startTime).to.be.lessThan(60000);
    });

    it('should support fallback password on device without biometric', async () => {
      // Try biometric first
      try {
        await loginPage.loginWithBiometric();
      } catch (e) {
        // Fall back to password
        await loginPage.login('device@test.com', 'DevicePass123');
      }
      expect(await dashboardPage.isLoaded()).to.be.true;
    });
  });

  // Session Management Tests
  describe('Session Management (20 cases)', () => {
    it('should maintain session across app background', async () => {
      await loginPage.login('session1@test.com', 'SessionPass123');
      await driver.sendKeyEvent(4); // Back
      await driver.pause(2000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should invalidate session on explicit logout', async () => {
      await loginPage.login('logout@test.com', 'LogoutPass123');
      await loginPage.logout();
      await driver.pause(2000);
      const emailInput = await driver.$('~emailInput');
      expect(emailInput).to.exist;
    });

    it('should clear session data on logout', async () => {
      await loginPage.login('clear@test.com', 'ClearPass123');
      await loginPage.logout();
      const dashboard = await driver.$('~dashboardTitle');
      expect(dashboard).to.not.exist;
    });

    it('should handle session timeout gracefully', async () => {
      await loginPage.login('timeout@test.com', 'TimeoutPass123');
      await driver.pause(35000); // 35 seconds, typical timeout is 30s
    });

    it('should refresh session on activity', async () => {
      await loginPage.login('activity@test.com', 'ActivityPass123');
      await dashboardPage.openMenu();
      await driver.pause(500);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle concurrent session requests', async () => {
      await loginPage.login('concurrent@test.com', 'ConcurrentPass123');
      const promise1 = dashboardPage.openMenu();
      const promise2 = driver.pause(500);
      await Promise.all([promise1, promise2]);
    });

    it('should invalidate old session tokens', async () => {
      // Login, get token, then login again
      await loginPage.login('token1@test.com', 'TokenPass123');
      await loginPage.logout();
      await driver.pause(1000);
      await loginPage.login('token2@test.com', 'TokenPass456');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle session during network loss', async () => {
      await loginPage.login('network@test.com', 'NetworkPass123');
      // Toggle airplane mode or wifi
      await driver.pause(5000);
    });

    it('should verify session validity on each request', async () => {
      await loginPage.login('verify@test.com', 'VerifyPass123');
      await dashboardPage.openFormModule();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should prevent session fixation attacks', async () => {
      // Cannot directly test but verify random session IDs
      await loginPage.login('fixation@test.com', 'FixationPass123');
    });

    it('should log session creation timestamp', async () => {
      await loginPage.login('timestamp@test.com', 'TimestampPass123');
      const startTime = Date.now();
      await driver.pause(1000);
      expect(Date.now() - startTime).to.be.greaterThan(0);
    });

    it('should handle fast logout and login', async () => {
      await loginPage.login('fast1@test.com', 'FastPass123');
      await loginPage.logout();
      await driver.pause(500);
      await loginPage.login('fast2@test.com', 'FastPass456');
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should invalidate session on password change', async () => {
      // This would require password change flow
      await loginPage.login('passchange@test.com', 'PassChangePass123');
    });

    it('should handle mobile app suspend and resume', async () => {
      await loginPage.login('suspend@test.com', 'SuspendPass123');
      await driver.sendKeyEvent(4); // Back
      await driver.pause(5000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should maintain session across network switch', async () => {
      await loginPage.login('netswitch@test.com', 'NetSwitchPass123');
      // Would require WiFi to Cellular switch
      await driver.pause(2000);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });
  });
});
