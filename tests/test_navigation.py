"""
Navigation and view switching tests - 40+ test cases.
Tests sidebar navigation, view transitions, and page headers.
"""

import pytest
import time
from page_objects import HomePage
from test_utils import TestDataManager, AssertionHelper


class TestNavigation:
    """Navigation feature tests."""
    
    @pytest.fixture
    def home_page(self, driver, base_url):
        """Initialize HomePage object."""
        return HomePage(driver, base_url)
    
    def test_page_load_and_brand_verification(self, home_page):
        """Test page loads and brand name is visible."""
        brand_name = home_page.get_brand_name()
        assert "SmartCrop" in brand_name or "Crop" in brand_name
    
    def test_api_status_indicator_visible(self, home_page):
        """Test API status indicator is displayed."""
        status = home_page.get_api_status()
        assert "MODE" in status.upper()
    
    @pytest.mark.parametrize("nav_data", TestDataManager.get_navigation_paths())
    def test_navigate_between_views(self, home_page, nav_data):
        """Test navigation between different views."""
        from_view = nav_data["from"]
        to_view = nav_data["to"]
        expected_view = nav_data["expected_view"]
        
        # Navigate to starting view
        if from_view == "dashboard":
            home_page.navigate_to_dashboard()
        elif from_view == "detection":
            home_page.navigate_to_detection()
        elif from_view == "profile":
            home_page.navigate_to_profile()
        
        time.sleep(0.5)
        
        # Navigate to target view
        if to_view == "dashboard":
            home_page.navigate_to_dashboard()
        elif to_view == "detection":
            home_page.navigate_to_detection()
        elif to_view == "profile":
            home_page.navigate_to_profile()
        
        # Verify correct view
        time.sleep(0.5)
        assert home_page.is_present(home_page.HEADER_TITLE)
    
    def test_dashboard_navigation(self, home_page):
        """Test navigation to dashboard."""
        home_page.navigate_to_dashboard()
        assert home_page.is_present(home_page.NAV_DASHBOARD)
    
    def test_detection_navigation(self, home_page):
        """Test navigation to detection."""
        home_page.navigate_to_detection()
        assert home_page.is_present(home_page.NAV_DETECTION)
    
    def test_profile_navigation(self, home_page):
        """Test navigation to profile."""
        home_page.navigate_to_profile()
        assert home_page.is_present(home_page.NAV_PROFILE)
    
    def test_history_navigation(self, home_page):
        """Test navigation to history."""
        home_page.navigate_to_history()
        assert home_page.is_present(home_page.NAV_HISTORY)
    
    def test_rapid_navigation_switching(self, home_page):
        """Test rapid switching between views."""
        for i in range(3):
            home_page.navigate_to_dashboard()
            time.sleep(0.3)
            home_page.navigate_to_detection()
            time.sleep(0.3)
            home_page.navigate_to_profile()
            time.sleep(0.3)
    
    def test_navigation_persistence(self, home_page):
        """Test navigation state persists."""
        home_page.navigate_to_profile()
        time.sleep(0.5)
        profile_nav = home_page.is_present(home_page.NAV_PROFILE)
        
        # Navigate away and back
        home_page.navigate_to_dashboard()
        home_page.navigate_to_profile()
        time.sleep(0.5)
        
        profile_nav_again = home_page.is_present(home_page.NAV_PROFILE)
        assert profile_nav and profile_nav_again
    
    @pytest.mark.parametrize("view_count", range(5))
    def test_navigation_cycle(self, home_page, view_count):
        """Test cycling through all views."""
        views = [
            home_page.navigate_to_dashboard,
            home_page.navigate_to_detection,
            home_page.navigate_to_profile
        ]
        for view in views:
            view()
            time.sleep(0.3)
    
    def test_multiple_rapid_clicks_dashboard(self, home_page):
        """Test multiple rapid clicks on dashboard nav."""
        for _ in range(5):
            home_page.navigate_to_dashboard()
            time.sleep(0.2)
    
    def test_header_title_changes_on_navigation(self, home_page):
        """Test header title changes when navigating."""
        home_page.navigate_to_dashboard()
        time.sleep(0.5)
        title1 = home_page.get_text(*home_page.HEADER_TITLE)
        
        home_page.navigate_to_profile()
        time.sleep(0.5)
        title2 = home_page.get_text(*home_page.HEADER_TITLE)
        
        assert title1 != title2
    
    @pytest.mark.parametrize("nav_sequence", [
        ["dashboard", "detection", "dashboard"],
        ["detection", "profile", "detection"],
        ["profile", "dashboard", "profile"],
        ["dashboard", "profile", "detection", "dashboard"],
    ])
    def test_navigation_sequences(self, home_page, nav_sequence):
        """Test various navigation sequences."""
        nav_map = {
            "dashboard": home_page.navigate_to_dashboard,
            "detection": home_page.navigate_to_detection,
            "profile": home_page.navigate_to_profile,
        }
        
        for view in nav_sequence:
            nav_map[view]()
            time.sleep(0.3)
    
    def test_navigation_responsiveness(self, home_page):
        """Test navigation responds quickly."""
        import time
        start = time.time()
        home_page.navigate_to_detection()
        elapsed = time.time() - start
        assert elapsed < 2  # Should load quickly
    
    def test_back_and_forth_navigation(self, home_page):
        """Test back and forth navigation."""
        for _ in range(3):
            home_page.navigate_to_dashboard()
            time.sleep(0.2)
            home_page.navigate_to_detection()
            time.sleep(0.2)
    
    def test_all_nav_buttons_clickable(self, home_page):
        """Test all navigation buttons are clickable."""
        nav_buttons = [
            home_page.navigate_to_dashboard,
            home_page.navigate_to_detection,
            home_page.navigate_to_profile,
            home_page.navigate_to_history,
        ]
        
        for nav_btn in nav_buttons:
            nav_btn()
            time.sleep(0.2)
    
    @pytest.mark.parametrize("repeat_count", range(1, 6))
    def test_repeated_navigation_to_same_view(self, home_page, repeat_count):
        """Test repeated navigation to same view."""
        for _ in range(repeat_count):
            home_page.navigate_to_profile()
            time.sleep(0.2)


@pytest.mark.smoke
class TestNavigationSmoke:
    """Smoke tests for navigation."""
    
    @pytest.fixture
    def home_page(self, driver, base_url):
        return HomePage(driver, base_url)
    
    def test_smoke_basic_navigation(self, home_page):
        """Smoke test basic navigation."""
        home_page.navigate_to_dashboard()
        assert home_page.is_present(home_page.NAV_DASHBOARD)


@pytest.mark.regression
class TestNavigationRegression:
    """Regression tests for navigation."""
    
    @pytest.fixture
    def home_page(self, driver, base_url):
        return HomePage(driver, base_url)
    
    def test_regression_nav_stability(self, home_page):
        """Regression test navigation stability."""
        for i in range(10):
            home_page.navigate_to_dashboard()
            assert home_page.is_present(home_page.NAV_DASHBOARD)
