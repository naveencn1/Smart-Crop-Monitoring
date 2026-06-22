const BasePage = require('./base.page');

class DetectionPage extends BasePage {
  get cameraButton() {
    return '~cameraButton';
  }

  get galleryButton() {
    return '~galleryButton';
  }

  get captureImage() {
    return '~captureImageButton';
  }

  get analyzeButton() {
    return '~analyzeButton';
  }

  get resultTitle() {
    return '~resultTitle';
  }

  get diseaseNameResult() {
    return '~diseaseName';
  }

  get confidenceScore() {
    return '~confidenceScore';
  }

  get treatmentButton() {
    return '~treatmentButton';
  }

  get shareResultButton() {
    return '~shareResultButton';
  }

  get retakePhotoButton() {
    return '~retakePhotoButton';
  }

  get uploadingIndicator() {
    return '~uploadingIndicator';
  }

  get errorMessage() {
    return '~detectionErrorMessage';
  }

  get progressBar() {
    return '~analysisProgressBar';
  }

  get historyCameraButton() {
    return '~historyCameraButton';
  }

  get historyList() {
    return '~historyList';
  }

  async openCamera() {
    await this.click(this.cameraButton);
  }

  async openGallery() {
    await this.click(this.galleryButton);
  }

  async capturePhoto() {
    await this.click(this.captureImage);
    await this.driver.pause(2000);
  }

  async analyzeImage() {
    await this.click(this.analyzeButton);
    await this.driver.pause(5000);
  }

  async getResultTitle() {
    return await this.getText(this.resultTitle);
  }

  async getDiseaseName() {
    return await this.getText(this.diseaseNameResult);
  }

  async getConfidenceScore() {
    return await this.getText(this.confidenceScore);
  }

  async clickTreatment() {
    await this.click(this.treatmentButton);
  }

  async shareResult() {
    await this.click(this.shareResultButton);
  }

  async retakePhoto() {
    await this.click(this.retakePhotoButton);
  }

  async isAnalyzing() {
    return await this.isDisplayed(this.uploadingIndicator);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  async getProgressPercentage() {
    return await this.getText(this.progressBar);
  }

  async viewHistory() {
    await this.click(this.historyCameraButton);
  }
}

module.exports = DetectionPage;
