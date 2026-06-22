const { createDriver, closeDriver } = require('../drivers/driverFactory');
const { captureFailureDetails } = require('../utilities/failureHandler');

const testContext = {
  driver: null
};

const setupTestHooks = () => {
  before(async function () {
    this.timeout(900000);
    testContext.driver = await createDriver();
  });

  after(async function () {
    await closeDriver(testContext.driver);
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await captureFailureDetails(testContext.driver, this.currentTest.fullTitle());
    }
  });

  return testContext;
};

module.exports = {
  setupTestHooks
};
