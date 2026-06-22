# 🤖 Appium E2E Test Suite - 300+ Test Cases

Comprehensive end-to-end test automation framework for **Smart Crop Monitoring Android Application** with 300+ automated test cases, Excel reporting, and GitHub Actions CI/CD integration.

## 📊 Overview

| Metric | Value |
|--------|-------|
| **Total Test Cases** | **300+** |
| **Test Modules** | 4 (Authentication, Dashboard, Detection, Profile) |
| **Execution Time** | ~60 minutes |
| **Supported Android APIs** | 28, 29, 30, 31, 32 |
| **Report Formats** | Excel, HTML, JSON |
| **CI/CD Platform** | GitHub Actions |

## 📁 Project Structure

```
mobile-e2e-framework/
├── config/
│   ├── config.js              # Configuration management
│   └── test.env.example       # Environment variables template
├── pages/
│   ├── base.page.js           # Base page object
│   ├── login.page.js          # Login page object
│   ├── dashboard.page.js      # Dashboard page object
│   ├── detection.page.js      # Detection page object
│   ├── profile.page.js        # Profile page object
│   └── settings.page.js       # Settings page object
├── tests/
│   ├── authentication.test.js # 80+ authentication tests
│   ├── dashboard.test.js      # 90+ dashboard tests
│   ├── detection.test.js      # 80+ detection tests
│   └── profile.test.js        # 50+ profile tests
├── scripts/
│   ├── excel-report-generator.js    # Excel report generator
│   └── generate-xlsx.js             # Report generation script
├── utilities/
│   ├── logger.js              # Logging utility
│   ├── waitUtils.js           # Wait utilities
│   └── deviceUtils.js         # Device utilities
├── testdata/
│   ├── credentials.json       # Test credentials
│   └── formData.json          # Test form data
├── reports/
│   ├── html/                  # HTML test reports
│   ├── failures/              # Failure screenshots
│   └── logs/                  # Test logs
├── excel/                     # Excel reports
├── screenshots/               # Failure screenshots
├── package.json               # NPM dependencies
└── README.md                  # This file
```

## 🧪 Test Modules

### 1️⃣ Authentication Tests (80+ cases)

**File**: `tests/authentication.test.js`

#### Sub-Categories:
- **Valid Login Scenarios** (15 tests)
  - Standard credentials
  - Various email formats
  - Special characters in passwords
  - Long passwords
  - Multiple consecutive logins
  
- **Invalid Login Scenarios** (20 tests)
  - Invalid email formats
  - Wrong passwords
  - Non-existent users
  - Empty fields
  - SQL injection prevention
  - XSS prevention
  - Rate limiting
  - Account lockout
  
- **Remember Me** (10 tests)
  - Checkbox state persistence
  - Session maintenance
  - Credential persistence
  
- **Biometric Auth** (15 tests)
  - Fingerprint authentication
  - Face recognition
  - Fallback to password
  - Timeout handling
  - Device compatibility
  
- **Session Management** (20 tests)
  - Background/resume handling
  - Logout functionality
  - Session timeout
  - Token refresh
  - Concurrent sessions
  - Network interruption handling

### 2️⃣ Dashboard Tests (90+ cases)

**File**: `tests/dashboard.test.js`

#### Sub-Categories:
- **Dashboard Layout** (20 tests)
  - Element visibility
  - Proper positioning
  - Consistent styling
  - Header/footer display
  
- **Metrics Data** (25 tests)
  - Temperature validation
  - Humidity validation
  - Soil pH validation
  - Health score validation
  - Data refresh
  - Unit conversions
  
- **Sensor Cards** (20 tests)
  - Card display
  - Card interaction
  - Sensor details
  - Battery status
  - Signal strength
  - Swipe navigation
  
- **Alerts & Notifications** (25 tests)
  - Alert display
  - Alert dismissal
  - Alert severity
  - Notification count
  - Auto-dismiss
  - Action buttons
  
- **Navigation** (15 tests)
  - Profile access
  - Settings access
  - Detection launch
  - Back navigation
  - Tab switching
  - Deep linking

### 3️⃣ Detection Tests (80+ cases)

**File**: `tests/detection.test.js`

#### Sub-Categories:
- **Camera Functionality** (20 tests)
  - Camera access
  - Photo capture
  - Flash toggle
  - Retake photo
  - Timeout handling
  - Orientation change
  
- **Gallery Selection** (15 tests)
  - Gallery access
  - Photo selection
  - Multiple selection
  - Filtering
  - Sorting
  - Search capability
  
- **Disease Analysis** (25 tests)
  - Image analysis
  - Disease detection
  - Confidence scoring
  - Severity levels
  - Treatment recommendations
  - Alternative diseases
  - Offline mode handling
  
- **Results & Actions** (20 tests)
  - Results display
  - Treatment details
  - Result sharing
  - Result saving
  - PDF generation
  - Expert consultation
  - Feedback submission

### 4️⃣ Profile Tests (50+ cases)

**File**: `tests/profile.test.js`

#### Sub-Categories:
- **Profile Display** (15 tests)
  - Profile information
  - Email validation
  - Farm details
  - Completion percentage
  - Member since date
  
- **Profile Editing** (20 tests)
  - Name update
  - Phone update
  - Location update
  - Farm details update
  - Form validation
  - Cancel operations
  - Success messages
  
- **Account Management** (10 tests)
  - Password change
  - Two-factor authentication
  - Account deletion
  - Data export
  - Device management
  
- **Photo Management** (5 tests)
  - Photo upload
  - Photo removal
  - Photo cropping
  - Filter application
  
- **Logout** (5 tests)
  - Logout functionality
  - Session clearing
  - Redirect verification

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Android SDK/Emulator
- Appium 2.x
- npm or yarn

### Installation

```bash
cd mobile-e2e-framework

# Install dependencies
npm install

# Create environment file
cp config/test.env.example .env
```

### Configuration

**`.env` file:**
```bash
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_BASE_PATH=/wd/hub
APK_PATH=./app/app-release.apk
APP_PACKAGE=com.example.app
APP_ACTIVITY=.MainActivity
USE_INSTALLED_APP=false
PLATFORM_VERSION=13.0
DEVICE_NAME=Android Emulator
DEVICE_UDID=
TEST_TIMEOUT=600000
APP_LAUNCH_TIMEOUT=90000
WAIT_FOR_TIMEOUT=30000
```

### Running Tests

#### 1. Start Appium Server
```bash
npx appium --log-level info
```

#### 2. Run All Tests
```bash
npm test
```

#### 3. Run Specific Test Suite
```bash
# Authentication tests
npx mocha ./tests/authentication.test.js --timeout 600000

# Dashboard tests
npx mocha ./tests/dashboard.test.js --timeout 600000

# Detection tests
npx mocha ./tests/detection.test.js --timeout 600000

# Profile tests
npx mocha ./tests/profile.test.js --timeout 600000
```

#### 4. Generate Excel Report
```bash
npm run report
```

#### 5. Clean Artifacts
```bash
npm run clean
```

## 📊 Reports & Analysis

### Excel Reports
Generated in `excel/` directory with:
- **Summary Sheet**: Overall metrics and statistics
- **Detailed Results**: Test-by-test breakdown
- **Statistics**: Suite-wise analysis
- **Timeline**: Chronological execution log
- **Failures**: Failed test details with stack traces

### HTML Reports
Generated in `reports/html/` using Mochawesome:
- Interactive test results
- Timeline visualization
- Failure screenshots
- Test hierarchy

### JSON Results
Machine-readable test data for integration with other tools.

## 🔄 GitHub Actions CI/CD

### Workflows

#### 1. `appium-tests.yml` - Main Test Execution
- Triggers: Push, Pull Request, Weekly Schedule
- Executes all 300+ tests
- Generates Excel and HTML reports
- Multi-API level testing
- Uploads artifacts

#### 2. `ci.yml` - Continuous Integration
- Code linting and validation
- Test case counting (verifies 300+)
- Security scanning
- Dependency audit

#### 3. `manual-test.yml` - Manual Execution
- Workflow dispatch for on-demand runs
- Suite selection (auth, dashboard, detection, profile, all)
- API level selection
- Report generation toggle

#### 4. `archive-reports.yml` - Report Management
- Daily report archiving
- Dashboard generation
- Quality metrics tracking
- Long-term storage

### Usage

#### Automated Execution
Tests run automatically on:
- Push to main/develop branches
- Pull requests to main/develop
- Weekly schedule (Sunday 2 AM UTC)

#### Manual Execution
1. Go to GitHub Actions tab
2. Select "Manual Test Execution" workflow
3. Click "Run workflow"
4. Select parameters:
   - Test Suite (all/auth/dashboard/detection/profile)
   - Android API Level (28-32)
   - Test Type (fullrun/smoke/critical)
   - Generate Report (yes/no)
5. Click "Run workflow"

## 📈 Test Metrics

### Coverage

| Module | Test Cases | Coverage |
|--------|-----------|----------|
| Authentication | 80 | Login, Sessions, Biometric |
| Dashboard | 90 | Metrics, Sensors, Alerts |
| Detection | 80 | Camera, Analysis, Results |
| Profile | 50 | Settings, Account, Editing |
| **Total** | **300+** | **Complete E2E** |

### Execution Time

- Authentication: ~15 minutes
- Dashboard: ~18 minutes
- Detection: ~17 minutes
- Profile: ~10 minutes
- **Total**: ~60 minutes

### Success Criteria

- ✅ All 300+ tests pass
- ✅ Success rate > 95%
- ✅ Execution time < 90 minutes
- ✅ Reports generated successfully

## 🐛 Debugging

### Enable Detailed Logging
```bash
npx appium --log-level debug
```

### View Screenshots
Failure screenshots are saved in `screenshots/` directory.

### Check Device Logs
```bash
adb logcat
```

### Run Single Test with Verbose Output
```bash
npx mocha ./tests/authentication.test.js --grep "should login" --reporter spec
```

## 📝 Best Practices

1. **Page Object Model**: Use page objects for element access
2. **Waits**: Always wait for elements before interaction
3. **Error Handling**: Wrap interactions with try-catch
4. **Screenshots**: Capture on failures for debugging
5. **Test Data**: Use separate test data files
6. **Naming**: Clear, descriptive test names
7. **Isolation**: Tests should be independent
8. **Cleanup**: Reset state between tests

## 🔒 Security

- Credentials stored in `.env` (excluded from git)
- No sensitive data in logs
- Test data doesn't include real credentials
- API security testing included
- XSS/SQL injection prevention tests

## 📚 Dependencies

```json
{
  "webdriverio": "^8.20.0",
  "mocha": "^10.2.0",
  "chai": "^4.3.8",
  "mochawesome": "^8.0.1",
  "exceljs": "^4.3.0",
  "appium": "^2.0.0",
  "dotenv": "^16.3.1",
  "winston": "^3.10.0",
  "moment": "^2.29.4"
}
```

## 📞 Support & Contribution

For issues, questions, or contributions:
1. Check existing issues
2. Create detailed bug reports
3. Follow code style guidelines
4. Add tests for new features

## 📄 License

This test framework is part of Smart Crop Monitoring project.

## 🎯 Roadmap

- [ ] Performance testing
- [ ] Load testing
- [ ] Visual regression testing
- [ ] Cross-device cloud testing
- [ ] API performance metrics
- [ ] Machine learning failure prediction
- [ ] Real-time test monitoring dashboard
- [ ] Parallel execution optimization

## 📞 Contact

For questions or support:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@smartcrop.com

---

**Last Updated**: $(date)
**Framework Version**: 1.0.0
**Status**: ✅ Production Ready
