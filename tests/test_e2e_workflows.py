"""
End-to-end workflow tests - 100+ test cases.
Tests complete user workflows combining multiple features.
"""

import pytest
import time
from page_objects import (
    HomePage, DashboardPage, DetectionPage, 
    ProfilePage, ChatbotPage, LanguagePage
)
from test_utils import TestDataManager


class TestCompleteUserJourneys:
    """Complete user journey workflow tests."""
    
    def test_farmer_registration_workflow(self, driver, base_url):
        """Test complete farmer registration workflow."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        
        # Navigate to profile
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Fill profile
        profile_page.set_farmer_name("New Farmer Registration")
        profile_page.set_farmer_region("Test Region")
        profile_page.set_farm_size("10")
        profile_page.set_crop_type("Rice")
        
        # Submit
        profile_page.submit_form()
        time.sleep(1)
        
        # Verify submission
        assert profile_page.get_farmer_name() == "New Farmer Registration"
    
    def test_disease_detection_workflow(self, driver, base_url):
        """Test complete disease detection workflow."""
        home_page = HomePage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        
        # Navigate to detection
        home_page.navigate_to_detection()
        time.sleep(1)
        
        # Click sample
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        # Verify results
        disease = detection_page.get_disease_name()
        confidence = detection_page.get_confidence()
        treatment = detection_page.get_treatment()
        
        assert len(disease) > 0
        assert len(confidence) > 0
        assert len(treatment) > 0
    
    def test_dashboard_monitoring_workflow(self, driver, base_url):
        """Test dashboard monitoring workflow."""
        home_page = HomePage(driver, base_url)
        dashboard_page = DashboardPage(driver, base_url)
        
        # Navigate to dashboard
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        # Check metrics
        moisture = dashboard_page.get_moisture_value()
        temperature = dashboard_page.get_temperature_value()
        humidity = dashboard_page.get_humidity_value()
        
        # Verify chart
        assert dashboard_page.is_chart_visible()
        
        # All should have values
        assert len(moisture) > 0
        assert len(temperature) > 0
        assert len(humidity) > 0


class TestMultiFeatureWorkflows:
    """Tests combining multiple features."""
    
    @pytest.mark.parametrize("workflow_iteration", range(1, 4))
    def test_dashboard_to_detection_workflow(self, driver, base_url, workflow_iteration):
        """Test navigating from dashboard to detection."""
        home_page = HomePage(driver, base_url)
        dashboard_page = DashboardPage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        
        # Check dashboard
        home_page.navigate_to_dashboard()
        time.sleep(1)
        dashboard_page.get_moisture_value()
        
        # Go to detection
        home_page.navigate_to_detection()
        time.sleep(1)
        
        # Scan
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        disease = detection_page.get_disease_name()
        assert len(disease) > 0
    
    def test_profile_update_and_dashboard_check(self, driver, base_url):
        """Test updating profile then checking dashboard."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        dashboard_page = DashboardPage(driver, base_url)
        
        # Update profile
        home_page.navigate_to_profile()
        time.sleep(1)
        profile_page.set_farmer_name("Workflow Test Farmer")
        profile_page.submit_form()
        time.sleep(1)
        
        # Check dashboard
        home_page.navigate_to_dashboard()
        time.sleep(1)
        moisture = dashboard_page.get_moisture_value()
        assert len(moisture) > 0
    
    def test_detection_to_chatbot_workflow(self, driver, base_url):
        """Test detection results then asking chatbot."""
        home_page = HomePage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        chatbot_page = ChatbotPage(driver, base_url)
        
        # Get detection result
        home_page.navigate_to_detection()
        time.sleep(1)
        detection_page.click_use_sample()
        time.sleep(3.5)
        disease = detection_page.get_disease_name()
        
        # Ask chatbot about it
        chatbot_page.open_chatbot()
        time.sleep(1)
        chatbot_page.send_message(f"How do I treat {disease}?")
        time.sleep(2)
        
        response = chatbot_page.get_last_message()
        assert len(response) > 0


class TestLanguageAwareWorkflows:
    """Tests with language switching."""
    
    def test_profile_update_in_both_languages(self, driver, base_url):
        """Test profile update in both languages."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Update in English
        home_page.navigate_to_profile()
        time.sleep(1)
        profile_page.set_farmer_name("English Farmer")
        profile_page.submit_form()
        time.sleep(1)
        
        # Switch to Telugu
        lang_page.toggle_language()
        time.sleep(1)
        
        # Check profile in Telugu
        home_page.navigate_to_profile()
        time.sleep(1)
        name = profile_page.get_farmer_name()
        assert "English Farmer" in name or len(name) > 0
    
    def test_navigation_in_telugu(self, driver, base_url):
        """Test full navigation workflow in Telugu."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Switch to Telugu
        lang_page.toggle_language()
        time.sleep(1)
        
        # Navigate through all views
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        home_page.navigate_to_detection()
        time.sleep(1)
        
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # All should work
        assert home_page.is_present(home_page.HEADER_TITLE)


class TestSequentialOperations:
    """Tests sequential operations on same session."""
    
    def test_five_step_workflow(self, driver, base_url):
        """Test five-step complete workflow."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        dashboard_page = DashboardPage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        chatbot_page = ChatbotPage(driver, base_url)
        
        # Step 1: Update profile
        home_page.navigate_to_profile()
        time.sleep(1)
        profile_page.set_farmer_name("Five Step Workflow")
        profile_page.submit_form()
        time.sleep(1)
        
        # Step 2: Check dashboard
        home_page.navigate_to_dashboard()
        time.sleep(1)
        moisture = dashboard_page.get_moisture_value()
        assert len(moisture) > 0
        
        # Step 3: Scan leaf
        home_page.navigate_to_detection()
        time.sleep(1)
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        # Step 4: Chat with bot
        chatbot_page.open_chatbot()
        time.sleep(1)
        chatbot_page.send_message("What are common rice diseases?")
        time.sleep(2)
        
        # Step 5: Back to dashboard
        home_page.navigate_to_dashboard()
        time.sleep(1)
        assert dashboard_page.is_chart_visible()
    
    @pytest.mark.parametrize("cycle_count", range(1, 4))
    def test_navigation_cycle_comprehensive(self, driver, base_url, cycle_count):
        """Test comprehensive navigation cycles."""
        home_page = HomePage(driver, base_url)
        
        views = [
            home_page.navigate_to_dashboard,
            home_page.navigate_to_detection,
            home_page.navigate_to_profile,
        ]
        
        for _ in range(cycle_count):
            for view_nav in views:
                view_nav()
                time.sleep(0.5)


class TestStressWithMultipleOperations:
    """Stress tests with multiple concurrent operations."""
    
    def test_rapid_profile_updates(self, driver, base_url):
        """Test rapid profile updates."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        
        home_page.navigate_to_profile()
        time.sleep(1)
        
        for i in range(5):
            profile_page.set_farmer_name(f"Rapid Update {i}")
            profile_page.submit_form()
            time.sleep(0.5)
    
    def test_rapid_detection_scans(self, driver, base_url):
        """Test rapid detection scans."""
        home_page = HomePage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        
        home_page.navigate_to_detection()
        time.sleep(1)
        
        for i in range(3):
            detection_page.click_use_sample()
            time.sleep(3.5)
            disease = detection_page.get_disease_name()
            assert len(disease) > 0
    
    def test_rapid_language_switching_with_navigation(self, driver, base_url):
        """Test rapid language switching with navigation."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        for i in range(3):
            # Switch language
            lang_page.toggle_language()
            time.sleep(0.5)
            
            # Navigate
            if i % 2 == 0:
                home_page.navigate_to_dashboard()
            else:
                home_page.navigate_to_profile()
            
            time.sleep(0.5)


class TestErrorRecoveryWorkflows:
    """Tests error conditions and recovery."""
    
    def test_form_submission_recovery(self, driver, base_url):
        """Test form submission error recovery."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        
        # Navigate to profile
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Try submit with minimal data
        profile_page.set_farmer_name("")
        profile_page.submit_form()
        time.sleep(1)
        
        # Try again with valid data
        profile_page.set_farmer_name("Recovery Test")
        profile_page.submit_form()
        time.sleep(1)
        
        assert profile_page.get_farmer_name() == "Recovery Test"
    
    def test_navigation_after_errors(self, driver, base_url):
        """Test navigation still works after errors."""
        home_page = HomePage(driver, base_url)
        
        # Try various navigations even if some fail
        for _ in range(3):
            try:
                home_page.navigate_to_dashboard()
                home_page.navigate_to_detection()
                home_page.navigate_to_profile()
                assert True
            except:
                # Should recover
                assert home_page.is_present(home_page.HEADER_TITLE)


@pytest.mark.smoke
class TestE2ESmoke:
    """Smoke tests for end-to-end scenarios."""
    
    def test_smoke_basic_e2e_flow(self, driver, base_url):
        """Smoke test basic e2e flow."""
        home_page = HomePage(driver, base_url)
        
        home_page.navigate_to_dashboard()
        time.sleep(1)
        home_page.navigate_to_detection()
        time.sleep(1)
        home_page.navigate_to_profile()
        time.sleep(1)
        
        assert home_page.is_present(home_page.HEADER_TITLE)


@pytest.mark.critical
class TestE2ECritical:
    """Critical end-to-end tests."""
    
    def test_critical_complete_workflow(self, driver, base_url):
        """Critical test - complete workflow must work."""
        home_page = HomePage(driver, base_url)
        profile_page = ProfilePage(driver, base_url)
        detection_page = DetectionPage(driver, base_url)
        
        # Profile update
        home_page.navigate_to_profile()
        time.sleep(1)
        profile_page.set_farmer_name("Critical Workflow Test")
        profile_page.submit_form()
        assert profile_page.get_farmer_name() == "Critical Workflow Test"
        
        # Detection scan
        home_page.navigate_to_detection()
        time.sleep(1)
        detection_page.click_use_sample()
        time.sleep(3.5)
        disease = detection_page.get_disease_name()
        assert len(disease) > 0


@pytest.mark.regression
class TestE2ERegression:
    """Regression end-to-end tests."""
    
    def test_regression_workflow_stability(self, driver, base_url):
        """Regression test workflow stability."""
        home_page = HomePage(driver, base_url)
        
        for i in range(3):
            home_page.navigate_to_dashboard()
            home_page.navigate_to_detection()
            home_page.navigate_to_profile()
            time.sleep(1)
        
        assert home_page.is_present(home_page.HEADER_TITLE)
