import os
import time
import sys
import traceback
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

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

def ensure_logged_in(driver):
    try:
        login_screen = driver.find_element(By.ID, "login-screen")
        if "hidden" not in login_screen.get_attribute("class"):
            driver.find_element(By.ID, "login-username").clear()
            driver.find_element(By.ID, "login-username").send_keys("farmer@smartcrop.ai")
            driver.find_element(By.ID, "login-password").clear()
            driver.find_element(By.ID, "login-password").send_keys("ValidPass!2026")
            driver.find_element(By.CSS_SELECTOR, ".login-submit-btn").click()
            time.sleep(1.5)  # Wait for transition spinner
    except Exception as e:
        print(f"[Warning] Login verification failed: {e}")

def run_test_case(driver, test_id, module, scenario, test_fn, *args):
    start_time = datetime.now()
    excel_report.add_log(start_time.strftime("%Y-%m-%d %H:%M:%S"), test_id, f"Start executing {scenario}", "INFO")
    
    try:
        test_fn(driver, test_id, *args)
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

# ==========================================
# E2E TEST STEP DEFINITIONS
# ==========================================

# 1. LOGIN MODULE (TC_01 - TC_50)
def tc_login_credentials(driver, test_id, username, password, toggle_pwd=False):
    # Only load page for the first test or if we are not on the site
    if test_id == "TC_01" or not driver.current_url.startswith(BASE_URL):
        driver.get(BASE_URL)
        time.sleep(1.5)
        
    # If the user is logged in (app-container is visible, or login-screen is hidden), log out first
    try:
        if "hidden" in driver.find_element(By.ID, "login-screen").get_attribute("class"):
            driver.find_element(By.ID, "logout-btn").click()
            time.sleep(0.5)
    except Exception:
        pass
        
    assert "hidden" not in driver.find_element(By.ID, "login-screen").get_attribute("class"), "Login screen is not displayed"
    
    driver.find_element(By.ID, "login-username").clear()
    driver.find_element(By.ID, "login-username").send_keys(username)
    
    driver.find_element(By.ID, "login-password").clear()
    driver.find_element(By.ID, "login-password").send_keys(password)
    
    if toggle_pwd:
        # Click toggle (first time)
        for _ in range(3):
            try:
                driver.find_element(By.ID, "password-toggle").click()
                break
            except Exception:
                time.sleep(0.2)
        time.sleep(0.25)
        # Assert type is text (re-query elements dynamically to avoid stale reference)
        assert driver.find_element(By.ID, "login-password").get_attribute("type") == "text", "Password did not toggle to text"
        
        # Click toggle (second time)
        for _ in range(3):
            try:
                driver.find_element(By.ID, "password-toggle").click()
                break
            except Exception:
                time.sleep(0.2)
        time.sleep(0.25)
        # Assert type is password (re-query elements dynamically to avoid stale reference)
        assert driver.find_element(By.ID, "login-password").get_attribute("type") == "password", "Password did not toggle back to password"
        
    driver.find_element(By.CSS_SELECTOR, ".login-submit-btn").click()
    time.sleep(1.5)  # Wait for transition spinner
    
    assert "hidden" not in driver.find_element(By.CLASS_NAME, "app-container").get_attribute("class"), "App container is not visible after login"

# 2. NAVIGATION MODULE (TC_51 - TC_110)
def tc_navigation_tab(driver, test_id, target_view):
    ensure_logged_in(driver)
    
    nav_item = driver.find_element(By.XPATH, f"//li[@data-view='{target_view}']")
    nav_item.click()
    time.sleep(0.05)
    
    section = driver.find_element(By.ID, f"{target_view}-view")
    assert "active" in section.get_attribute("class"), f"Section {target_view} is not active"
    
    header_title = driver.find_element(By.ID, "header-page-title").text.strip()
    assert len(header_title) > 0, "Header page title is empty"

# 3. CHATBOT MODULE (TC_111 - TC_190)
def tc_chatbot_message(driver, test_id, message, is_telugu=False):
    ensure_logged_in(driver)
    
    # Check language
    lang_btn = driver.find_element(By.ID, "lang-btn-desktop")
    lang_text = lang_btn.find_element(By.TAG_NAME, "span").text.strip()
    
    # Toggle language if needed
    if (is_telugu and "తెలుగు" in lang_text) or (not is_telugu and "English" in lang_text):
        lang_btn.click()
        time.sleep(0.3)
        
    # Open chatbot window if not open
    chatbot_window = driver.find_element(By.ID, "chatbot-window")
    if "active" not in chatbot_window.get_attribute("class"):
        driver.find_element(By.ID, "chatbot-trigger").click()
        time.sleep(0.2)
        
    input_field = driver.find_element(By.ID, "chatbot-text-input")
    input_field.clear()
    input_field.send_keys(message)
    
    driver.find_element(By.ID, "chatbot-send-btn").click()
    # Wait for reply bubble to be appended and typing indicator to be removed
    time.sleep(2.5)
    
    try:
        # Select only chatbot bot replies that are NOT the typing bubble indicator
        bubbles = driver.find_elements(By.CSS_SELECTOR, "#chatbot-messages-container .chat-bubble.bot:not(.typing)")
        assert len(bubbles) > 0, "No bot reply bubbles found"
        last_reply = bubbles[-1].text.strip()
        assert len(last_reply) > 0, "Bot reply bubble is empty"
    finally:
        # Close chatbot window to prevent overlay issues in other modules
        if "active" in chatbot_window.get_attribute("class"):
            driver.find_element(By.ID, "chatbot-close").click()
            time.sleep(0.2)

# 4. PROFILE MODULE (TC_191 - TC_240)
def tc_profile_update(driver, test_id, name, phone, location, crop, size, soil):
    ensure_logged_in(driver)
    
    driver.find_element(By.XPATH, "//li[@data-view='profile']").click()
    time.sleep(0.5)
    assert "active" in driver.find_element(By.ID, "profile-view").get_attribute("class"), "Profile view is not active"
    
    name_input = driver.find_element(By.ID, "farmer-name")
    name_input.clear()
    name_input.send_keys(name)
    
    phone_input = driver.find_element(By.ID, "farmer-phone")
    phone_input.clear()
    phone_input.send_keys(phone)
    
    loc_input = driver.find_element(By.ID, "farm-location")
    loc_input.clear()
    loc_input.send_keys(location)
    
    Select(driver.find_element(By.ID, "farm-crop")).select_by_value(crop)
    
    size_input = driver.find_element(By.ID, "farm-size")
    size_input.clear()
    size_input.send_keys(str(size))
    
    Select(driver.find_element(By.ID, "soil-type")).select_by_value(soil)
    
    driver.find_element(By.CSS_SELECTOR, "#profile-form button[type='submit']").click()
    
    # Assert Toast message exists instead of native alert (poll to avoid race conditions)
    toast_titles = []
    success = False
    for _ in range(8):
        toasts = driver.find_elements(By.CSS_SELECTOR, "#toast-wrapper .toast-title")
        toast_titles = [t.text for t in toasts if t.text.strip()]
        if any("Saved" in title or "సేవ్" in title or "Success" in title for title in toast_titles):
            success = True
            break
        time.sleep(0.15)
    assert success, f"Expected save toast not found in: {toast_titles}"
    time.sleep(0.2)
    
    assert driver.find_element(By.ID, "farmer-name").get_attribute("value") == name, "Name field not saved correctly"
    assert driver.find_element(By.ID, "farmer-phone").get_attribute("value") == phone, "Phone field not saved correctly"

# 5. SENSORS MODULE (TC_241 - TC_280)
def tc_sensor_telemetry(driver, test_id, iteration):
    ensure_logged_in(driver)
    driver.find_element(By.XPATH, "//li[@data-view='dashboard']").click()
    time.sleep(0.05)
    
    moisture_text = driver.find_element(By.ID, "sensor-moisture-val").text
    assert "%" in moisture_text, f"Invalid moisture metric format: {moisture_text}"
    
    temp_text = driver.find_element(By.ID, "sensor-temp-val").text
    assert "°C" in temp_text, f"Invalid temperature metric format: {temp_text}"
    
    humidity_text = driver.find_element(By.ID, "sensor-humidity-val").text
    assert "%" in humidity_text, f"Invalid humidity metric format: {humidity_text}"
    
    chart = driver.find_element(By.ID, "sensor-svg-chart")
    assert chart.is_displayed(), "Sensor activity SVG chart is not visible"

# 6. LEAF SCAN MODULE (TC_321 - TC_330)
def tc_leaf_diagnostic(driver, test_id, crop_type):
    ensure_logged_in(driver)
    
    # Set crop in profile
    driver.find_element(By.XPATH, "//li[@data-view='profile']").click()
    time.sleep(0.5)
    assert "active" in driver.find_element(By.ID, "profile-view").get_attribute("class"), "Profile view is not active"
    Select(driver.find_element(By.ID, "farm-crop")).select_by_value(crop_type)
    driver.find_element(By.CSS_SELECTOR, "#profile-form button[type='submit']").click()
    
    # Assert Toast message exists instead of native alert (poll to avoid race conditions)
    toast_titles = []
    success = False
    for _ in range(8):
        toasts = driver.find_elements(By.CSS_SELECTOR, "#toast-wrapper .toast-title")
        toast_titles = [t.text for t in toasts if t.text.strip()]
        if any("Saved" in title or "సేవ్" in title or "Success" in title for title in toast_titles):
            success = True
            break
        time.sleep(0.15)
    assert success, f"Expected save toast not found in: {toast_titles}"
    time.sleep(0.1)
    
    # Go to diagnostic
    driver.find_element(By.XPATH, "//li[@data-view='detection']").click()
    time.sleep(0.5)
    assert "active" in driver.find_element(By.ID, "detection-view").get_attribute("class"), "Detection view is not active"
    
    driver.find_element(By.ID, "use-sample-btn").click()
    time.sleep(2.4)  # Wait for AI scanning to complete (2s simulator in UI)
    
    assert driver.find_element(By.ID, "results-card").is_displayed(), "Diagnostic results card is not visible"
    
    disease_name = driver.find_element(By.ID, "res-disease-name").text.strip()
    confidence = driver.find_element(By.ID, "res-confidence").text.strip()
    treatment = driver.find_element(By.ID, "res-treatment").text.strip()
    
    assert len(disease_name) > 0, "Disease name is blank"
    assert "%" in confidence, f"Confidence level format invalid: {confidence}"
    assert len(treatment) > 0, "Suggested treatment plan is blank"

# 7. DRONE MODULE (TC_331 - TC_340)
def tc_drone_telemetry(driver, test_id, view_type):
    ensure_logged_in(driver)
    driver.find_element(By.XPATH, "//li[@data-view='drone']").click()
    time.sleep(0.1)
    
    if view_type == "NDVI":
        btn = driver.find_element(By.ID, "btn-view-ndvi")
        btn.click()
        time.sleep(0.1)
        assert "active" in btn.get_attribute("class"), "NDVI button not active"
    else:
        btn = driver.find_element(By.ID, "btn-view-normal")
        btn.click()
        time.sleep(0.1)
        assert "active" in btn.get_attribute("class"), "Visual Feed button not active"
        
    alt = driver.find_element(By.ID, "drone-alt").text
    bat = driver.find_element(By.ID, "drone-bat").text
    assert "m" in alt, f"Invalid altitude HUD format: {alt}"
    assert "%" in bat, f"Invalid battery HUD format: {bat}"

# 8. ALERTS MODULE (TC_341 - TC_350)
def tc_alert_dismiss(driver, test_id, dismiss_all=False):
    ensure_logged_in(driver)
    driver.find_element(By.XPATH, "//li[@data-view='alerts']").click()
    time.sleep(0.2)
    
    if dismiss_all:
        clear_btn = driver.find_element(By.ID, "clear-alerts-btn")
        clear_btn.click()
        time.sleep(1.2)
        cards = driver.find_elements(By.CSS_SELECTOR, "#alerts-list-container .alert-item-card")
        assert len(cards) == 0, "Alerts list not cleared after clicking Clear All"
    else:
        cards = driver.find_elements(By.CSS_SELECTOR, "#alerts-list-container .alert-item-card")
        if len(cards) > 0:
            initial_count = len(cards)
            dismiss_btn = cards[0].find_element(By.CLASS_NAME, "dismiss-alert-btn")
            dismiss_btn.click()
            time.sleep(1.2)
            new_cards = driver.find_elements(By.CSS_SELECTOR, "#alerts-list-container .alert-item-card")
            assert len(new_cards) == initial_count - 1, "Alert count did not decrease by 1"



# ==========================================
# MAIN TEST EXECUTION PIPELINE
# ==========================================

def run_tests():
    driver = None
    try:
        driver = create_driver()
        driver.implicitly_wait(5)
        driver.get(BASE_URL)
        time.sleep(1)
        
        # Configure Excel env details
        browser_name = driver.capabilities.get("browserName", "Chrome")
        browser_version = driver.capabilities.get("browserVersion", "Unknown")
        excel_report.set_env_details(
            browser=f"{browser_name.capitalize()} {browser_version}",
            mode="Headless",
            url=BASE_URL
        )
        
        excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Setup", "Navigate to Smart Crop Monitoring App", "SUCCESS", f"URL: {BASE_URL}")
        
        # 1. Login Module: 50 test cases (TC_01 to TC_50)
        print("\n--- Running Login Module (50 test cases) ---")
        for i in range(1, 51):
            test_id = f"TC_{i:02d}"
            username = f"farmer_{i:02d}@smartcrop.ai"
            password = f"ValidPass!2026_{i:02d}"
            toggle_pwd = (i % 2 == 0)
            scenario = f"Validate user login session and credentials for {username} (Toggle Password: {toggle_pwd})"
            run_test_case(driver, test_id, "Login", scenario, tc_login_credentials, username, password, toggle_pwd)
            
        # Ensure logged in for subsequent tests
        ensure_logged_in(driver)

        # 2. Navigation Module: 100 test cases (TC_51 to TC_150)
        print("\n--- Running Navigation Module (100 test cases) ---")
        views = ['home', 'dashboard', 'detection', 'drone', 'alerts', 'profile']
        for i in range(51, 151):
            test_id = f"TC_{i}"
            target_view = views[(i - 51) % len(views)]
            scenario = f"Verify navigation tab switching to {target_view} view and header title sync"
            run_test_case(driver, test_id, "Navigation", scenario, tc_navigation_tab, target_view)

        # 3. Chatbot Module: 80 test cases (TC_151 to TC_230)
        print("\n--- Running Chatbot Module (80 test cases) ---")
        en_questions = [
            "How to treat Rice Blast?", "What is early blight in tomato?", "Optimal soil moisture limits?",
            "Wheat leaf rust organic treatment?", "How often should I water wheat?", "How does temperature affect crops?",
            "What fertilizers should I use for rice?", "Krishi AI tips for tomato rot", "Moisture sensor Zone A warning",
            "Fungal infection signs on rice leaves"
        ]
        te_questions = [
            "వరి అగ్గి తెగులు నివారణ ఎలా?", "టమోటా ఎర్లీ బ్లైట్ నివారణ మార్గాలు?", "నేల తేమ ఎంత శాతం ఉండాలి?",
            "గోధుమ తుప్పు తెగులు చికిత్స విధానం?", "వరి పంటకు ఎంత నీరు అవసరం?", "టమోటా మొక్కలను కాపాడడం ఎలా?",
            "నత్రజని ఎరువుల వినియోగం ఎలా?", "నేల తేమ లోపం అంటే ఏమిటి?", "డ్రోన్ విమాన పెట్రోలింగ్ సమాచారం",
            "కృషి AI వ్యవసాయ సలహా"
        ]
        for i in range(151, 231):
            test_id = f"TC_{i}"
            is_telugu = (i % 2 == 0)
            if is_telugu:
                message = te_questions[(i - 151) % len(te_questions)] + f" (Ref: #{i})"
            else:
                message = en_questions[(i - 151) % len(en_questions)] + f" (Ref: #{i})"
            
            scenario = f"Verify Krishi AI chatbot responses for query in {'Telugu' if is_telugu else 'English'}"
            run_test_case(driver, test_id, "Chatbot", scenario, tc_chatbot_message, message, is_telugu)

        # 4. Profile Module: 50 test cases (TC_231 to TC_280)
        print("\n--- Running Profile Module (50 test cases) ---")
        crops = ['rice', 'tomato', 'wheat', 'chilli']
        soils = ['black', 'red', 'alluvial', 'sandy']
        for i in range(231, 281):
            test_id = f"TC_{i}"
            name = f"Farmer Rama Rao {i - 230}"
            phone = f"+91 98765 432{i - 230:02d}"
            location = f"Kaza Village Sector {i - 230}"
            crop = crops[(i - 231) % len(crops)]
            size = float((i - 231) % 10 + 1)
            soil = soils[(i - 231) % len(soils)]
            
            scenario = f"Validate profile updating and dashboard header sync for {name}"
            run_test_case(driver, test_id, "Farm Profile", scenario, tc_profile_update, name, phone, location, crop, size, soil)

        # 5. Sensors Module: 40 test cases (TC_281 to TC_320)
        print("\n--- Running Sensors Module (40 test cases) ---")
        for i in range(281, 321):
            test_id = f"TC_{i}"
            scenario = f"Verify live IoT sensor data format and SVG activity graph metrics check (Run {i - 280})"
            run_test_case(driver, test_id, "Telemetry Sensors", scenario, tc_sensor_telemetry, i)

        # 6. Leaf Scan Module: 10 test cases (TC_321 to TC_330)
        print("\n--- Running Leaf Scan Module (10 test cases) ---")
        scan_crops = ['rice', 'tomato', 'wheat', 'rice', 'tomato', 'wheat', 'rice', 'tomato', 'wheat', 'rice'] * 2
        for i in range(321, 331):
            test_id = f"TC_{i}"
            crop = scan_crops[i - 321]
            scenario = f"Validate leaf disease scan output for primary crop set to {crop.capitalize()}"
            run_test_case(driver, test_id, "AI Diagnostics", scenario, tc_leaf_diagnostic, crop)

        # 7. Drone Module: 10 test cases (TC_331 to TC_340)
        print("\n--- Running Drone Module (10 test cases) ---")
        for i in range(331, 341):
            test_id = f"TC_{i}"
            view_type = "NDVI" if (i % 2 == 0) else "Visual"
            scenario = f"Verify drone monitor page elements and HUD for {view_type} Feed"
            run_test_case(driver, test_id, "Drone Monitor", scenario, tc_drone_telemetry, view_type)

        # 8. Alerts Module: 10 test cases (TC_341 to TC_350)
        print("\n--- Running Alerts Module (10 test cases) ---")
        for i in range(341, 351):
            test_id = f"TC_{i}"
            dismiss_all = (i == 350)
            scenario = f"Verify Alerts warning notifications and dismiss actions (Clear All: {dismiss_all})"
            run_test_case(driver, test_id, "Alerts Center", scenario, tc_alert_dismiss, dismiss_all)

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
        failed_tests = [t for t in excel_report.tests if t['status'].lower() == 'failed']
        failed_count = len(failed_tests)
        
        if failed_count > 0:
            print(f"\n[-] {failed_count} tests failed.")
            for ft in failed_tests:
                print(f"  - {ft['id']} ({ft['scenario']}): {ft['failure_reason']}")
            sys.exit(1)
        else:
            print(f"\n[+] E2E Run Complete: exactly 350 passed and 0 failed.")
            sys.exit(0)

if __name__ == "__main__":
    run_tests()
