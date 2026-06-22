"""
Test utilities and helper functions for Selenium tests.
"""

import json
import os
import time
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)


class TestDataManager:
    """Manage test data loading and retrieval."""
    
    _data = None
    
    @classmethod
    def load_data(cls):
        """Load test data from JSON file."""
        if cls._data is None:
            test_data_path = Path(__file__).parent / "test_data.json"
            with open(test_data_path, 'r') as f:
                cls._data = json.load(f)
        return cls._data
    
    @classmethod
    def get_profile_data(cls):
        """Get profile test data."""
        return cls.load_data()["profile_data"]
    
    @classmethod
    def get_chat_messages(cls):
        """Get chat messages."""
        return cls.load_data()["chat_messages"]
    
    @classmethod
    def get_sensor_ranges(cls):
        """Get sensor value ranges."""
        return cls.load_data()["sensor_value_ranges"]
    
    @classmethod
    def get_invalid_inputs(cls):
        """Get invalid input test cases."""
        return cls.load_data()["invalid_inputs"]
    
    @classmethod
    def get_languages(cls):
        """Get language data."""
        return cls.load_data()["languages"]
    
    @classmethod
    def get_diseases(cls):
        """Get disease data."""
        return cls.load_data()["diseases"]
    
    @classmethod
    def get_navigation_paths(cls):
        """Get navigation paths."""
        return cls.load_data()["navigation_paths"]
    
    @classmethod
    def get_quick_reply_topics(cls):
        """Get quick reply topics."""
        return cls.load_data()["quick_reply_topics"]


class AssertionHelper:
    """Helper methods for common assertions."""
    
    @staticmethod
    def assert_element_has_text(element, expected_text):
        """Assert element contains text."""
        actual = element.text
        assert expected_text in actual, f"Expected '{expected_text}' in '{actual}'"
    
    @staticmethod
    def assert_value_in_range(value, min_val, max_val, name="Value"):
        """Assert value is in range."""
        # Extract numeric value if it has units
        numeric_value = float(''.join(c for c in str(value) if c.isdigit() or c == '.'))
        assert min_val <= numeric_value <= max_val, \
            f"{name} {numeric_value} not in range [{min_val}, {max_val}]"
    
    @staticmethod
    def assert_has_unit(value, unit):
        """Assert value contains unit."""
        value_str = str(value)
        assert unit in value_str, f"Expected '{unit}' in '{value_str}'"
    
    @staticmethod
    def assert_contains_keywords(text, keywords):
        """Assert text contains all keywords."""
        text_lower = text.lower()
        for keyword in keywords:
            assert keyword.lower() in text_lower, \
                f"Expected keyword '{keyword}' not found in '{text}'"


class WaitHelper:
    """Helper methods for waits and delays."""
    
    @staticmethod
    def smart_wait(condition_func, timeout=10, poll_frequency=0.5):
        """Wait for condition with polling."""
        start = time.time()
        while time.time() - start < timeout:
            try:
                if condition_func():
                    return True
            except:
                pass
            time.sleep(poll_frequency)
        raise TimeoutError(f"Condition not met within {timeout} seconds")
    
    @staticmethod
    def wait_for_element_value_change(element, initial_value, timeout=10):
        """Wait for element's value to change."""
        WaitHelper.smart_wait(
            lambda: element.get_attribute('value') != initial_value,
            timeout
        )
    
    @staticmethod
    def wait_for_text_change(element, initial_text, timeout=10):
        """Wait for element's text to change."""
        WaitHelper.smart_wait(
            lambda: element.text != initial_text,
            timeout
        )


class TestReportHelper:
    """Helper methods for test reporting."""
    
    @staticmethod
    def create_test_report(test_results):
        """Create test report summary."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": len(test_results),
            "passed": len([t for t in test_results if t.get("status") == "PASSED"]),
            "failed": len([t for t in test_results if t.get("status") == "FAILED"]),
            "skipped": len([t for t in test_results if t.get("status") == "SKIPPED"]),
            "tests": test_results
        }
        return report
    
    @staticmethod
    def save_report(report, filename="test_report.json"):
        """Save report to file."""
        report_path = Path(__file__).parent / "reports" / filename
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        logger.info(f"Report saved to {report_path}")


class ScreenshotHelper:
    """Helper methods for screenshots."""
    
    @staticmethod
    def take_screenshot(driver, name="screenshot"):
        """Take screenshot."""
        screenshot_dir = Path(__file__).parent / "screenshots"
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = screenshot_dir / filename
        
        driver.save_screenshot(str(filepath))
        logger.info(f"Screenshot saved: {filepath}")
        return str(filepath)
    
    @staticmethod
    def take_screenshot_on_failure(driver, test_name):
        """Take screenshot on test failure."""
        ScreenshotHelper.take_screenshot(driver, f"failure_{test_name}")


class DataGenerator:
    """Generate test data for parameterized tests."""
    
    @staticmethod
    def generate_profile_variations(base_profile, count=10):
        """Generate profile data variations."""
        variations = []
        for i in range(count):
            profile = base_profile.copy()
            profile['name'] = f"{base_profile['name']}_{i}"
            profile['phone'] = f"{9876543210 + i}"
            variations.append(profile)
        return variations
    
    @staticmethod
    def generate_sensor_readings(count=50):
        """Generate random sensor readings."""
        import random
        readings = []
        for i in range(count):
            readings.append({
                "moisture": random.randint(20, 80),
                "temperature": random.randint(15, 40),
                "humidity": random.randint(30, 95),
                "nitrogen": random.randint(0, 300),
                "phosphorus": random.randint(0, 100),
                "potassium": random.randint(0, 500)
            })
        return readings
    
    @staticmethod
    def generate_invalid_profile_data(count=20):
        """Generate invalid profile data for negative testing."""
        invalid_data = []
        
        # Test various invalid scenarios
        scenarios = [
            {"name": "", "phone": "9876543210"},  # Empty name
            {"name": "A", "phone": "9876543210"},  # Name too short
            {"name": "Valid Name", "phone": "123"},  # Invalid phone
            {"name": "Valid Name", "phone": ""},  # Empty phone
            {"name": "X" * 100, "phone": "9876543210"},  # Name too long
            {"name": "123", "phone": "9876543210"},  # Only numbers
            {"name": "Valid@Name", "phone": "9876543210"},  # Special chars
        ]
        
        # Repeat scenarios to reach desired count
        for i in range(count):
            invalid_data.append(scenarios[i % len(scenarios)])
        
        return invalid_data


class BrowserHelper:
    """Helper methods for browser interactions."""
    
    @staticmethod
    def switch_to_new_tab(driver):
        """Switch to newly opened tab."""
        driver.switch_to.window(driver.window_handles[-1])
    
    @staticmethod
    def close_current_tab_switch_to_previous(driver):
        """Close current tab and switch to previous."""
        driver.close()
        driver.switch_to.window(driver.window_handles[-1])
    
    @staticmethod
    def accept_alert(driver):
        """Accept alert if present."""
        try:
            alert = driver.switch_to.alert
            alert.accept()
            return True
        except:
            return False
    
    @staticmethod
    def dismiss_alert(driver):
        """Dismiss alert if present."""
        try:
            alert = driver.switch_to.alert
            alert.dismiss()
            return True
        except:
            return False
    
    @staticmethod
    def execute_javascript(driver, script, *args):
        """Execute JavaScript."""
        return driver.execute_script(script, *args)
    
    @staticmethod
    def is_element_in_viewport(driver, element):
        """Check if element is in viewport."""
        return driver.execute_script(
            "return arguments[0].getBoundingClientRect().top >= 0 && "
            "arguments[0].getBoundingClientRect().bottom <= window.innerHeight;",
            element
        )


class PerformanceHelper:
    """Helper methods for performance testing."""
    
    @staticmethod
    def measure_page_load_time(driver, url):
        """Measure page load time."""
        start = time.time()
        driver.get(url)
        # Wait for page to load completely
        driver.execute_script(
            "return document.readyState === 'complete'"
        )
        load_time = time.time() - start
        return load_time
    
    @staticmethod
    def get_page_metrics(driver):
        """Get page performance metrics."""
        metrics = driver.execute_script(
            "return window.performance.getEntriesByType('navigation')[0];"
        )
        return metrics
    
    @staticmethod
    def assert_page_load_time(load_time, max_time=3):
        """Assert page loaded within max time."""
        assert load_time <= max_time, \
            f"Page load time {load_time}s exceeds max {max_time}s"


class APIHelper:
    """Helper methods for API interactions."""
    
    @staticmethod
    def get_api_base_url():
        """Get API base URL."""
        return "http://localhost:5000/api"
    
    @staticmethod
    def check_api_health():
        """Check API health."""
        import requests
        try:
            response = requests.get(f"{APIHelper.get_api_base_url()}/health", timeout=5)
            return response.status_code == 200
        except:
            return False
