# Enterprise Appium E2E Android Automation Framework (Node.js)

This directory contains a complete, production-grade, and enterprise-ready mobile test automation framework for Android applications. It is built using **Appium 2.x**, **WebdriverIO (v8)**, **Mocha**, and **Chai**, following the **Page Object Model (POM)** architecture.

---

## Key Features

- **Automated Application Life-cycle:** Automatically installs and starts the target app from an APK, or connects to a pre-installed app.
- **Dynamic Device Detection:** Scans connected devices (`adb devices`) and sets device properties automatically before falling back to manual config.
- **Advanced W3C Gestures:** Reusable gestures including Tap, Double-Tap, Long Press, Swiping, Drag & Drop, Pinch, Zoom, and Scroll-Until-Visible.
- **Detailed Double Reporting:**
  - **Excel (ExcelJS):** Styled multi-sheet document (`excel/Mobile_E2E_Report.xlsx`) with Summary, Test Cases, Failures, and execution logging step sheets.
  - **HTML (Mochawesome):** Interactive visual web report detailing suite run pass/fail rates.
- **Robust Failure Handlers:** Automatic screenshot capture, current activity query, and Logcat dumps placed into `reports/failures/` on any test failure.
- **AI Agent Smart Compatibility:** Built-in screen scanning capability (`analyzeScreenStructure()`) allowing AI agents to dynamically parse XML nodes and identify UI forms.
- **CI/CD Integrated:** Automated virtual emulator workflow ready for GitHub Actions.

---

## Directory Structure

```text
mobile-e2e/
├── config/
│   └── appium.config.js       # Capability builder and dynamic device detector
├── drivers/
│   └── driverFactory.js       # Session constructor and teardown manager
├── pages/
│   ├── basePage.js            # Wait/Toast methods and AI source analysis
│   ├── loginPage.js           # Authentication screen locators and actions
│   ├── dashboardPage.js       # Main menu and layout navigation items
│   └── formPage.js            # Fields inputs and verification handlers
├── tests/
│   ├── baseSetup.js           # Global suite hooks, failures, and log dumps
│   ├── auth.test.js           # Credentials and session persistence tests
│   └── forms.test.js          # Dynamic form fields validation tests
├── utilities/
│   ├── gestures.js            # W3C gesture action mappings (swipe, zoom, pinch, etc)
│   ├── logger.js              # Winston log transporters (console + file log)
│   └── excelReport.js         # Styled ExcelJS workbook report composer
├── .github/workflows/
│   └── appium-e2e.yml         # GitHub Actions orchestration workflow
├── .env.example               # Environmental variables configuration template
├── package.json               # Node.js project definitions and execution commands
└── README.md                  # System setup and execution instructions
```

---

## Pre-requisites & Setup

### 1. System Requirements
- **Node.js** (v18.0.0 or higher)
- **Java JDK** (v11 or higher)
- **Android SDK** (Android Command Line Tools, Platform tools, Build tools)
- **Appium 2.x CLI** (`npm install -g appium`)
- **Appium UiAutomator2 Driver** (`appium driver install uiautomator2`)

### 2. Environment Configuration
Create a `.env` file in the `mobile-e2e` directory (or duplicate `.env.example`):
```bash
cp .env.example .env
```
Ensure configurations like `APK_PATH` or `APP_PACKAGE`/`APP_ACTIVITY` align with your target application.

### 3. Installation
Install project dependencies:
```bash
npm install
```

---

## Executing Tests

To run all automated test suites:
```bash
# Execute Mocha test suite
npm run test

# Compile reports and generate HTML dashboard
npm run report:html

# Execute tests and compile HTML report in a single sequence
npm run test:run
```

All test outcomes, logs, and failure screenshots are stored in the following outputs:
- **Excel Report:** `excel/Mobile_E2E_Report.xlsx`
- **HTML Report:** `reports/html_report.html`
- **Winston Logs:** `logs/appium-test.log`
- **Failures (Screenshots & Logcat):** `reports/failures/`

---

## Excel Report Schema

The generated `Mobile_E2E_Report.xlsx` contains 4 sheets:

1. **Summary:**
   - General run attributes (Execution date, target device details, total tests run, status tallies, pass rate, and total execution duration).
2. **Test Cases:**
   - Listing of each execution scenario, module tags, start/end dates, and pass/fail states.
3. **Failed Tests:**
   - Deep-dive into failing tests, capturing the specific exception message, screenshot paths, current screen activity, and full stack trace.
4. **Execution Logs:**
   - Step-by-step framework operations logged during the execution.

---

## Smart Testing Capability (AI Agent Support)

This framework includes programmatic hooks to facilitate autonomous scanning by AI agents.
The `BasePage.analyzeScreenStructure()` method retrieves the current XML layout and compiles a list of interactable nodes (buttons, text views, checkboxes, spinners, etc.):

```javascript
// Within an agent-based verification flow:
const page = new BasePage(driver);
const interactableElements = await page.analyzeScreenStructure();

// Example Output:
// [
//   {
//     class: "android.widget.EditText",
//     text: "",
//     resourceId: "com.example.app:id/et_form_email",
//     contentDesc: "Enter your email address",
//     suggestedSelector: "id:com.example.app:id/et_form_email"
//   }
// ]
```
Agents can parse this output to dynamically explore application branches, fill in forms, and auto-verify states.
