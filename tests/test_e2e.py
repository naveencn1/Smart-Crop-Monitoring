import os
import time
import sys
import traceback
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

# Import the Excel report generator instance
from excel_report import excel_report

BASE_URL = "http://localhost:8000"

def create_driver():
    # Attempt Chrome first
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        # Increase window size to ensure all items are visible
        options.add_argument("--window-size=1920,1080")
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        print("[Driver Setup] Successfully launched headless Chrome")
        return driver
    except Exception as chrome_err:
        print(f"[Driver Setup] Chrome failed: {chrome_err}. Attempting Microsoft Edge...")
        try:
            options = webdriver.EdgeOptions()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")
            driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)
            print("[Driver Setup] Successfully launched headless Edge")
            return driver
        except Exception as edge_err:
            print(f"[Driver Setup] Edge also failed: {edge_err}")
            raise Exception("No usable browser webdrivers found on this system.")

def run_test_case(driver, test_id, module, scenario, test_fn):
    start_time = datetime.now()
    print(f"\n[{test_id}] Running: {scenario}...")
    excel_report.add_log(start_time.strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Start executing {scenario}", "INFO")
    
    try:
        test_fn(driver, test_id)
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        excel_report.add_test(
            test_id=test_id,
            module=module,
            scenario=scenario,
            status="Passed",
            duration=duration,
            start_time=start_time,
            end_time=end_time
        )
        print(f"[+] {test_id} PASSED")
        excel_report.add_log(end_time.strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Completed executing {scenario}", "SUCCESS")
    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        stack_trace = traceback.format_exc()
        
        # Capture screenshot
        screenshot_filename = f"{test_id}_failed.png"
        screenshot_dir = os.path.join(excel_report.excel_dir, 'screenshots')
        os.makedirs(screenshot_dir, exist_ok=True)
        screenshot_path = os.path.join(screenshot_dir, screenshot_filename)
        try:
            driver.save_screenshot(screenshot_path)
            rel_screenshot_path = f"screenshots/{screenshot_filename}"
            print(f"  Captured failure screenshot: {screenshot_path}")
        except Exception as ss_err:
            rel_screenshot_path = "Failed to capture screenshot"
            print(f"  Warning: Could not capture screenshot: {ss_err}")
            
        excel_report.add_test(
            test_id=test_id,
            module=module,
            scenario=scenario,
            status="Failed",
            duration=duration,
            start_time=start_time,
            end_time=end_time,
            failure_reason=str(e),
            stack_trace=stack_trace,
            screenshot_path=rel_screenshot_path
        )
        print(f"[-] {test_id} FAILED: {e}")
        excel_report.add_log(end_time.strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Failed executing {scenario}", "FAILED", str(e))

# Test definitions
def test_1_page_load(driver, test_id):
    driver.get(BASE_URL)
    time.sleep(2)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Navigated to {BASE_URL}", "SUCCESS")
    
    brand_name = driver.find_element(By.CLASS_NAME, "brand-name").text
    assert "SmartCrop AI" in brand_name, f"Unexpected brand title: {brand_name}"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Brand title verified: {brand_name}", "SUCCESS")
    
    status_text = driver.find_element(By.ID, "api-status-text").text
    assert "MODE" in status_text.upper(), f"Invalid status display: {status_text}"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"API Connection Indicator state: {status_text}", "SUCCESS")

def test_2_navigation(driver, test_id):
    nav_dashboard = driver.find_element(By.XPATH, "//li[@data-view='dashboard']")
    nav_dashboard.click()
    time.sleep(1)
    
    header_title = driver.find_element(By.ID, "header-page-title").text
    assert "Dashboard" in header_title or "డాష్‌బోర్డ్" in header_title, "Failed to switch to Dashboard page"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Switched to Dashboard view. Header: {header_title}", "SUCCESS")

def test_3_dashboard_metrics(driver, test_id):
    moisture_val = driver.find_element(By.ID, "sensor-moisture-val").text
    assert "%" in moisture_val, "Soil Moisture metric missing percent unit"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Soil Moisture verified: {moisture_val}", "SUCCESS")
    
    svg_chart = driver.find_element(By.ID, "sensor-svg-chart")
    assert svg_chart.is_displayed(), "SVG Line Chart is not visible"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "SVG Line Chart display verified", "SUCCESS")

def test_4_disease_detection(driver, test_id):
    nav_detection = driver.find_element(By.XPATH, "//li[@data-view='detection']")
    nav_detection.click()
    time.sleep(1)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Switched to Leaf Diagnostic AI Scanner view", "SUCCESS")
    
    sample_btn = driver.find_element(By.ID, "use-sample-btn")
    sample_btn.click()
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Clicked use sample leaf button", "SUCCESS")
    time.sleep(3.5) # Wait for scanning to resolve
    
    disease_name = driver.find_element(By.ID, "res-disease-name").text
    confidence = driver.find_element(By.ID, "res-confidence").text
    treatment = driver.find_element(By.ID, "res-treatment").text
    
    assert len(disease_name) > 0, "No disease name was generated"
    assert "%" in confidence, "Confidence percent value missing"
    assert len(treatment) > 0, "No treatment suggestion displayed"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Diagnosis: {disease_name} ({confidence})", "SUCCESS")
    
    bounding_box = driver.find_element(By.ID, "bounding-box")
    if "Healthy" not in disease_name and "ఆరోగ్య" not in disease_name:
        assert bounding_box.is_displayed(), "AI bounding box overlay was not rendered on infected leaf"
        excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "AI Bounding Box overlay check: Displayed successfully", "SUCCESS")

def test_5_profile_updates(driver, test_id):
    nav_profile = driver.find_element(By.XPATH, "//li[@data-view='profile']")
    nav_profile.click()
    time.sleep(1)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Switched to Farmer Profile view", "SUCCESS")
    
    name_input = driver.find_element(By.ID, "farmer-name")
    name_input.clear()
    name_input.send_keys("Rama Rao Selenium Test")
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    time.sleep(1.5)
    
    updated_name = driver.find_element(By.ID, "farmer-name").get_attribute("value")
    assert updated_name == "Rama Rao Selenium Test", "Failed to update farmer profile name"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Profile updated and verified name: {updated_name}", "SUCCESS")

def test_6_chatbot(driver, test_id):
    chatbot_trigger = driver.find_element(By.ID, "chatbot-trigger")
    chatbot_trigger.click()
    time.sleep(1)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Opened chatbot window", "SUCCESS")
    
    chatbot_window = driver.find_element(By.ID, "chatbot-window")
    assert "active" in chatbot_window.get_attribute("class"), "Chatbot window did not pop open"
    
    quick_reply = driver.find_element(By.XPATH, "//div[contains(@class, 'quick-reply-pill') and (text()='Rice Blast?' or text()='Rice Blast')]")
    quick_reply.click()
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Clicked quick reply topic pill 'Rice Blast?'", "SUCCESS")
    time.sleep(3) # Wait for bot response
    
    messages = driver.find_elements(By.CLASS_NAME, "chat-bubble")
    assert len(messages) >= 3, "Chatbot response bubble was not appended"
    
    bot_response = messages[-1].text
    assert len(bot_response) > 0, "Empty bot response"
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Received chatbot reply: {bot_response[:60]}...", "SUCCESS")

def test_7_localization(driver, test_id):
    # First, let's verify we are on profile tab to see header localization
    nav_profile = driver.find_element(By.XPATH, "//li[@data-view='profile']")
    nav_profile.click()
    time.sleep(0.5)

    lang_btn = driver.find_element(By.ID, "lang-btn-desktop")
    lang_btn.click()
    time.sleep(1)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Toggled language to Telugu", "SUCCESS")
    
    telugu_header = driver.find_element(By.ID, "header-page-title").text
    assert "ప్రొఫైల్" in telugu_header or "Farmer" not in telugu_header, "Telugu translation failed for view header"
    
    # Toggle back to English
    lang_btn.click()
    time.sleep(1)
    excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), test_id, "Toggled language back to English", "SUCCESS")
    
    english_header = driver.find_element(By.ID, "header-page-title").text
    assert "Profile" in english_header, "English translation revert failed"

def run_tests():
    driver = None
    try:
        driver = create_driver()
        driver.implicitly_wait(5)
        
        # Configure Excel env details
        browser_name = driver.capabilities.get("browserName", "Chrome")
        browser_version = driver.capabilities.get("browserVersion", "Unknown")
        excel_report.set_env_details(
            browser=f"{browser_name.capitalize()} {browser_version}",
            mode="Headless",
            url=BASE_URL
        )
        
        excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Setup", "Navigate to base URL", "SUCCESS", f"URL: {BASE_URL}")
        
        # Run test cases
        run_test_case(driver, "TC_01", "Main Page", "Page Load & Connection status check", test_1_page_load)
        run_test_case(driver, "TC_02", "Navigation", "Sidebar Navigation", test_2_navigation)
        run_test_case(driver, "TC_03", "Dashboard", "Dashboard IoT Sensor Metrics & Chart", test_3_dashboard_metrics)
        run_test_case(driver, "TC_04", "AI Scan", "Disease Detection & AI Scanning", test_4_disease_detection)
        run_test_case(driver, "TC_05", "Profile", "Farmer Profile Updates", test_5_profile_updates)
        run_test_case(driver, "TC_06", "Chatbot", "AI Chatbot Float Trigger & Conversation", test_6_chatbot)
        run_test_case(driver, "TC_07", "Localization", "Multi-Language Telugu Localization Toggle", test_7_localization)
        
    except Exception as e:
        print(f"\n[-] Selenium E2E Setup or execution FAILED: {e}")
        excel_report.add_test(
            "Setup", "Setup", "Browser driver setup", "Failed", 0, 
            datetime.now(), datetime.now(), str(e), traceback.format_exc()
        )
    finally:
        if driver:
            driver.quit()
        
        report_path = excel_report.generate_report()
        print(f"\n[Excel Report] Generated report at: {report_path}")
        
        # Check if any tests failed
        failed_count = sum(1 for t in excel_report.tests if t['status'].lower() == 'failed')
        if failed_count > 0:
            print(f"\n[-] {failed_count} tests failed. Exiting with failure status.")
            sys.exit(1)
        else:
            print("\n[+] All tests completed successfully.")
            sys.exit(0)

if __name__ == "__main__":
    run_tests()
