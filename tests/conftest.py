"""
Pytest configuration and fixtures for Selenium test suite.
Supports parallel execution and cross-browser testing.
"""

import pytest
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE_URL = "http://localhost:8000"
IMPLICIT_WAIT = 5


def pytest_addoption(parser):
    """Add custom command-line options."""
    parser.addoption("--browser", action="store", default="chrome", 
                     help="Browser to use: chrome or edge")
    parser.addoption("--headless", action="store_true", default=True,
                     help="Run browser in headless mode")
    parser.addoption("--slowmo", action="store", type=int, default=0,
                     help="Add delay in milliseconds between actions")


def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "smoke: mark test as smoke test"
    )
    config.addinivalue_line(
        "markers", "regression: mark test as regression test"
    )
    config.addinivalue_line(
        "markers", "critical: mark test as critical"
    )
    config.addinivalue_line(
        "markers", "ui: mark test as UI test"
    )
    config.addinivalue_line(
        "markers", "data_driven: mark test as data-driven"
    )


@pytest.fixture(scope="session")
def browser_config(request):
    """Provide browser configuration."""
    return {
        "browser": request.config.getoption("--browser"),
        "headless": request.config.getoption("--headless"),
        "slowmo": request.config.getoption("--slowmo"),
    }


@pytest.fixture
def driver(browser_config):
    """Create and teardown Selenium WebDriver."""
    browser_type = browser_config["browser"]
    headless = browser_config["headless"]
    slowmo = browser_config["slowmo"]
    
    driver = None
    try:
        if browser_type.lower() == "chrome":
            options = webdriver.ChromeOptions()
            if headless:
                options.add_argument("--headless=new")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            try:
                driver = webdriver.Chrome(options=options)
            except Exception:
                driver = webdriver.Chrome(
                    service=ChromeService(ChromeDriverManager().install()),
                    options=options
                )
            print("\n[Driver] Chrome browser initialized")
        else:
            options = webdriver.EdgeOptions()
            if headless:
                options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")
            
            try:
                driver = webdriver.Edge(options=options)
            except Exception:
                driver = webdriver.Edge(
                    service=EdgeService(EdgeChromiumDriverManager().install()),
                    options=options
                )
            print("\n[Driver] Edge browser initialized")
        
        driver.implicitly_wait(IMPLICIT_WAIT)
        yield driver
        
    finally:
        if driver:
            driver.quit()
            print("\n[Driver] Browser closed")


@pytest.fixture
def base_url():
    """Provide base URL."""
    return BASE_URL


@pytest.fixture
def delay(browser_config):
    """Provide delay utility."""
    import time
    slowmo = browser_config["slowmo"] / 1000 if browser_config["slowmo"] else 0
    return lambda: time.sleep(slowmo) if slowmo else None


@pytest.fixture(autouse=True)
def reset_app(driver, base_url):
    """Reset app to home state before each test."""
    driver.get(base_url)
    import time
    time.sleep(1)
    yield


# Markers for test organization
def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers."""
    for item in items:
        if "navigation" in item.nodeid:
            item.add_marker(pytest.mark.ui)
        if "sensor" in item.nodeid:
            item.add_marker(pytest.mark.critical)
        if "detection" in item.nodeid:
            item.add_marker(pytest.mark.critical)
        if "profile" in item.nodeid:
            item.add_marker(pytest.mark.smoke)
