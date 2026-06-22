# Selenium Test Suite - SmartCrop Monitoring

Comprehensive Selenium test framework with **400+ test cases** for the SmartCrop Monitoring & Disease Detection System.

## 📊 Test Coverage

| Module | Test Cases | Features Tested |
|--------|-----------|-----------------|
| Navigation | 40+ | View switching, page transitions, routing |
| Dashboard | 50+ | Sensor metrics, charts, alerts, data display |
| Disease Detection | 60+ | AI scanning, disease diagnosis, results |
| Profile Management | 80+ | Form input, validation, persistence |
| Chatbot | 50+ | Messaging, quick replies, conversations |
| Localization | 40+ | Language switching, translations, persistence |
| End-to-End Workflows | 100+ | Complete user journeys, multi-feature flows |
| **TOTAL** | **420+** | **Comprehensive coverage** |

## 🏗️ Project Structure

```
tests/
├── conftest.py                 # Pytest configuration & fixtures
├── page_objects.py            # Page Object Model classes
├── test_utils.py              # Helper utilities & data management
├── test_data.json             # Parameterized test data
├── pytest.ini                 # Pytest configuration
├── requirements.txt           # Python dependencies
│
├── test_navigation.py         # 40+ navigation tests
├── test_dashboard.py          # 50+ dashboard tests
├── test_detection.py          # 60+ detection AI tests
├── test_profile.py            # 80+ profile management tests
├── test_chatbot.py            # 50+ chatbot interaction tests
├── test_localization.py       # 40+ language/translation tests
├── test_e2e_workflows.py      # 100+ end-to-end workflow tests
│
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tests
pip install -r requirements.txt
```

### 2. Start Backend & Frontend Servers

Terminal 1 - Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Terminal 2 - Frontend:
```bash
cd frontend
python -m http.server 8000
```

### 3. Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest test_dashboard.py

# Run specific test class
pytest test_dashboard.py::TestDashboardDisplay

# Run specific test
pytest test_dashboard.py::TestDashboardDisplay::test_dashboard_loads

# Run by marker
pytest -m smoke                    # Only smoke tests
pytest -m critical                 # Critical tests only
pytest -m "not slow"               # Exclude slow tests

# Run with custom options
pytest --browser edge              # Use Edge instead of Chrome
pytest --headless                  # Run in headless mode (default)
pytest -v                          # Verbose output
pytest -s                          # Show print statements
```

## 🔄 Parallel Execution

Run tests in parallel for faster execution:

```bash
# Auto-detect CPU cores
pytest -n auto

# Specify number of workers
pytest -n 4

# With verbose output
pytest -n 4 -v
```

## 📋 Test Categories

### Smoke Tests
Quick sanity checks for core functionality:
```bash
pytest -m smoke
```

### Regression Tests
Full feature testing for stability:
```bash
pytest -m regression
```

### Critical Tests
Mission-critical functionality:
```bash
pytest -m critical
```

### UI Tests
Visual and UI element tests:
```bash
pytest -m ui
```

### Data-Driven Tests
Parameterized tests with multiple data sets:
```bash
pytest -m data_driven
```

## 📊 Test Reports

Generate HTML reports:

```bash
# Basic report
pytest --html=reports/report.html --self-contained-html

# Report with coverage
pytest --cov=tests --cov-report=html
```

## 🔍 Page Object Model

Tests use the Page Object Model pattern for maintainability:

```python
from page_objects import DashboardPage

# Example usage
dashboard = DashboardPage(driver, base_url)
moisture = dashboard.get_moisture_value()
temperature = dashboard.get_temperature_value()
assert dashboard.is_chart_visible()
```

### Available Page Objects:
- `HomePage` - Main navigation and brand
- `DashboardPage` - Sensor metrics and charts
- `DetectionPage` - AI disease detection
- `ProfilePage` - Farmer profile management
- `ChatbotPage` - AI chatbot interaction
- `LanguagePage` - Language/localization

## 🧪 Test Data Management

Test data is centralized in `test_data.json`:

```python
from test_utils import TestDataManager

# Load test data
profiles = TestDataManager.get_profile_data()
diseases = TestDataManager.get_diseases()
chat_messages = TestDataManager.get_chat_messages()
```

## 🛠️ Utilities & Helpers

### AssertionHelper
```python
AssertionHelper.assert_has_unit(value, "%")
AssertionHelper.assert_value_in_range(value, min, max)
AssertionHelper.assert_contains_keywords(text, keywords)
```

### WaitHelper
```python
WaitHelper.smart_wait(condition_func, timeout=10)
WaitHelper.wait_for_element_value_change(element, initial_value)
WaitHelper.wait_for_text_change(element, initial_text)
```

### ScreenshotHelper
```python
ScreenshotHelper.take_screenshot(driver, "test_name")
ScreenshotHelper.take_screenshot_on_failure(driver, "test_name")
```

### DataGenerator
```python
DataGenerator.generate_profile_variations(base_profile, count=10)
DataGenerator.generate_sensor_readings(count=50)
DataGenerator.generate_invalid_profile_data(count=20)
```

## 🎯 Test Execution Examples

### Run Dashboard Tests with Verbose Output
```bash
pytest test_dashboard.py -v --tb=short
```

### Run Profile Tests in Parallel
```bash
pytest test_profile.py -n 4 -v
```

### Run Critical Tests Only
```bash
pytest -m critical --tb=short
```

### Run with Coverage Report
```bash
pytest --cov=tests --cov-report=term-missing --cov-report=html
```

### Run with Specific Browser
```bash
pytest --browser chrome
pytest --browser edge
```

### Run with Timeout
```bash
pytest --timeout=300  # 5 minute timeout per test
```

## 📝 Continuous Integration

### GitHub Actions Example
```yaml
- name: Run Selenium Tests
  run: |
    cd tests
    pip install -r requirements.txt
    pytest --junitxml=results.xml --html=reports/report.html
```

## 🐛 Debugging

### Run Single Test with Debugging
```bash
pytest test_dashboard.py::TestDashboardDisplay::test_dashboard_loads -vv -s
```

### Run with Detailed Logs
```bash
pytest --log-cli-level=DEBUG --log-file=debug.log
```

### Run Without Headless Mode (See Browser)
```bash
pytest --headless=false
```

## ✅ Test Statistics

Running all 420+ tests:
- **Expected Duration**: 30-45 minutes (sequential)
- **Expected Duration**: 8-12 minutes (parallel with 4 workers)
- **Success Rate Goal**: > 95%
- **Coverage**: Complete user workflows from registration to diagnosis

## 🔧 Configuration

Edit `pytest.ini` to customize:
- Test timeout
- Log level
- Report generation
- Parallel worker count
- Marker definitions

Edit `conftest.py` to customize:
- Browser options (Chrome/Edge)
- Headless mode
- Implicit wait times
- Base URL

## 📚 Test Documentation

Each test file has comprehensive docstrings:

```python
class TestDashboardDisplay:
    """Dashboard display and visibility tests."""
    
    def test_dashboard_loads(self, dashboard_page):
        """Test dashboard page loads."""
        assert dashboard_page.is_present(dashboard_page.SENSOR_MOISTURE)
```

## 🤝 Contributing

When adding new tests:

1. **Use Page Object Model** - Avoid element locators in tests
2. **Add Docstrings** - Document test purpose
3. **Use Fixtures** - Leverage pytest fixtures for setup
4. **Parameterize** - Use `@pytest.mark.parametrize` for data-driven tests
5. **Add Markers** - Tag tests with appropriate markers
6. **Update Test Data** - Add data to `test_data.json` if needed

## 🔗 Related Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Pytest Documentation](https://docs.pytest.org/)
- [WebDriver Manager](https://github.com/SergeyPirogov/webdriver_manager)

## ❓ Troubleshooting

### Tests Not Finding Elements
```bash
# Run with increased implicit wait
pytest --timeout=120  # Increase timeout
```

### Browser Driver Issues
```bash
# Reinstall WebDriver Manager
pip install --upgrade webdriver-manager
```

### Parallel Execution Not Working
```bash
# Install xdist
pip install pytest-xdist
```

### Port Already in Use
- Change frontend port: `python -m http.server 8001`
- Change backend port in `backend/app.py`

## 📞 Support

For issues or questions:
1. Check test logs: `tests/test_run.log`
2. Review test reports: `tests/reports/report.html`
3. Check conftest.py for fixture definitions
4. Review page_objects.py for available methods

---

**Test Framework Version**: 1.0.0  
**Last Updated**: 2024  
**Total Test Cases**: 420+
