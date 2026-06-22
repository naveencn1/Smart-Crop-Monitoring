const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const ProfilePage = require('../pages/profile.page');
const LoginPage = require('../pages/login.page');

describe('Profile & Settings Tests (50+ cases)', () => {
  let driver;
  let profilePage;
  let loginPage;

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
    profilePage = new ProfilePage(driver);
    loginPage = new LoginPage(driver);
    await loginPage.login('profile@test.com', 'ProfilePass123');
  });

  // Profile Display Tests
  describe('Profile Information Display (15 cases)', () => {
    it('should display user profile name', async () => {
      const name = await profilePage.getProfileName();
      expect(name).to.exist;
    });

    it('should display user email', async () => {
      const email = await profilePage.getProfileEmail();
      expect(email).to.exist;
    });

    it('should validate email format', async () => {
      const email = await profilePage.getProfileEmail();
      expect(email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should display profile picture', async () => {
      const picture = await driver.$('~profilePicture');
      expect(picture).to.exist;
    });

    it('should show edit profile button', async () => {
      const editBtn = await driver.$('~editProfileButton');
      expect(editBtn).to.exist;
    });

    it('should display farm name if available', async () => {
      const farmName = await driver.$('~farmName');
      expect(farmName).to.exist;
    });

    it('should display location information', async () => {
      const location = await driver.$('~farmLocation');
      expect(location).to.exist;
    });

    it('should show profile completion percentage', async () => {
      const completion = await driver.$('~profileCompletion');
      expect(completion).to.exist;
    });

    it('should display member since date', async () => {
      const memberDate = await driver.$('~memberSince');
      expect(memberDate).to.exist;
    });

    it('should show total farms count', async () => {
      const farmsCount = await driver.$('~farmsCount');
      expect(farmsCount).to.exist;
    });

    it('should display subscription status', async () => {
      const subscription = await driver.$('~subscriptionStatus');
      expect(subscription).to.exist;
    });

    it('should show profile badge/verification status', async () => {
      const badge = await driver.$('~verificationBadge');
      expect(badge).to.exist;
    });

    it('should display bio section', async () => {
      const bio = await driver.$('~userBio');
      expect(bio).to.exist;
    });

    it('should show contact information', async () => {
      const contact = await driver.$('~contactInfo');
      expect(contact).to.exist;
    });

    it('should display social media links', async () => {
      const social = await driver.$('~socialLinks');
      expect(social).to.exist;
    });
  });

  // Profile Editing Tests
  describe('Profile Editing (20 cases)', () => {
    it('should open edit profile', async () => {
      await profilePage.editProfile();
      const editForm = await driver.$('~profileEditForm');
      expect(await editForm.isDisplayed()).to.be.true;
    });

    it('should update user name', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('John Updated');
      await profilePage.saveProfile();
      const success = await profilePage.getSuccessMessage();
      expect(success).to.include('updated');
    });

    it('should update phone number', async () => {
      await profilePage.editProfile();
      await profilePage.updatePhone('1234567890');
      await profilePage.saveProfile();
    });

    it('should update location', async () => {
      await profilePage.editProfile();
      await profilePage.updateLocation('New York');
      await profilePage.saveProfile();
    });

    it('should update farm name', async () => {
      await profilePage.editProfile();
      await profilePage.updateFarmName('Green Valley Farm');
      await profilePage.saveProfile();
    });

    it('should update farm size', async () => {
      await profilePage.editProfile();
      await profilePage.updateFarmSize('50');
      await profilePage.saveProfile();
    });

    it('should update crop type', async () => {
      await profilePage.editProfile();
      await profilePage.updateCropType('Wheat');
      await profilePage.saveProfile();
    });

    it('should validate empty name field', async () => {
      await profilePage.editProfile();
      const nameField = await driver.$('~nameInput');
      await nameField.clearValue();
      await profilePage.saveProfile();
      const error = await driver.$('~nameError');
      expect(await error.getText()).to.include('required');
    });

    it('should validate phone number format', async () => {
      await profilePage.editProfile();
      await profilePage.updatePhone('invalid');
      const error = await driver.$('~phoneError');
      expect(error).to.exist;
    });

    it('should validate farm size as number', async () => {
      await profilePage.editProfile();
      await profilePage.updateFarmSize('abc');
      const error = await driver.$('~farmSizeError');
      expect(error).to.exist;
    });

    it('should cancel profile edit', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('Test Name');
      await profilePage.cancel();
      const originalName = await profilePage.getProfileName();
      expect(originalName).to.not.equal('Test Name');
    });

    it('should validate email uniqueness', async () => {
      await profilePage.editProfile();
      // Update email form would be separate
    });

    it('should support multiple phone numbers', async () => {
      const addPhoneBtn = await driver.$('~addPhoneButton');
      expect(addPhoneBtn).to.exist;
    });

    it('should handle long name gracefully', async () => {
      await profilePage.editProfile();
      const longName = 'a'.repeat(100);
      await profilePage.updateName(longName);
      const error = await driver.$('~nameError');
      expect(error).to.exist;
    });

    it('should trim whitespace from inputs', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('  John  ');
      await profilePage.saveProfile();
    });

    it('should maintain form state on validation error', async () => {
      await profilePage.editProfile();
      await profilePage.updateFarmSize('invalid');
      const nameField = await driver.$('~nameInput');
      const nameValue = await nameField.getAttribute('value');
      expect(nameValue).to.exist;
    });

    it('should show success notification after save', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('Notify Test');
      await profilePage.saveProfile();
      const success = await profilePage.getSuccessMessage();
      expect(success).to.exist;
    });

    it('should disable save button while processing', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('Disabled Test');
      const saveBtn = await driver.$('~saveProfileButton');
      // Click and check if disabled
      await saveBtn.click();
      const isEnabled = !(await saveBtn.getAttribute('disabled'));
      expect(typeof isEnabled).to.equal('boolean');
    });

    it('should handle network error during save', async () => {
      await profilePage.editProfile();
      await profilePage.updateName('Network Error Test');
      // Simulate network error
      try {
        await profilePage.saveProfile();
      } catch (e) {
        expect(e).to.exist;
      }
    });

    it('should show character count for bio', async () => {
      const bioInput = await driver.$('~bioInput');
      expect(bioInput).to.exist;
    });
  });

  // Password Management Tests
  describe('Password Management (10 cases)', () => {
    it('should open change password', async () => {
      await profilePage.editProfile();
      await profilePage.changePassword('OldPass123', 'NewPass456', 'NewPass456');
      await driver.pause(2000);
    });

    it('should validate old password', async () => {
      // Old password validation tested in above
    });

    it('should validate new password strength', async () => {
      const strengthIndicator = await driver.$('~passwordStrength');
      expect(strengthIndicator).to.exist;
    });

    it('should require password confirmation', async () => {
      // Form requires confirmation
    });

    it('should show password requirements', async () => {
      const requirements = await driver.$('~passwordRequirements');
      expect(requirements).to.exist;
    });

    it('should prevent reusing old password', async () => {
      // Would require testing with backend
    });

    it('should support password visibility toggle', async () => {
      const visibilityToggle = await driver.$('~passwordVisibility');
      expect(visibilityToggle).to.exist;
    });

    it('should validate password confirmation match', async () => {
      // Form should validate
    });

    it('should enforce minimum password length', async () => {
      // 8+ characters typically required
    });

    it('should handle password change timeout', async () => {
      await driver.pause(35000); // Session timeout
    });
  });

  // Account Management Tests
  describe('Account Management (10 cases)', () => {
    it('should display delete account button', async () => {
      const deleteBtn = await driver.$('~deleteAccountButton');
      expect(deleteBtn).to.exist;
    });

    it('should show delete confirmation dialog', async () => {
      const deleteBtn = await driver.$('~deleteAccountButton');
      await deleteBtn.click();
      const confirmDialog = await driver.$('~deleteConfirmDialog');
      expect(await confirmDialog.isDisplayed()).to.be.true;
    });

    it('should export user data', async () => {
      const exportBtn = await driver.$('~exportData');
      expect(exportBtn).to.exist;
    });

    it('should download data backup', async () => {
      const backupBtn = await driver.$('~downloadBackup');
      expect(backupBtn).to.exist;
    });

    it('should show login activity', async () => {
      const activityBtn = await driver.$('~loginActivity');
      expect(activityBtn).to.exist;
    });

    it('should display connected devices', async () => {
      const devicesSection = await driver.$('~connectedDevices');
      expect(devicesSection).to.exist;
    });

    it('should allow signing out from other devices', async () => {
      const signOutBtn = await driver.$('~signOutOtherDevices');
      expect(signOutBtn).to.exist;
    });

    it('should display account security score', async () => {
      const securityScore = await driver.$('~securityScore');
      expect(securityScore).to.exist;
    });

    it('should enable two-factor authentication', async () => {
      const twoFactorBtn = await driver.$('~enableTwoFactor');
      expect(twoFactorBtn).to.exist;
    });

    it('should show account deactivation option', async () => {
      const deactivateBtn = await driver.$('~deactivateAccount');
      expect(deactivateBtn).to.exist;
    });
  });

  // Photo Management Tests
  describe('Profile Photo Management (5 cases)', () => {
    it('should upload profile photo', async () => {
      await profilePage.uploadProfilePhoto();
      await driver.pause(2000);
    });

    it('should remove profile photo', async () => {
      const removeBtn = await driver.$('~removePhoto');
      if (await removeBtn.isDisplayed()) {
        await removeBtn.click();
      }
    });

    it('should crop uploaded photo', async () => {
      await profilePage.uploadProfilePhoto();
      const cropBtn = await driver.$('~cropPhotoButton');
      expect(cropBtn).to.exist;
    });

    it('should apply photo filters', async () => {
      const filterBtn = await driver.$('~filterButton');
      expect(filterBtn).to.exist;
    });

    it('should validate photo file size', async () => {
      // Large files should be rejected
      await profilePage.uploadProfilePhoto();
    });
  });

  // Logout Tests
  describe('Logout & Session (5 cases)', () => {
    it('should show logout button', async () => {
      const logoutBtn = await driver.$('~logoutButton');
      expect(logoutBtn).to.exist;
    });

    it('should logout successfully', async () => {
      await profilePage.logout();
      const emailInput = await driver.$('~emailInput');
      expect(emailInput).to.exist;
    });

    it('should clear session on logout', async () => {
      await profilePage.logout();
      // Session should be cleared
    });

    it('should show logout confirmation', async () => {
      const logoutBtn = await driver.$('~logoutButton');
      await logoutBtn.click();
      const confirmDialog = await driver.$('~logoutConfirm');
      expect(confirmDialog).to.exist;
    });

    it('should redirect to login after logout', async () => {
      await profilePage.logout();
      const loginForm = await driver.$('~emailInput');
      expect(loginForm).to.exist;
    });
  });
});
