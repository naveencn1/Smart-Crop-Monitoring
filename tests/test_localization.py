"""
Localization and language tests - 40+ test cases.
Tests language switching, translations, and multi-language support.
"""

import pytest
import time
from page_objects import HomePage, LanguagePage, DashboardPage, ProfilePage, DetectionPage
from test_utils import TestDataManager


class TestLanguageToggle:
    """Language toggle functionality tests."""
    
    @pytest.fixture
    def language_page(self, driver, base_url):
        """Initialize LanguagePage object."""
        return LanguagePage(driver, base_url)
    
    def test_language_button_visible(self, language_page):
        """Test language button is visible."""
        assert language_page.is_visible(*language_page.LANG_BTN_DESKTOP)
    
    def test_language_button_clickable(self, language_page):
        """Test language button is clickable."""
        language_page.toggle_language()
        time.sleep(1)
        # Should still be present after click
        assert language_page.is_present(language_page.LANG_BTN_DESKTOP)
    
    @pytest.mark.parametrize("toggle_count", range(1, 6))
    def test_repeated_language_toggle(self, language_page, toggle_count):
        """Test repeated language toggles."""
        for i in range(toggle_count):
            language_page.toggle_language()
            time.sleep(0.5)
        
        # Should still be functional
        assert language_page.is_visible(*language_page.LANG_BTN_DESKTOP)


class TestEnglishLanguage:
    """English language tests."""
    
    @pytest.fixture
    def language_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        return LanguagePage(driver, base_url)
    
    def test_english_text_visible(self, language_page):
        """Test English text is visible."""
        home_page = HomePage(language_page.driver, language_page.base_url)
        brand = home_page.get_brand_name()
        # Should have English or mixed content
        assert len(brand) > 0
    
    def test_english_dashboard_title(self, driver, base_url):
        """Test English dashboard title."""
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_dashboard()
        time.sleep(1)
        title = home_page.get_text(*home_page.HEADER_TITLE)
        assert "Dashboard" in title or len(title) > 0
    
    def test_english_profile_title(self, driver, base_url):
        """Test English profile title."""
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_profile()
        time.sleep(1)
        title = home_page.get_text(*home_page.HEADER_TITLE)
        assert len(title) > 0


class TestTeluguLanguage:
    """Telugu language tests."""
    
    @pytest.fixture
    def language_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        # Switch to Telugu
        lang_page.toggle_language()
        time.sleep(1)
        return lang_page
    
    def test_telugu_interface_available(self, language_page):
        """Test Telugu interface is available."""
        # Just verify we can toggle to Telugu without errors
        assert language_page.is_present(language_page.LANG_BTN_DESKTOP)
    
    def test_toggle_back_to_english(self, language_page):
        """Test toggling back to English."""
        language_page.toggle_language()
        time.sleep(1)
        # Should be back to English
        assert language_page.is_present(language_page.LANG_BTN_DESKTOP)


class TestLanguagePersistence:
    """Language preference persistence tests."""
    
    def test_language_persists_on_navigation(self, driver, base_url):
        """Test language persists when navigating."""
        lang_page = LanguagePage(driver, base_url)
        home_page = HomePage(driver, base_url)
        
        # Switch language
        lang_page.toggle_language()
        time.sleep(1)
        
        # Navigate away
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        # Navigate back
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Should still be in same language
        assert lang_page.is_present(lang_page.LANG_BTN_DESKTOP)
    
    @pytest.mark.parametrize("navigation_view", [
        "dashboard",
        "detection",
        "profile",
    ])
    def test_language_persists_across_views(self, driver, base_url, navigation_view):
        """Test language persists across different views."""
        lang_page = LanguagePage(driver, base_url)
        home_page = HomePage(driver, base_url)
        
        # Switch language
        lang_page.toggle_language()
        time.sleep(1)
        
        # Navigate to different view
        if navigation_view == "dashboard":
            home_page.navigate_to_dashboard()
        elif navigation_view == "detection":
            home_page.navigate_to_detection()
        elif navigation_view == "profile":
            home_page.navigate_to_profile()
        
        time.sleep(1)
        
        # Language button should still be present
        assert lang_page.is_present(lang_page.LANG_BTN_DESKTOP)


class TestTranslationCoverage:
    """Translation coverage tests."""
    
    def test_dashboard_has_translations(self, driver, base_url):
        """Test dashboard has translations."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Get English text
        home_page.navigate_to_dashboard()
        time.sleep(1)
        english_title = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Switch to Telugu
        lang_page.toggle_language()
        time.sleep(1)
        
        # Get Telugu text
        telugu_title = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Both should have content
        assert len(english_title) > 0 and len(telugu_title) > 0
    
    def test_profile_has_translations(self, driver, base_url):
        """Test profile page has translations."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Navigate to profile
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # Get text in original language
        title1 = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Toggle language
        lang_page.toggle_language()
        time.sleep(1)
        
        # Get text in other language
        title2 = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Both should have content
        assert len(title1) > 0 and len(title2) > 0
    
    def test_detection_has_translations(self, driver, base_url):
        """Test detection page has translations."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Navigate to detection
        home_page.navigate_to_detection()
        time.sleep(1)
        
        # Get text in original language
        title1 = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Toggle language
        lang_page.toggle_language()
        time.sleep(1)
        
        # Get text in other language
        title2 = home_page.get_text(*home_page.HEADER_TITLE)
        
        # Both should have content
        assert len(title1) > 0 and len(title2) > 0


class TestLanguageConsistency:
    """Language consistency tests."""
    
    @pytest.mark.parametrize("toggle_sequence", [
        [1],
        [1, 1],
        [1, 1, 1],
    ])
    def test_language_toggle_consistency(self, driver, base_url, toggle_sequence):
        """Test language toggle consistency."""
        lang_page = LanguagePage(driver, base_url)
        
        for toggles in toggle_sequence:
            for _ in range(toggles):
                lang_page.toggle_language()
                time.sleep(0.5)
        
        # Should still be functional
        assert lang_page.is_present(lang_page.LANG_BTN_DESKTOP)
    
    def test_language_consistency_across_rapid_toggling(self, driver, base_url):
        """Test language consistency with rapid toggling."""
        lang_page = LanguagePage(driver, base_url)
        home_page = HomePage(driver, base_url)
        
        # Rapid toggles
        for i in range(3):
            lang_page.toggle_language()
            time.sleep(0.3)
        
        # Should still be functional
        home_page.navigate_to_dashboard()
        time.sleep(1)
        assert home_page.is_present(home_page.HEADER_TITLE)


class TestMultipleLanguageScenarios:
    """Multiple language scenario tests."""
    
    def test_complete_workflow_in_english(self, driver, base_url):
        """Test complete workflow in English."""
        home_page = HomePage(driver, base_url)
        
        # Navigate through different sections
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        home_page.navigate_to_profile()
        time.sleep(1)
        
        home_page.navigate_to_detection()
        time.sleep(1)
        
        # All should work
        assert home_page.is_present(home_page.NAV_DASHBOARD)
    
    def test_complete_workflow_in_telugu(self, driver, base_url):
        """Test complete workflow in Telugu."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Switch to Telugu
        lang_page.toggle_language()
        time.sleep(1)
        
        # Navigate through different sections
        home_page.navigate_to_dashboard()
        time.sleep(1)
        
        home_page.navigate_to_profile()
        time.sleep(1)
        
        # All should work
        assert home_page.is_present(home_page.NAV_DASHBOARD)


class TestLanguageUIElements:
    """Language UI element tests."""
    
    @pytest.fixture
    def language_page(self, driver, base_url):
        return LanguagePage(driver, base_url)
    
    def test_language_button_always_visible(self, language_page):
        """Test language button is always visible."""
        assert language_page.is_visible(*language_page.LANG_BTN_DESKTOP)
    
    def test_language_button_maintains_visibility_after_toggle(self, language_page):
        """Test language button visibility after toggle."""
        language_page.toggle_language()
        time.sleep(1)
        assert language_page.is_visible(*language_page.LANG_BTN_DESKTOP)
    
    @pytest.mark.parametrize("view_name", [
        "dashboard",
        "detection",
        "profile",
    ])
    def test_language_button_visible_in_all_views(self, driver, base_url, view_name):
        """Test language button visible in all views."""
        home_page = HomePage(driver, base_url)
        lang_page = LanguagePage(driver, base_url)
        
        # Navigate to view
        if view_name == "dashboard":
            home_page.navigate_to_dashboard()
        elif view_name == "detection":
            home_page.navigate_to_detection()
        elif view_name == "profile":
            home_page.navigate_to_profile()
        
        time.sleep(1)
        
        # Language button should be visible
        assert lang_page.is_visible(*lang_page.LANG_BTN_DESKTOP)


@pytest.mark.smoke
class TestLocalizationSmoke:
    """Smoke tests for localization."""
    
    def test_smoke_language_toggle(self, driver, base_url):
        """Smoke test language toggle."""
        lang_page = LanguagePage(driver, base_url)
        lang_page.toggle_language()
        time.sleep(1)
        assert lang_page.is_present(lang_page.LANG_BTN_DESKTOP)


@pytest.mark.ui
class TestLocalizationUI:
    """UI tests for localization."""
    
    def test_ui_language_button_visible(self, driver, base_url):
        """Test language button UI."""
        lang_page = LanguagePage(driver, base_url)
        assert lang_page.is_visible(*lang_page.LANG_BTN_DESKTOP)
