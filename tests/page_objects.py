"""
Page Object Model for SmartCrop Application.
Encapsulates all element locators and interactions.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time


class BasePage:
    """Base page object with common functionality."""
    
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)
        self.actions = ActionChains(driver)
    
    def navigate_to(self, url=""):
        """Navigate to URL."""
        self.driver.get(self.base_url + url)
        time.sleep(1)
    
    def find(self, by, value):
        """Find element with explicit wait."""
        return self.wait.until(EC.presence_of_element_located((by, value)))
    
    def click(self, by, value):
        """Click element with wait."""
        element = self.wait.until(EC.element_to_be_clickable((by, value)))
        element.click()
    
    def send_keys(self, by, value, text):
        """Send keys to element."""
        element = self.find(by, value)
        element.clear()
        element.send_keys(text)
    
    def get_text(self, by, value):
        """Get text from element."""
        element = self.find(by, value)
        return element.text
    
    def get_attribute(self, by, value, attr):
        """Get attribute from element."""
        element = self.find(by, value)
        return element.get_attribute(attr)
    
    def is_visible(self, by, value):
        """Check if element is visible."""
        try:
            self.wait.until(EC.visibility_of_element_located((by, value)))
            return True
        except:
            return False
    
    def is_present(self, by, value):
        """Check if element is present in DOM."""
        try:
            self.find(by, value)
            return True
        except:
            return False
    
    def scroll_to_element(self, by, value):
        """Scroll to element."""
        element = self.find(by, value)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)
    
    def wait_for_url_change(self, original_url, timeout=10):
        """Wait for URL to change."""
        WebDriverWait(self.driver, timeout).until(
            lambda driver: driver.current_url != original_url
        )


class HomePage(BasePage):
    """Home/Dashboard page object."""
    
    # Locators
    BRAND_NAME = (By.CLASS_NAME, "brand-name")
    API_STATUS = (By.ID, "api-status-text")
    HEADER_TITLE = (By.ID, "header-page-title")
    
    # Navigation
    NAV_DASHBOARD = (By.XPATH, "//li[@data-view='dashboard']")
    NAV_DETECTION = (By.XPATH, "//li[@data-view='detection']")
    NAV_PROFILE = (By.XPATH, "//li[@data-view='profile']")
    NAV_HISTORY = (By.XPATH, "//li[@data-view='history']")
    
    def get_brand_name(self):
        """Get brand name."""
        return self.get_text(*self.BRAND_NAME)
    
    def get_api_status(self):
        """Get API connection status."""
        return self.get_text(*self.API_STATUS)
    
    def navigate_to_dashboard(self):
        """Navigate to dashboard."""
        self.click(*self.NAV_DASHBOARD)
        time.sleep(1)
    
    def navigate_to_detection(self):
        """Navigate to detection."""
        self.click(*self.NAV_DETECTION)
        time.sleep(1)
    
    def navigate_to_profile(self):
        """Navigate to profile."""
        self.click(*self.NAV_PROFILE)
        time.sleep(1)
    
    def navigate_to_history(self):
        """Navigate to history."""
        self.click(*self.NAV_HISTORY)
        time.sleep(1)


class DashboardPage(BasePage):
    """Dashboard page object."""
    
    # Sensor metrics
    SENSOR_MOISTURE = (By.ID, "sensor-moisture-val")
    SENSOR_TEMPERATURE = (By.ID, "sensor-temperature-val")
    SENSOR_HUMIDITY = (By.ID, "sensor-humidity-val")
    SENSOR_NPK_NITROGEN = (By.ID, "sensor-npk-nitrogen-val")
    SENSOR_NPK_PHOSPHORUS = (By.ID, "sensor-npk-phosphorus-val")
    SENSOR_NPK_POTASSIUM = (By.ID, "sensor-npk-potassium-val")
    
    # Charts
    SENSOR_SVG_CHART = (By.ID, "sensor-svg-chart")
    CHART_CANVAS = (By.ID, "chart-canvas")
    
    # Alerts
    ALERT_CONTAINER = (By.CLASS_NAME, "alert-container")
    ALERT_ITEM = (By.CLASS_NAME, "alert-item")
    
    def get_moisture_value(self):
        """Get soil moisture value."""
        return self.get_text(*self.SENSOR_MOISTURE)
    
    def get_temperature_value(self):
        """Get temperature value."""
        return self.get_text(*self.SENSOR_TEMPERATURE)
    
    def get_humidity_value(self):
        """Get humidity value."""
        return self.get_text(*self.SENSOR_HUMIDITY)
    
    def get_nitrogen_value(self):
        """Get nitrogen value."""
        return self.get_text(*self.SENSOR_NPK_NITROGEN)
    
    def get_phosphorus_value(self):
        """Get phosphorus value."""
        return self.get_text(*self.SENSOR_NPK_PHOSPHORUS)
    
    def get_potassium_value(self):
        """Get potassium value."""
        return self.get_text(*self.SENSOR_NPK_POTASSIUM)
    
    def is_chart_visible(self):
        """Check if chart is visible."""
        return self.is_visible(*self.SENSOR_SVG_CHART)
    
    def get_alert_count(self):
        """Get number of alerts."""
        try:
            alerts = self.driver.find_elements(*self.ALERT_ITEM)
            return len(alerts)
        except:
            return 0


class DetectionPage(BasePage):
    """Disease detection page object."""
    
    # Image upload/sample
    USE_SAMPLE_BTN = (By.ID, "use-sample-btn")
    UPLOAD_INPUT = (By.ID, "leaf-image-input")
    
    # Results
    DISEASE_NAME = (By.ID, "res-disease-name")
    CONFIDENCE = (By.ID, "res-confidence")
    TREATMENT = (By.ID, "res-treatment")
    BOUNDING_BOX = (By.ID, "bounding-box")
    
    # Scanning indicators
    SCANNING_INDICATOR = (By.CLASS_NAME, "scanning-indicator")
    RESULT_CONTAINER = (By.ID, "result-container")
    
    def click_use_sample(self):
        """Click use sample button."""
        self.click(*self.USE_SAMPLE_BTN)
        time.sleep(0.5)
    
    def get_disease_name(self):
        """Get detected disease name."""
        return self.get_text(*self.DISEASE_NAME)
    
    def get_confidence(self):
        """Get confidence percentage."""
        return self.get_text(*self.CONFIDENCE)
    
    def get_treatment(self):
        """Get treatment suggestion."""
        return self.get_text(*self.TREATMENT)
    
    def is_bounding_box_visible(self):
        """Check if bounding box is visible."""
        return self.is_visible(*self.BOUNDING_BOX)
    
    def wait_for_results(self, timeout=10):
        """Wait for scan results."""
        self.wait.until(EC.visibility_of_element_located(self.RESULT_CONTAINER), timeout)


class ProfilePage(BasePage):
    """Farmer profile page object."""
    
    # Form fields
    FARMER_NAME = (By.ID, "farmer-name")
    FARMER_REGION = (By.ID, "farmer-region")
    FARM_SIZE = (By.ID, "farm-size")
    CROP_TYPE = (By.ID, "crop-type")
    PHONE_NUMBER = (By.ID, "phone-number")
    
    # Buttons
    SUBMIT_BTN = (By.XPATH, "//button[@type='submit']")
    RESET_BTN = (By.XPATH, "//button[@type='reset']")
    
    # Messages
    SUCCESS_MESSAGE = (By.CLASS_NAME, "success-message")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    
    def set_farmer_name(self, name):
        """Set farmer name."""
        self.send_keys(*self.FARMER_NAME, name)
    
    def set_farmer_region(self, region):
        """Set farmer region."""
        self.send_keys(*self.FARMER_REGION, region)
    
    def set_farm_size(self, size):
        """Set farm size."""
        self.send_keys(*self.FARM_SIZE, size)
    
    def set_crop_type(self, crop):
        """Set crop type."""
        self.send_keys(*self.CROP_TYPE, crop)
    
    def set_phone_number(self, phone):
        """Set phone number."""
        self.send_keys(*self.PHONE_NUMBER, phone)
    
    def submit_form(self):
        """Submit form."""
        self.click(*self.SUBMIT_BTN)
        time.sleep(1)
    
    def get_farmer_name(self):
        """Get farmer name value."""
        return self.get_attribute(*self.FARMER_NAME, "value")
    
    def get_success_message(self):
        """Get success message."""
        return self.get_text(*self.SUCCESS_MESSAGE)
    
    def is_success_message_visible(self):
        """Check if success message is visible."""
        return self.is_visible(*self.SUCCESS_MESSAGE)


class ChatbotPage(BasePage):
    """Chatbot page object."""
    
    # Elements
    CHATBOT_TRIGGER = (By.ID, "chatbot-trigger")
    CHATBOT_WINDOW = (By.ID, "chatbot-window")
    CHAT_INPUT = (By.ID, "chat-input")
    SEND_BTN = (By.ID, "send-btn")
    CHAT_BUBBLES = (By.CLASS_NAME, "chat-bubble")
    QUICK_REPLY_PILLS = (By.CLASS_NAME, "quick-reply-pill")
    
    def open_chatbot(self):
        """Open chatbot window."""
        self.click(*self.CHATBOT_TRIGGER)
        time.sleep(0.5)
    
    def send_message(self, message):
        """Send message to chatbot."""
        self.send_keys(*self.CHAT_INPUT, message)
        self.click(*self.SEND_BTN)
        time.sleep(2)
    
    def click_quick_reply(self, index=0):
        """Click quick reply pill by index."""
        pills = self.driver.find_elements(*self.QUICK_REPLY_PILLS)
        if index < len(pills):
            pills[index].click()
            time.sleep(2)
    
    def get_message_count(self):
        """Get total messages in conversation."""
        messages = self.driver.find_elements(*self.CHAT_BUBBLES)
        return len(messages)
    
    def get_last_message(self):
        """Get last message text."""
        messages = self.driver.find_elements(*self.CHAT_BUBBLES)
        if messages:
            return messages[-1].text
        return ""


class LanguagePage(BasePage):
    """Language/localization page object."""
    
    # Language button
    LANG_BTN_DESKTOP = (By.ID, "lang-btn-desktop")
    LANG_BTN_MOBILE = (By.ID, "lang-btn-mobile")
    
    def toggle_language(self):
        """Toggle language."""
        self.click(*self.LANG_BTN_DESKTOP)
        time.sleep(1)
    
    def get_current_language_text(self, element_by, element_value):
        """Get text in current language."""
        return self.get_text(element_by, element_value)
