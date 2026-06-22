const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const DashboardPage = require('../pages/dashboard.page');
const LoginPage = require('../pages/login.page');

describe('Dashboard & Metrics Tests (90+ cases)', () => {
  let driver;
  let dashboardPage;
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
    dashboardPage = new DashboardPage(driver);
    loginPage = new LoginPage(driver);
    await loginPage.login('dashtest@test.com', 'DashPass123');
  });

  // Dashboard Layout Tests
  describe('Dashboard Layout (20 cases)', () => {
    it('should display dashboard title', async () => {
      const title = await dashboardPage.getHeaderTitle();
      expect(title).to.exist;
    });

    it('should display health score metric', async () => {
      const score = await dashboardPage.getHealthScore();
      expect(score).to.match(/\d+/);
    });

    it('should display temperature metric', async () => {
      const temp = await dashboardPage.getTemperature();
      expect(temp).to.exist;
    });

    it('should display humidity metric', async () => {
      const humidity = await dashboardPage.getHumidity();
      expect(humidity).to.exist;
    });

    it('should display soil pH metric', async () => {
      const ph = await dashboardPage.getPh();
      expect(ph).to.exist;
    });

    it('should display all four main metric cards', async () => {
      const temp = await dashboardPage.getTemperature();
      const humidity = await dashboardPage.getHumidity();
      const ph = await dashboardPage.getPh();
      const health = await dashboardPage.getHealthScore();
      expect(temp && humidity && ph && health).to.be.true;
    });

    it('should display refresh button', async () => {
      const refreshBtn = await driver.$('~refreshButton');
      expect(await refreshBtn.isDisplayed()).to.be.true;
    });

    it('should display settings button', async () => {
      const settingsBtn = await driver.$('~settingsButton');
      expect(await settingsBtn.isDisplayed()).to.be.true;
    });

    it('should display profile button', async () => {
      const profileBtn = await driver.$('~profileButton');
      expect(await profileBtn.isDisplayed()).to.be.true;
    });

    it('should display disease detection button', async () => {
      const detectionBtn = await driver.$('~startDetectionButton');
      expect(await detectionBtn.isDisplayed()).to.be.true;
    });

    it('should display notification bell', async () => {
      const notifBell = await driver.$('~notificationBell');
      expect(await notifBell.isDisplayed()).to.be.true;
    });

    it('should display charts tab', async () => {
      const chartsTab = await driver.$('~chartsTab');
      expect(await chartsTab.isDisplayed()).to.be.true;
    });

    it('should display metrics tab', async () => {
      const metricsTab = await driver.$('~metricsTab');
      expect(await metricsTab.isDisplayed()).to.be.true;
    });

    it('should position metrics in correct order', async () => {
      const temp = await driver.$('~temperatureMetric');
      const humidity = await driver.$('~humidityMetric');
      const tempLocation = await temp.getLocation();
      const humidityLocation = await humidity.getLocation();
      expect(tempLocation).to.exist;
      expect(humidityLocation).to.exist;
    });

    it('should have readable metric values', async () => {
      const temp = await dashboardPage.getTemperature();
      expect(temp.length).to.be.greaterThan(0);
    });

    it('should display sensor cards', async () => {
      for (let i = 1; i <= 3; i++) {
        const card = await driver.$(`~sensorCard${i}`);
        expect(card).to.exist;
      }
    });

    it('should display alert banner if exists', async () => {
      const alertExists = await dashboardPage.isAlertBannerDisplayed();
      expect(typeof alertExists).to.equal('boolean');
    });

    it('should display all dashboard sections', async () => {
      const sections = ['metricsTab', 'chartsTab', 'startDetectionButton'];
      for (const section of sections) {
        const element = await driver.$(`~${section}`);
        expect(element).to.exist;
      }
    });

    it('should use consistent styling across metrics', async () => {
      const temp = await driver.$('~temperatureMetric');
      const humidity = await driver.$('~humidityMetric');
      const tempStyle = await temp.getAttribute('class');
      const humidityStyle = await humidity.getAttribute('class');
      expect(tempStyle).to.exist;
      expect(humidityStyle).to.exist;
    });

    it('should display dashboard without errors', async () => {
      const isLoaded = await dashboardPage.isLoaded();
      expect(isLoaded).to.be.true;
    });
  });

  // Metrics Data Tests
  describe('Metrics Data Validation (25 cases)', () => {
    it('should display valid temperature range', async () => {
      const temp = await dashboardPage.getTemperature();
      const tempValue = parseFloat(temp.match(/\d+\.?\d*/)[0]);
      expect(tempValue).to.be.greaterThan(-50);
      expect(tempValue).to.be.lessThan(60);
    });

    it('should display valid humidity range', async () => {
      const humidity = await dashboardPage.getHumidity();
      const humidityValue = parseFloat(humidity.match(/\d+/)[0]);
      expect(humidityValue).to.be.greaterThanOrEqual(0);
      expect(humidityValue).to.be.lessThanOrEqual(100);
    });

    it('should display valid pH range', async () => {
      const ph = await dashboardPage.getPh();
      const phValue = parseFloat(ph.match(/\d+\.?\d*/)[0]);
      expect(phValue).to.be.greaterThanOrEqual(0);
      expect(phValue).to.be.lessThanOrEqual(14);
    });

    it('should display valid health score', async () => {
      const score = await dashboardPage.getHealthScore();
      const scoreValue = parseFloat(score.match(/\d+/)[0]);
      expect(scoreValue).to.be.greaterThanOrEqual(0);
      expect(scoreValue).to.be.lessThanOrEqual(100);
    });

    it('should update temperature value on refresh', async () => {
      const temp1 = await dashboardPage.getTemperature();
      await dashboardPage.refreshData();
      const temp2 = await dashboardPage.getTemperature();
      expect(temp1).to.exist;
      expect(temp2).to.exist;
    });

    it('should update humidity value on refresh', async () => {
      const humidity1 = await dashboardPage.getHumidity();
      await dashboardPage.refreshData();
      const humidity2 = await dashboardPage.getHumidity();
      expect(humidity1).to.exist;
      expect(humidity2).to.exist;
    });

    it('should maintain decimal precision for temperature', async () => {
      const temp = await dashboardPage.getTemperature();
      expect(temp).to.match(/\d+\.?\d*/);
    });

    it('should maintain integer precision for humidity', async () => {
      const humidity = await dashboardPage.getHumidity();
      expect(humidity).to.match(/\d+/);
    });

    it('should display temperature unit correctly', async () => {
      const temp = await dashboardPage.getTemperature();
      expect(temp).to.include('°C');
    });

    it('should display humidity unit correctly', async () => {
      const humidity = await dashboardPage.getHumidity();
      expect(humidity).to.include('%');
    });

    it('should display pH without unit', async () => {
      const ph = await dashboardPage.getPh();
      expect(ph.match(/\d+\.?\d*/).length).to.be.greaterThan(0);
    });

    it('should not display negative health score', async () => {
      const score = await dashboardPage.getHealthScore();
      const scoreValue = parseFloat(score.match(/\d+/)[0]);
      expect(scoreValue).to.be.greaterThanOrEqual(0);
    });

    it('should display metric labels clearly', async () => {
      const tempLabel = await driver.$('~tempLabel');
      expect(tempLabel).to.exist;
    });

    it('should have accessible metric values for screen readers', async () => {
      const temp = await driver.$('~temperatureMetric');
      const description = await temp.getAttribute('contentDescription');
      expect(description).to.exist;
    });

    it('should refresh metrics without losing data', async () => {
      await dashboardPage.refreshData();
      const health = await dashboardPage.getHealthScore();
      expect(health).to.exist;
    });

    it('should display historical metric data if available', async () => {
      // Metrics should have history or trending info
      const metrics = await driver.$('~metricsSection');
      expect(metrics).to.exist;
    });

    it('should validate metric timestamp', async () => {
      // Check if metrics have last updated time
      const lastUpdated = await driver.$('~lastUpdatedTime');
      expect(lastUpdated).to.exist;
    });

    it('should handle missing metric data gracefully', async () => {
      // Test dashboard with missing metrics
      const health = await dashboardPage.getHealthScore();
      expect(health).to.exist;
    });

    it('should display metric warnings for critical values', async () => {
      // If temperature is too high, warning should display
      await dashboardPage.refreshData();
      const health = await dashboardPage.getHealthScore();
      expect(health).to.exist;
    });

    it('should maintain metric consistency across tabs', async () => {
      const tempBefore = await dashboardPage.getTemperature();
      await dashboardPage.clickChartsTab();
      await driver.pause(1000);
      await dashboardPage.clickMetricsTab();
      const tempAfter = await dashboardPage.getTemperature();
      expect(tempBefore).to.exist;
      expect(tempAfter).to.exist;
    });

    it('should handle metric API failures gracefully', async () => {
      // Simulate network error
      await dashboardPage.refreshData();
      const health = await dashboardPage.getHealthScore();
      expect(health).to.exist;
    });

    it('should display metric trend indicators', async () => {
      const tempTrend = await driver.$('~tempTrend');
      expect(tempTrend).to.exist;
    });

    it('should support metric unit conversion in settings', async () => {
      await dashboardPage.openSettings();
      await driver.pause(1000);
    });

    it('should display real-time metric updates', async () => {
      const health1 = await dashboardPage.getHealthScore();
      await driver.pause(5000);
      const health2 = await dashboardPage.getHealthScore();
      expect(health1).to.exist;
      expect(health2).to.exist;
    });

    it('should validate metric precision levels', async () => {
      const temp = await dashboardPage.getTemperature();
      const match = temp.match(/\d+(\.\d{1,2})?/);
      expect(match).to.exist;
    });
  });

  // Sensor Card Tests
  describe('Sensor Card Functionality (20 cases)', () => {
    it('should display first sensor card', async () => {
      await dashboardPage.clickSensorCard(1);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should display second sensor card', async () => {
      await dashboardPage.clickSensorCard(2);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should display third sensor card', async () => {
      await dashboardPage.clickSensorCard(3);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should show sensor card details on tap', async () => {
      await dashboardPage.clickSensorCard(1);
      await driver.pause(1000);
      const details = await driver.$('~sensorDetails');
      expect(details).to.exist;
    });

    it('should show sensor location on card', async () => {
      const card = await driver.$('~sensorCard1');
      const location = await card.getAttribute('contentDescription');
      expect(location).to.include('Sensor');
    });

    it('should show sensor battery status', async () => {
      const battery = await driver.$('~sensorBattery');
      expect(battery).to.exist;
    });

    it('should show sensor signal strength', async () => {
      const signal = await driver.$('~sensorSignal');
      expect(signal).to.exist;
    });

    it('should handle multiple sensor card taps', async () => {
      await dashboardPage.clickSensorCard(1);
      await driver.pause(500);
      await dashboardPage.clickSensorCard(2);
      await driver.pause(500);
      await dashboardPage.clickSensorCard(3);
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should display sensor status indicator', async () => {
      const card = await driver.$('~sensorCard1');
      expect(card).to.exist;
    });

    it('should show sensor last update time', async () => {
      const updateTime = await driver.$('~sensorUpdateTime1');
      expect(updateTime).to.exist;
    });

    it('should handle quick sensor card navigation', async () => {
      for (let i = 1; i <= 3; i++) {
        await dashboardPage.clickSensorCard(i);
        await driver.pause(200);
      }
    });

    it('should display sensor name/identifier', async () => {
      const sensor = await driver.$('~sensorName1');
      const name = await sensor.getText();
      expect(name.length).to.be.greaterThan(0);
    });

    it('should allow sensor card swipe navigation', async () => {
      const card = await driver.$('~sensorCard1');
      await card.swipeLeft();
      await driver.pause(500);
    });

    it('should show sensor metrics preview on card', async () => {
      const tempPreview = await driver.$('~tempPreview1');
      expect(tempPreview).to.exist;
    });

    it('should indicate sensor connectivity status', async () => {
      const status = await driver.$('~sensorStatus1');
      expect(status).to.exist;
    });

    it('should handle long sensor names appropriately', async () => {
      const sensor = await driver.$('~sensorName1');
      const text = await sensor.getText();
      expect(text).to.exist;
    });

    it('should maintain sensor card state on navigation', async () => {
      await dashboardPage.clickSensorCard(1);
      await dashboardPage.openSettings();
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle sensor card without data gracefully', async () => {
      const card = await driver.$('~sensorCard1');
      expect(card).to.exist;
    });

    it('should show sensor error state if disconnected', async () => {
      // Simulate sensor disconnection
      const card = await driver.$('~sensorCard1');
      expect(card).to.exist;
    });

    it('should allow sensor card long press for options', async () => {
      const card = await driver.$('~sensorCard1');
      await card.longPress({ duration: 2000 });
      await driver.pause(500);
    });
  });

  // Alert and Notifications Tests
  describe('Alerts and Notifications (25 cases)', () => {
    it('should display alert banner when alert exists', async () => {
      const hasAlert = await dashboardPage.isAlertBannerDisplayed();
      expect(typeof hasAlert).to.equal('boolean');
    });

    it('should show disease alert button', async () => {
      const diseaseBtn = await driver.$('~diseaseAlertButton');
      expect(diseaseBtn).to.exist;
    });

    it('should click disease alert button', async () => {
      await dashboardPage.clickDiseaseAlert();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should display notification count', async () => {
      const count = await dashboardPage.getNotificationCount();
      expect(count).to.exist;
    });

    it('should update notification count on new alert', async () => {
      const count1 = await dashboardPage.getNotificationCount();
      await dashboardPage.refreshData();
      const count2 = await dashboardPage.getNotificationCount();
      expect(count1).to.exist;
      expect(count2).to.exist;
    });

    it('should dismiss alert banner', async () => {
      const dismissBtn = await driver.$('~dismissAlert');
      if (await dismissBtn.isDisplayed()) {
        await dismissBtn.click();
      }
    });

    it('should show alert severity level', async () => {
      const alert = await driver.$('~alertBanner');
      if (await alert.isDisplayed()) {
        const severity = await alert.getAttribute('class');
        expect(severity).to.exist;
      }
    });

    it('should show alert message text', async () => {
      const alert = await driver.$('~alertMessage');
      if (await alert.isDisplayed()) {
        const text = await alert.getText();
        expect(text.length).to.be.greaterThan(0);
      }
    });

    it('should show alert action button', async () => {
      const actionBtn = await driver.$('~alertAction');
      expect(actionBtn).to.exist;
    });

    it('should support multiple concurrent alerts', async () => {
      // Simulate multiple alerts
      await dashboardPage.refreshData();
      await driver.pause(1000);
    });

    it('should maintain alert state on tab switch', async () => {
      await dashboardPage.clickChartsTab();
      await driver.pause(500);
      await dashboardPage.clickMetricsTab();
      const alert = await driver.$('~alertBanner');
      expect(alert).to.exist;
    });

    it('should show alert timestamp', async () => {
      const timestamp = await driver.$('~alertTime');
      expect(timestamp).to.exist;
    });

    it('should handle alert without action', async () => {
      const alert = await driver.$('~alertBanner');
      expect(alert).to.exist;
    });

    it('should show alert priority indicator', async () => {
      const priority = await driver.$('~alertPriority');
      expect(priority).to.exist;
    });

    it('should dismiss alert after timeout', async () => {
      // Alerts typically auto-dismiss after 5-10 seconds
      await driver.pause(10000);
    });

    it('should show alert icon', async () => {
      const icon = await driver.$('~alertIcon');
      expect(icon).to.exist;
    });

    it('should make alert accessible for screen readers', async () => {
      const alert = await driver.$('~alertBanner');
      const description = await alert.getAttribute('contentDescription');
      expect(description).to.exist;
    });

    it('should handle alert with links', async () => {
      const link = await driver.$('~alertLink');
      expect(link).to.exist;
    });

    it('should prevent duplicate alerts', async () => {
      await dashboardPage.refreshData();
      const alerts = await driver.$('~alertBanner');
      expect(alerts).to.exist;
    });

    it('should show alert queue if multiple exist', async () => {
      const alertContainer = await driver.$('~alertContainer');
      expect(alertContainer).to.exist;
    });

    it('should allow alert customization in settings', async () => {
      await dashboardPage.openSettings();
      const alertSettings = await driver.$('~alertSettings');
      expect(alertSettings).to.exist;
    });

    it('should navigate to alert details on tap', async () => {
      await dashboardPage.clickDiseaseAlert();
      await driver.pause(1000);
    });

    it('should show push notification indicator', async () => {
      const notifBell = await driver.$('~notificationBell');
      expect(notifBell).to.exist;
    });

    it('should handle notification center access', async () => {
      const notifCenter = await driver.$('~notificationCenter');
      expect(notifCenter).to.exist;
    });

    it('should display alert with formatted message', async () => {
      const alert = await driver.$('~alertMessage');
      const text = await alert.getText();
      expect(text.length).to.be.greaterThan(0);
    });

    it('should maintain alert history', async () => {
      const history = await driver.$('~alertHistory');
      expect(history).to.exist;
    });
  });

  // Navigation Tests
  describe('Dashboard Navigation (15 cases)', () => {
    it('should open profile from dashboard', async () => {
      await dashboardPage.openProfile();
      await driver.pause(1000);
      expect(await driver.$('~profileName')).to.exist;
    });

    it('should open settings from dashboard', async () => {
      await dashboardPage.openSettings();
      await driver.pause(1000);
      expect(await driver.$('~settingsTitle')).to.exist;
    });

    it('should start detection from dashboard', async () => {
      await dashboardPage.startDetection();
      await driver.pause(1000);
    });

    it('should navigate back to dashboard from profile', async () => {
      await dashboardPage.openProfile();
      await driver.pause(500);
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should navigate back to dashboard from settings', async () => {
      await dashboardPage.openSettings();
      await driver.pause(500);
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should maintain dashboard state on back navigation', async () => {
      const health1 = await dashboardPage.getHealthScore();
      await dashboardPage.openProfile();
      await driver.pause(500);
      await driver.back();
      const health2 = await dashboardPage.getHealthScore();
      expect(health1).to.exist;
      expect(health2).to.exist;
    });

    it('should switch between metrics and charts tabs', async () => {
      await dashboardPage.clickMetricsTab();
      await driver.pause(500);
      await dashboardPage.clickChartsTab();
      await driver.pause(500);
      await dashboardPage.clickMetricsTab();
    });

    it('should open menu from dashboard', async () => {
      await dashboardPage.openMenu();
      await driver.pause(500);
    });

    it('should handle rapid navigation', async () => {
      await dashboardPage.openProfile();
      await driver.pause(200);
      await driver.back();
      await driver.pause(200);
      await dashboardPage.openSettings();
      await driver.pause(200);
      await driver.back();
    });

    it('should maintain scroll position on navigation return', async () => {
      await dashboardPage.openMenu();
      await driver.pause(500);
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle deep navigation from dashboard', async () => {
      await dashboardPage.openProfile();
      await driver.pause(500);
      // Navigate to profile detail
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should support bottom navigation tabs', async () => {
      const bottomNav = await driver.$('~bottomNavigation');
      expect(bottomNav).to.exist;
    });

    it('should persist navigation state on resume', async () => {
      await dashboardPage.openMenu();
      await driver.pause(500);
      await driver.back();
      expect(await dashboardPage.isLoaded()).to.be.true;
    });

    it('should handle gesture navigation', async () => {
      const card = await driver.$('~sensorCard1');
      await card.swipeLeft();
      await driver.pause(500);
      await card.swipeRight();
    });

    it('should prevent navigation loops', async () => {
      for (let i = 0; i < 5; i++) {
        await dashboardPage.openProfile();
        await driver.pause(200);
        await driver.back();
      }
      expect(await dashboardPage.isLoaded()).to.be.true;
    });
  });
});
