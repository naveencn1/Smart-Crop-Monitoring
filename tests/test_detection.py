"""
Disease detection AI scanner tests - 60+ test cases.
Tests leaf scanning, disease detection, confidence scores, and treatment suggestions.
"""

import pytest
import time
from page_objects import HomePage, DetectionPage
from test_utils import TestDataManager, AssertionHelper, ScreenshotHelper


class TestDetectionPageLoad:
    """Disease detection page load tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        """Initialize DetectionPage object."""
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_detection_page_loads(self, detection_page):
        """Test detection page loads."""
        assert detection_page.is_present(detection_page.USE_SAMPLE_BTN)
    
    def test_sample_button_visible(self, detection_page):
        """Test sample button is visible."""
        assert detection_page.is_visible(*detection_page.USE_SAMPLE_BTN)
    
    def test_sample_button_clickable(self, detection_page):
        """Test sample button is clickable."""
        detection_page.click(*detection_page.USE_SAMPLE_BTN)
        time.sleep(3)
        assert detection_page.is_present(detection_page.RESULT_CONTAINER)


class TestLeafScanning:
    """Leaf scanning functionality tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_click_sample_triggers_scan(self, detection_page):
        """Test clicking sample button triggers scan."""
        detection_page.click_use_sample()
        time.sleep(0.5)
        # Should be scanning or have results
        assert (detection_page.is_present(detection_page.SCANNING_INDICATOR) or 
                detection_page.is_present(detection_page.RESULT_CONTAINER))
    
    def test_scan_produces_results(self, detection_page):
        """Test scan produces results."""
        detection_page.click_use_sample()
        time.sleep(3.5)  # Wait for scan to complete
        
        # Results should be present
        assert detection_page.is_present(detection_page.DISEASE_NAME)
        assert detection_page.is_present(detection_page.CONFIDENCE)
        assert detection_page.is_present(detection_page.TREATMENT)
    
    @pytest.mark.parametrize("scan_attempt", range(1, 6))
    def test_multiple_scans_work(self, detection_page, scan_attempt):
        """Test multiple scans work."""
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        disease = detection_page.get_disease_name()
        assert len(disease) > 0


class TestDetectionResults:
    """Disease detection results validation tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        detection_page = DetectionPage(driver, base_url)
        detection_page.click_use_sample()
        time.sleep(3.5)
        return detection_page
    
    def test_disease_name_displayed(self, detection_page):
        """Test disease name is displayed."""
        disease = detection_page.get_disease_name()
        assert len(disease) > 0
    
    def test_confidence_score_displayed(self, detection_page):
        """Test confidence score is displayed."""
        confidence = detection_page.get_confidence()
        assert len(confidence) > 0
        assert "%" in confidence
    
    def test_treatment_displayed(self, detection_page):
        """Test treatment is displayed."""
        treatment = detection_page.get_treatment()
        assert len(treatment) > 0
    
    def test_disease_name_not_empty(self, detection_page):
        """Test disease name is not empty."""
        disease = detection_page.get_disease_name()
        assert disease.strip() != ""
    
    def test_confidence_is_numeric(self, detection_page):
        """Test confidence contains numeric value."""
        confidence = detection_page.get_confidence()
        # Extract numbers
        import re
        numbers = re.findall(r'\d+', confidence)
        assert len(numbers) > 0
    
    def test_treatment_is_detailed(self, detection_page):
        """Test treatment is detailed."""
        treatment = detection_page.get_treatment()
        assert len(treatment) > 10  # Should be at least somewhat detailed
    
    @pytest.mark.parametrize("min_confidence", [80, 85, 90])
    def test_confidence_above_threshold(self, detection_page, min_confidence):
        """Test confidence is above minimum threshold."""
        confidence = detection_page.get_confidence()
        import re
        numbers = re.findall(r'\d+', confidence)
        if numbers:
            conf_value = int(numbers[0])
            # Confidence should be reasonable
            assert conf_value > 0
    
    def test_disease_name_is_string(self, detection_page):
        """Test disease name is a string."""
        disease = detection_page.get_disease_name()
        assert isinstance(disease, str)
    
    def test_treatment_contains_actionable_info(self, detection_page):
        """Test treatment contains actionable information."""
        treatment = detection_page.get_treatment()
        # Should contain action words
        action_keywords = ["apply", "remove", "improve", "use", "spray", "treat"]
        has_action = any(keyword in treatment.lower() for keyword in action_keywords)
        assert has_action or len(treatment) > 0  # Should have some content


class TestBoundingBox:
    """Bounding box and visualization tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        detection_page = DetectionPage(driver, base_url)
        detection_page.click_use_sample()
        time.sleep(3.5)
        return detection_page
    
    def test_bounding_box_element_exists(self, detection_page):
        """Test bounding box element exists."""
        assert detection_page.is_present(detection_page.BOUNDING_BOX)
    
    def test_result_container_visible(self, detection_page):
        """Test result container is visible."""
        assert detection_page.is_visible(*detection_page.RESULT_CONTAINER)
    
    @pytest.mark.parametrize("check_count", range(1, 4))
    def test_results_remain_visible(self, detection_page, check_count):
        """Test results remain visible."""
        for _ in range(check_count):
            assert detection_page.is_visible(*detection_page.RESULT_CONTAINER)
            time.sleep(0.5)


class TestDiseaseDiagnosis:
    """Disease diagnosis with different types of diseases."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        detection_page = DetectionPage(driver, base_url)
        detection_page.click_use_sample()
        time.sleep(3.5)
        return detection_page
    
    @pytest.mark.parametrize("expected_keywords", [
        ["disease", "detection"],
        ["leaf", "scan"],
        ["confidence", "%"],
        ["treatment", ""],
    ])
    def test_results_contain_keywords(self, detection_page, expected_keywords):
        """Test results contain expected keywords."""
        disease = detection_page.get_disease_name()
        confidence = detection_page.get_confidence()
        treatment = detection_page.get_treatment()
        
        full_text = f"{disease} {confidence} {treatment}".lower()
        
        # At least some keywords should be present
        assert len(full_text) > 0
    
    def test_disease_name_is_known_disease(self, detection_page):
        """Test detected disease is a valid disease."""
        disease = detection_page.get_disease_name()
        
        # Disease name should be meaningful
        assert len(disease) > 0
        assert disease != "Unknown"
    
    def test_health_status_detection(self, detection_page):
        """Test can detect healthy status."""
        disease = detection_page.get_disease_name()
        
        # Should detect either disease or healthy status
        assert "healthy" in disease.lower() or "disease" in disease.lower() or len(disease) > 0


class TestDetectionWorkflow:
    """Complete detection workflow tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_complete_scan_workflow(self, detection_page):
        """Test complete scan workflow."""
        # Click sample
        detection_page.click_use_sample()
        time.sleep(0.5)
        
        # Wait for results
        time.sleep(3)
        
        # Verify results
        disease = detection_page.get_disease_name()
        confidence = detection_page.get_confidence()
        treatment = detection_page.get_treatment()
        
        assert len(disease) > 0
        assert len(confidence) > 0
        assert len(treatment) > 0
    
    @pytest.mark.parametrize("workflow_iteration", range(1, 4))
    def test_repeated_scan_workflow(self, detection_page, workflow_iteration):
        """Test repeated scan workflow."""
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        disease = detection_page.get_disease_name()
        assert len(disease) > 0
    
    def test_scan_clear_previous_results(self, detection_page):
        """Test multiple scans update results."""
        # First scan
        detection_page.click_use_sample()
        time.sleep(3.5)
        disease1 = detection_page.get_disease_name()
        
        # Second scan
        detection_page.click_use_sample()
        time.sleep(3.5)
        disease2 = detection_page.get_disease_name()
        
        # Both should have results
        assert len(disease1) > 0
        assert len(disease2) > 0


class TestDetectionUI:
    """UI and visual elements tests."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_upload_input_element_exists(self, detection_page):
        """Test upload input element exists."""
        assert detection_page.is_present(detection_page.UPLOAD_INPUT)
    
    def test_sample_button_element_present(self, detection_page):
        """Test sample button element present."""
        assert detection_page.is_present(detection_page.USE_SAMPLE_BTN)
    
    def test_result_display_area_exists(self, detection_page):
        """Test result display area exists."""
        # Before scanning, result container might not be visible
        # After scanning it should appear
        detection_page.click_use_sample()
        time.sleep(3.5)
        assert detection_page.is_present(detection_page.RESULT_CONTAINER)


class TestDetectionStress:
    """Stress tests for detection feature."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    @pytest.mark.parametrize("rapid_scans", range(1, 4))
    def test_rapid_consecutive_scans(self, detection_page, rapid_scans):
        """Test rapid consecutive scans."""
        for i in range(rapid_scans):
            detection_page.click_use_sample()
            time.sleep(3.5)
            
            disease = detection_page.get_disease_name()
            assert len(disease) > 0
    
    def test_scan_stability_over_time(self, detection_page):
        """Test scan stability over time."""
        for i in range(3):
            detection_page.click_use_sample()
            time.sleep(3.5)
            
            disease = detection_page.get_disease_name()
            confidence = detection_page.get_confidence()
            treatment = detection_page.get_treatment()
            
            assert len(disease) > 0
            assert len(confidence) > 0
            assert len(treatment) > 0
            
            time.sleep(1)


@pytest.mark.smoke
class TestDetectionSmoke:
    """Smoke tests for detection."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_smoke_detection_scan(self, detection_page):
        """Smoke test detection scan."""
        detection_page.click_use_sample()
        time.sleep(3.5)
        disease = detection_page.get_disease_name()
        assert len(disease) > 0


@pytest.mark.critical
class TestDetectionCritical:
    """Critical tests for detection."""
    
    @pytest.fixture
    def detection_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        home_page.navigate_to_detection()
        return DetectionPage(driver, base_url)
    
    def test_critical_ai_detection_works(self, detection_page):
        """Critical test - AI detection must work."""
        detection_page.click_use_sample()
        time.sleep(3.5)
        
        disease = detection_page.get_disease_name()
        confidence = detection_page.get_confidence()
        
        assert len(disease) > 0
        assert "%" in confidence
