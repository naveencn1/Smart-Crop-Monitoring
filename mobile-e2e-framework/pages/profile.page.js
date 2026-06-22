const BasePage = require('./base.page');

class ProfilePage extends BasePage {
  get profileName() {
    return '~profileName';
  }

  get profileEmail() {
    return '~profileEmail';
  }

  get editButton() {
    return '~editProfileButton';
  }

  get nameInput() {
    return '~nameInput';
  }

  get phoneInput() {
    return '~phoneInput';
  }

  get locationInput() {
    return '~locationInput';
  }

  get farmNameInput() {
    return '~farmNameInput';
  }

  get farmSizeInput() {
    return '~farmSizeInput';
  }

  get cropTypeInput() {
    return '~cropTypeInput';
  }

  get saveButton() {
    return '~saveProfileButton';
  }

  get cancelButton() {
    return '~cancelButton';
  }

  get changePasswordButton() {
    return '~changePasswordButton';
  }

  get oldPasswordInput() {
    return '~oldPasswordInput';
  }

  get newPasswordInput() {
    return '~newPasswordInput';
  }

  get confirmPasswordInput() {
    return '~confirmPasswordInput';
  }

  get deleteAccountButton() {
    return '~deleteAccountButton';
  }

  get successMessage() {
    return '~successMessage';
  }

  get profilePicture() {
    return '~profilePicture';
  }

  get uploadPhotoButton() {
    return '~uploadPhotoButton';
  }

  get logoutButton() {
    return '~logoutButton';
  }

  async getProfileName() {
    return await this.getText(this.profileName);
  }

  async getProfileEmail() {
    return await this.getText(this.profileEmail);
  }

  async editProfile() {
    await this.click(this.editButton);
  }

  async updateName(name) {
    await this.setValue(this.nameInput, name);
  }

  async updatePhone(phone) {
    await this.setValue(this.phoneInput, phone);
  }

  async updateLocation(location) {
    await this.setValue(this.locationInput, location);
  }

  async updateFarmName(farmName) {
    await this.setValue(this.farmNameInput, farmName);
  }

  async updateFarmSize(size) {
    await this.setValue(this.farmSizeInput, size);
  }

  async updateCropType(cropType) {
    await this.setValue(this.cropTypeInput, cropType);
  }

  async saveProfile() {
    await this.click(this.saveButton);
    await this.driver.pause(2000);
  }

  async cancel() {
    await this.click(this.cancelButton);
  }

  async changePassword(oldPassword, newPassword, confirmPassword) {
    await this.click(this.changePasswordButton);
    await this.setValue(this.oldPasswordInput, oldPassword);
    await this.setValue(this.newPasswordInput, newPassword);
    await this.setValue(this.confirmPasswordInput, confirmPassword);
    await this.saveProfile();
  }

  async deleteAccount() {
    await this.click(this.deleteAccountButton);
  }

  async getSuccessMessage() {
    return await this.getText(this.successMessage);
  }

  async uploadProfilePhoto() {
    await this.click(this.uploadPhotoButton);
  }

  async logout() {
    await this.click(this.logoutButton);
    await this.driver.pause(2000);
  }
}

module.exports = ProfilePage;
