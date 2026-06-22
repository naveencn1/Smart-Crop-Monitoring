const { execSync } = require('child_process');
const logger = require('./logger');

const getConnectedDevices = () => {
  try {
    const output = execSync('adb devices -l', { encoding: 'utf8' });
    const devices = output
      .split('\n')
      .filter((line) => line && line.includes('device') && !line.includes('unauthorized'))
      .map((line) => {
        const parts = line.split(' ');
        return { udid: parts[0], raw: line };
      });

    logger.info(`Detected ${devices.length} Android device(s)`);
    return devices;
  } catch (error) {
    logger.warn('ADB device detection failed:', error.message);
    return [];
  }
};

module.exports = {
  getConnectedDevices
};
