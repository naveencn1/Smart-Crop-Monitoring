import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

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

def run_tests():
    driver = None
    try:
        driver = create_driver()
        driver.implicitly_wait(5)
        
        print(f"\n[Test] Navigating to {BASE_URL}...")
        driver.get(BASE_URL)
        time.sleep(2)
        
        # Test 1: Page Load & Connection status check
        print("[Test 1] Checking brand titles & API connection status...")
        brand_name = driver.find_element(By.CLASS_NAME, "brand-name").text
        assert "SmartCrop AI" in brand_name, f"Unexpected brand title: {brand_name}"
        
        status_text = driver.find_element(By.ID, "api-status-text").text
        print(f"  Brand Title: {brand_name}")
        print(f"  API Connection Indicator state: {status_text}")
        # Note: If the backend is running, it should show 'ONLINE MODE' (or equivalent), else 'OFFLINE MODE'.
        assert "MODE" in status_text.upper(), f"Invalid status display: {status_text}"
        print("[+] Test 1 PASSED: Page loaded and connection indicator is active.")
        
        # Test 2: Sidebar Navigation
        print("\n[Test 2] Testing navigation view switches...")
        nav_dashboard = driver.find_element(By.XPATH, "//li[@data-view='dashboard']")
        nav_dashboard.click()
        time.sleep(1)
        
        header_title = driver.find_element(By.ID, "header-page-title").text
        print(f"  Switched to Dashboard. Header title: {header_title}")
        assert "Dashboard" in header_title or "డాష్‌బోర్డ్" in header_title, "Failed to switch to Dashboard page"
        print("[+] Test 2 PASSED: Navigation operates correctly.")
        
        # Test 3: Dashboard IoT Sensor Metrics & Chart
        print("\n[Test 3] Verifying Dashboard sensor data & SVGs...")
        moisture_val = driver.find_element(By.ID, "sensor-moisture-val").text
        print(f"  Soil Moisture sensor display: {moisture_val}")
        assert "%" in moisture_val, "Soil Moisture metric missing percent unit"
        
        svg_chart = driver.find_element(By.ID, "sensor-svg-chart")
        assert svg_chart.is_displayed(), "SVG Line Chart is not visible"
        print("[+] Test 3 PASSED: Dashboard metrics and line charts are rendering.")

        # Test 4: Disease Detection & AI Scanning
        print("\n[Test 4] Verifying Leaf Diagnostic AI Scanner...")
        nav_detection = driver.find_element(By.XPATH, "//li[@data-view='detection']")
        nav_detection.click()
        time.sleep(1)
        
        sample_btn = driver.find_element(By.ID, "use-sample-btn")
        sample_btn.click()
        print("  Clicked sample leaf button. Wait 3 seconds for scanning simulation...")
        time.sleep(3.5) # Wait for scanning to resolve
        
        disease_name = driver.find_element(By.ID, "res-disease-name").text
        confidence = driver.find_element(By.ID, "res-confidence").text
        treatment = driver.find_element(By.ID, "res-treatment").text
        print(f"  Detected disease: {disease_name}")
        print(f"  Confidence: {confidence}")
        print(f"  Treatment suggested: {treatment[:60]}...")
        
        assert len(disease_name) > 0, "No disease name was generated"
        assert "%" in confidence, "Confidence percent value missing"
        assert len(treatment) > 0, "No treatment suggestion displayed"
        
        bounding_box = driver.find_element(By.ID, "bounding-box")
        # Bounding box should display for infected leaves
        if "Healthy" not in disease_name and "ఆరోగ్య" not in disease_name:
            assert bounding_box.is_displayed(), "AI bounding box overlay was not rendered on infected leaf"
            print("  AI Bounding Box overlay check: Displayed successfully.")
            
        print("[+] Test 4 PASSED: AI Diagnostics scanner resolved and returned correct overlays.")

        # Test 5: Farmer Profile Updates
        print("\n[Test 5] Verifying Profile updates...")
        nav_profile = driver.find_element(By.XPATH, "//li[@data-view='profile']")
        nav_profile.click()
        time.sleep(1)
        
        name_input = driver.find_element(By.ID, "farmer-name")
        name_input.clear()
        name_input.send_keys("Rama Rao Selenium Test")
        
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_btn.click()
        time.sleep(1.5)
        
        # Check profile updating persisted
        updated_name = driver.find_element(By.ID, "farmer-name").get_attribute("value")
        print(f"  Updated farmer name: {updated_name}")
        assert updated_name == "Rama Rao Selenium Test", "Failed to update farmer profile name"
        print("[+] Test 5 PASSED: Farmer and land details form works and updates details.")

        # Test 6: AI Chatbot Float Trigger & Conversation
        print("\n[Test 6] Verifying Krishi AI Chatbot...")
        chatbot_trigger = driver.find_element(By.ID, "chatbot-trigger")
        chatbot_trigger.click()
        time.sleep(1)
        
        chatbot_window = driver.find_element(By.ID, "chatbot-window")
        assert "active" in chatbot_window.get_attribute("class"), "Chatbot window did not pop open"
        
        # Click a quick question pill: Rice Blast?
        quick_reply = driver.find_element(By.XPATH, "//div[contains(@class, 'quick-reply-pill') and (text()='Rice Blast?' or text()='Rice Blast')]")
        quick_reply.click()
        print("  Clicked quick reply topic pill. Waiting for typing response...")
        time.sleep(3) # Wait for bot response
        
        # Verify message count is increased
        messages = driver.find_elements(By.CLASS_NAME, "chat-bubble")
        print(f"  Total chat bubble messages: {len(messages)}")
        assert len(messages) >= 3, "Chatbot response bubble was not appended"
        
        bot_response = messages[-1].text
        print(f"  Krishi AI reply: {bot_response[:60]}...")
        assert len(bot_response) > 0, "Empty bot response"
        print("[+] Test 6 PASSED: Floating chatbot and conversational engine work.")

        # Test 7: Multi-Language Telugu Localization Toggle
        print("\n[Test 7] Verifying English/Telugu translation triggers...")
        lang_btn = driver.find_element(By.ID, "lang-btn-desktop")
        lang_btn.click()
        time.sleep(1)
        
        telugu_header = driver.find_element(By.ID, "header-page-title").text
        print("  Switched to Telugu. Profile header translation verified.")
        assert "ప్రొఫైల్" in telugu_header or "Farmer" not in telugu_header, "Telugu translation failed for view header"
        
        # Toggle back to English
        lang_btn.click()
        time.sleep(1)
        english_header = driver.find_element(By.ID, "header-page-title").text
        print(f"  Toggled back to English. Profile title translation: {english_header}")
        assert "Profile" in english_header, "English translation revert failed"
        print("[+] Test 7 PASSED: Language toggle updates labels and tags.")

        print("\n==================================================")
        print("All Selenium E2E Web Application Tests PASSED!")
        print("==================================================")
        
    except Exception as e:
        print(f"\n[-] Selenium E2E Testing FAILED: {e}")
        sys.exit(1)
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    run_tests()
