# Mobile E2E Appium Framework

Enterprise-ready Android E2E automation framework built with Appium 2.x, Node.js, Mocha, Chai, WebdriverIO, Mochawesome, ExcelJS, and Winston.

## Features

- Supports APK execution and installed application testing
- Page Object Model architecture
- Authentication, form validation, navigation, and gesture utilities
- Excel and HTML reporting
- Logs, screenshots, device log capture, and failure handling
- GitHub Actions CI workflow
- Dynamic environment switching using `.env`

## Project Structure

```
mobile-e2e-framework/
├── config/
├── drivers/
├── pages/
├── utilities/
├── tests/
├── reports/
├── screenshots/
├── logs/
├── excel/
├── testdata/
├── scripts/
├── .github/workflows/
├── package.json
└── README.md
```

## Installation

```bash
cd mobile-e2e-framework
npm install
```

## Configuration

Create a `.env` file in the project root with the following values:

```bash
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_BASE_PATH=/wd/hub
APK_PATH=./app/app-release.apk
APP_PACKAGE=com.example.app
APP_ACTIVITY=.MainActivity
USE_INSTALLED_APP=false
DEVICE_NAME=Android Emulator
PLATFORM_VERSION=13.0
DEVICE_UDID=
TEST_TIMEOUT=600000
WAIT_FOR_TIMEOUT=30000
```

## Run Tests

```bash
npm test
```

## Generate Excel Report

```bash
npm run report
```

## CI Execution

```bash
npm run ci
```

## GitHub Actions

The workflow file is located at `.github/workflows/appium-e2e.yml`.

## Notes

- Replace selectors in `pages/*.page.js` with values from your actual Android application.
- Use a real APK or installed app package details for `APK_PATH`, `APP_PACKAGE`, and `APP_ACTIVITY`.
- Ensure Android SDK and emulator or real device are available before running tests.
