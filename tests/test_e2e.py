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

BASE_URL = "http://localhost:8000/finance.html"

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

def ensure_logged_in(driver):
    try:
        login_section = driver.find_element(By.ID, "login-section")
        if login_section.is_displayed():
            driver.find_element(By.ID, "login-username").clear()
            driver.find_element(By.ID, "login-username").send_keys("user@domain.com")
            driver.find_element(By.ID, "login-password").clear()
            driver.find_element(By.ID, "login-password").send_keys("ValidPass!2026")
            driver.find_element(By.ID, "login-btn").click()
            time.sleep(1)
    except Exception:
        pass

def switch_tab_if_needed(driver, tab_name):
    try:
        nav_item = driver.find_element(By.ID, f"nav-{tab_name}")
        if "active" not in nav_item.get_attribute("class"):
            nav_item.click()
            time.sleep(0.5)
    except Exception as e:
        print(f"  Warning during tab switch to {tab_name}: {e}")

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

# ==========================================
# TEST DEFINITIONS
# ==========================================

# 1. LOGIN MODULE
def tc_01_login_empty(driver, test_id):
    driver.get(BASE_URL)
    time.sleep(1)
    driver.find_element(By.ID, "login-btn").click()
    time.sleep(0.5)
    err = driver.find_element(By.ID, "login-error").text
    assert "Both Username and Password are required" in err, f"Unexpected error text: {err}"

def tc_02_login_invalid(driver, test_id):
    driver.find_element(By.ID, "login-username").send_keys("wrong@domain.com")
    driver.find_element(By.ID, "login-password").send_keys("wrongpass")
    driver.find_element(By.ID, "login-btn").click()
    time.sleep(0.5)
    err = driver.find_element(By.ID, "login-error").text
    assert "Invalid username or password" in err, f"Unexpected error text: {err}"

def tc_03_login_success(driver, test_id):
    driver.find_element(By.ID, "login-username").clear()
    driver.find_element(By.ID, "login-username").send_keys("user@domain.com")
    driver.find_element(By.ID, "login-password").clear()
    driver.find_element(By.ID, "login-password").send_keys("ValidPass!2026")
    driver.find_element(By.ID, "login-btn").click()
    time.sleep(1)
    assert driver.find_element(By.ID, "app-section").is_displayed(), "App dashboard section not visible after login"

def tc_04_login_toggle_pwd(driver, test_id):
    driver.find_element(By.ID, "nav-logout").click()
    time.sleep(0.5)
    pwd_field = driver.find_element(By.ID, "login-password")
    assert pwd_field.get_attribute("type") == "password", "Password field type not password originally"
    driver.find_element(By.ID, "toggle-login-pwd").click()
    time.sleep(0.2)
    assert pwd_field.get_attribute("type") == "text", "Password type did not toggle to text"
    driver.find_element(By.ID, "toggle-login-pwd").click()
    time.sleep(0.2)
    assert pwd_field.get_attribute("type") == "password", "Password type did not toggle back to password"

# 2. REGISTRATION MODULE
def tc_05_register_empty(driver, test_id):
    driver.find_element(By.ID, "switch-to-register").click()
    time.sleep(0.5)
    driver.find_element(By.ID, "reg-btn").click()
    time.sleep(0.5)
    err = driver.find_element(By.ID, "reg-error").text
    assert "All fields are required" in err, f"Unexpected error: {err}"

def tc_06_register_mismatch(driver, test_id):
    driver.find_element(By.ID, "reg-username").send_keys("newuser@domain.com")
    driver.find_element(By.ID, "reg-password").send_keys("Password123")
    driver.find_element(By.ID, "reg-confirm-password").send_keys("DifferentPassword")
    driver.find_element(By.ID, "reg-btn").click()
    time.sleep(0.5)
    err = driver.find_element(By.ID, "reg-error").text
    assert "Passwords do not match" in err, f"Unexpected error: {err}"

def tc_07_register_pwd_length(driver, test_id):
    driver.find_element(By.ID, "reg-confirm-password").clear()
    driver.find_element(By.ID, "reg-confirm-password").send_keys("Short")
    driver.find_element(By.ID, "reg-password").clear()
    driver.find_element(By.ID, "reg-password").send_keys("Short")
    driver.find_element(By.ID, "reg-btn").click()
    time.sleep(0.5)
    err = driver.find_element(By.ID, "reg-error").text
    assert "Password must be at least 8 characters long" in err, f"Unexpected error: {err}"

def tc_08_register_success(driver, test_id):
    driver.find_element(By.ID, "reg-password").clear()
    driver.find_element(By.ID, "reg-password").send_keys("ValidPass!2026")
    driver.find_element(By.ID, "reg-confirm-password").clear()
    driver.find_element(By.ID, "reg-confirm-password").send_keys("ValidPass!2026")
    driver.find_element(By.ID, "reg-btn").click()
    time.sleep(2)
    assert driver.find_element(By.ID, "login-section").is_displayed(), "Registration did not redirect back to Login screen"

# 3. DASHBOARD MODULE
def tc_09_dashboard_balance(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "dashboard")
    bal = driver.find_element(By.ID, "net-balance").text
    assert "$" in bal, f"Balance label does not contain dollar symbol: {bal}"

def tc_10_dashboard_chart(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "dashboard")
    chart = driver.find_element(By.ID, "dashboard-svg-chart")
    assert chart.is_displayed(), "SVG Asset chart not displayed"

def tc_11_dashboard_tx_list(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "dashboard")
    table = driver.find_element(By.ID, "dashboard-tx-table")
    assert table.is_displayed(), "Recent transactions table not visible"

def tc_12_dashboard_nav_items(driver, test_id):
    ensure_logged_in(driver)
    assert driver.find_element(By.ID, "nav-dashboard").is_displayed()
    assert driver.find_element(By.ID, "nav-income").is_displayed()
    assert driver.find_element(By.ID, "nav-expense").is_displayed()

# 4. INCOME MODULE
def tc_13_income_add(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "income")
    driver.find_element(By.ID, "inc-amount").send_keys("1000")
    driver.find_element(By.ID, "inc-desc").send_keys("Freelance coding")
    driver.find_element(By.ID, "inc-submit").click()
    time.sleep(0.5)
    rows = driver.find_elements(By.XPATH, "//table[@id='income-table']/tbody/tr")
    assert len(rows) > 0, "No rows found in income table after adding"

def tc_14_income_validation(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "income")
    driver.find_element(By.ID, "inc-amount").send_keys("500")
    driver.find_element(By.ID, "inc-desc").clear()
    driver.find_element(By.ID, "inc-submit").click()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    assert "Description cannot be blank" in alert.text, f"Unexpected alert text: {alert.text}"
    alert.accept()

def tc_15_income_delete(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "income")
    initial_rows = len(driver.find_elements(By.XPATH, "//table[@id='income-table']/tbody/tr"))
    driver.find_element(By.XPATH, "//table[@id='income-table']/tbody/tr[1]//button").click()
    time.sleep(0.5)
    new_rows = len(driver.find_elements(By.XPATH, "//table[@id='income-table']/tbody/tr"))
    assert new_rows == initial_rows - 1, "Income row count was not reduced by 1"

# 5. EXPENSE MODULE
def tc_16_expense_add(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "expense")
    driver.find_element(By.ID, "exp-amount").send_keys("150")
    driver.find_element(By.ID, "exp-desc").send_keys("Restaurant bill")
    driver.find_element(By.ID, "exp-submit").click()
    time.sleep(0.5)
    rows = driver.find_elements(By.XPATH, "//table[@id='expense-table']/tbody/tr")
    assert len(rows) > 0, "No rows found in expense table after adding"

def tc_17_expense_category(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "expense")
    driver.find_element(By.ID, "exp-category").send_keys("Entertainment")
    driver.find_element(By.ID, "exp-amount").send_keys("50")
    driver.find_element(By.ID, "exp-desc").send_keys("Cinema Ticket")
    driver.find_element(By.ID, "exp-submit").click()
    time.sleep(0.5)
    cells = driver.find_elements(By.XPATH, "//table[@id='expense-table']/tbody/tr/td")
    categories = [c.text for c in cells[::4]]
    assert "Entertainment" in categories, "Entertainment category not found in expense records"

def tc_18_expense_delete(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "expense")
    initial_rows = len(driver.find_elements(By.XPATH, "//table[@id='expense-table']/tbody/tr"))
    driver.find_element(By.XPATH, "//table[@id='expense-table']/tbody/tr[1]//button").click()
    time.sleep(0.5)
    new_rows = len(driver.find_elements(By.XPATH, "//table[@id='expense-table']/tbody/tr"))
    assert new_rows == initial_rows - 1, "Expense row count was not reduced by 1"

# 6. BUDGET MODULE
def tc_19_budget_set(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "budget")
    driver.find_element(By.ID, "bud-amount").send_keys("400")
    driver.find_element(By.ID, "bud-category").send_keys("Food")
    driver.find_element(By.ID, "bud-submit").click()
    time.sleep(0.5)
    bars = driver.find_elements(By.CLASS_NAME, "budget-card")
    assert len(bars) > 0, "Budget tracking cards are empty"

def tc_20_budget_warning(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "budget")
    driver.find_element(By.ID, "bud-amount").send_keys("100")
    driver.find_element(By.ID, "bud-category").send_keys("Entertainment")
    driver.find_element(By.ID, "bud-submit").click()
    time.sleep(0.5)
    
    switch_tab_if_needed(driver, "expense")
    driver.find_element(By.ID, "exp-category").send_keys("Entertainment")
    driver.find_element(By.ID, "exp-amount").send_keys("150")
    driver.find_element(By.ID, "exp-desc").send_keys("Concert ticket")
    driver.find_element(By.ID, "exp-submit").click()
    time.sleep(0.5)
    
    switch_tab_if_needed(driver, "budget")
    warnings = driver.find_elements(By.XPATH, "//*[contains(text(), 'Budget Exceeded')]")
    assert len(warnings) > 0, "Budget exceed warning indicator missing in UI"

def tc_21_budget_clear(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "budget")
    driver.find_element(By.ID, "clear-budget-btn").click()
    time.sleep(0.5)
    bars = driver.find_elements(By.CLASS_NAME, "budget-card")
    assert len(bars) == 0, "Budget list not cleared"

# 7. REPORTS MODULE
def tc_22_reports_filter(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "reports")
    driver.find_element(By.ID, "rep-filter-category").send_keys("Salary")
    time.sleep(0.5)
    cells = driver.find_elements(By.XPATH, "//table[@id='reports-table']/tbody/tr/td")
    categories = [c.text for c in cells[1::4]]
    for c in categories:
        assert c == "Salary", f"Found non-Salary entry: {c}"

def tc_23_reports_toggle(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "reports")
    driver.find_element(By.ID, "rep-filter-category").send_keys("All Categories")
    time.sleep(0.5)
    rows = driver.find_elements(By.XPATH, "//table[@id='reports-table']/tbody/tr")
    assert len(rows) > 0, "All transaction records is empty"

def tc_24_reports_export(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "reports")
    driver.find_element(By.ID, "rep-export-btn").click()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    assert "triggered" in alert.text, f"Unexpected export message: {alert.text}"
    alert.accept()

# 8. PROFILE MODULE
def tc_25_profile_view(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "profile")
    name = driver.find_element(By.ID, "prof-name").get_attribute("value")
    assert len(name) > 0, "Profile name is blank"

def tc_26_profile_update(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "profile")
    input_name = driver.find_element(By.ID, "prof-name")
    input_name.clear()
    input_name.send_keys("Naveen CN")
    driver.find_element(By.ID, "prof-submit").click()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    assert "updated successfully" in alert.text
    alert.accept()
    time.sleep(0.5)
    assert driver.find_element(By.ID, "header-user-name").text == "Naveen CN"

def tc_27_profile_currency(driver, test_id):
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "profile")
    driver.find_element(By.ID, "prof-currency").send_keys("INR")
    driver.find_element(By.ID, "prof-submit").click()
    time.sleep(0.5)
    alert = driver.switch_to.alert
    alert.accept()
    switch_tab_if_needed(driver, "dashboard")
    bal = driver.find_element(By.ID, "net-balance").text
    assert "₹" in bal, f"Expected INR symbol in balance card, got {bal}"

# 9. LOGOUT MODULE
def tc_28_logout(driver, test_id):
    ensure_logged_in(driver)
    driver.find_element(By.ID, "nav-logout").click()
    time.sleep(0.5)
    assert driver.find_element(By.ID, "login-section").is_displayed(), "Not navigated back to login screen"

# 10. INTENTIONAL FAILURES MODULE
def tc_29_fail_token(driver, test_id):
    """Fails Intentionally: Verify Security Token Signature"""
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "profile")
    badge = driver.find_element(By.ID, "security-token-status")
    # This assertion will fail because badge.text is actually "PASS"
    assert badge.text == "FAIL", f"[INTENTIONAL FAILURE] Expected security badge to read FAIL, but it is {badge.text}"

def tc_30_fail_sync(driver, test_id):
    """Fails Intentionally: Verify Cloud Sync Connection"""
    ensure_logged_in(driver)
    switch_tab_if_needed(driver, "profile")
    badge = driver.find_element(By.ID, "cloud-sync-status")
    # This assertion will fail because badge.text is actually "FAIL"
    assert badge.text == "PASS", f"[INTENTIONAL FAILURE] Expected sync badge to read PASS, but it is {badge.text}"


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
        
        excel_report.add_log(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Setup", "Navigate to Personal Finance SPA", "SUCCESS", f"URL: {BASE_URL}")
        
        # Execute 30 test cases
        run_test_case(driver, "TC_01", "Login", "Validate login screen with empty input fields", tc_01_login_empty)
        run_test_case(driver, "TC_02", "Login", "Validate login error feedback with invalid username/password", tc_02_login_invalid)
        run_test_case(driver, "TC_03", "Login", "Validate successful authentication and view redirection", tc_03_login_success)
        run_test_case(driver, "TC_04", "Login", "Validate login password text visibility toggling", tc_04_login_toggle_pwd)
        
        run_test_case(driver, "TC_05", "Registration", "Validate registration input fields empty state checks", tc_05_register_empty)
        run_test_case(driver, "TC_06", "Registration", "Validate confirmation password match constraint checking", tc_06_register_mismatch)
        run_test_case(driver, "TC_07", "Registration", "Validate validation rule for minimum password length check", tc_07_register_pwd_length)
        run_test_case(driver, "TC_08", "Registration", "Validate registration success and screen redirect to Login", tc_08_register_success)
        
        run_test_case(driver, "TC_09", "Dashboard", "Validate dashboard net balances are loaded", tc_09_dashboard_balance)
        run_test_case(driver, "TC_10", "Dashboard", "Validate SVG asset charts display on layout", tc_10_dashboard_chart)
        run_test_case(driver, "TC_11", "Dashboard", "Validate recent transactional records display", tc_11_dashboard_tx_list)
        run_test_case(driver, "TC_12", "Dashboard", "Validate primary menu navigation links rendering", tc_12_dashboard_nav_items)
        
        run_test_case(driver, "TC_13", "Income", "Validate adding new income entries increases balance", tc_13_income_add)
        run_test_case(driver, "TC_14", "Income", "Validate description empty inputs validation constraints", tc_14_income_validation)
        run_test_case(driver, "TC_15", "Income", "Validate delete button updates income sources logs", tc_15_income_delete)
        
        run_test_case(driver, "TC_16", "Expense", "Validate registering new expense distributions logs", tc_16_expense_add)
        run_test_case(driver, "TC_17", "Expense", "Validate dynamic category selection and records insertion", tc_17_expense_category)
        run_test_case(driver, "TC_18", "Expense", "Validate deleting items updates expense list data", tc_18_expense_delete)
        
        run_test_case(driver, "TC_19", "Budget", "Validate setting limit threshold sets tracking panel", tc_19_budget_set)
        run_test_case(driver, "TC_20", "Budget", "Validate exceeding limit raises budget exceed warnings", tc_20_budget_warning)
        run_test_case(driver, "TC_21", "Budget", "Validate resetting limits clears current tracking bars", tc_21_budget_clear)
        
        run_test_case(driver, "TC_22", "Reports", "Validate sorting compiled transactions log by categories", tc_22_reports_filter)
        run_test_case(driver, "TC_23", "Reports", "Validate showing all compiled listings logs", tc_23_reports_toggle)
        run_test_case(driver, "TC_24", "Reports", "Validate triggering report export as CSV data", tc_24_reports_export)
        
        run_test_case(driver, "TC_25", "Profile", "Validate profile information displays display name", tc_25_profile_view)
        run_test_case(driver, "TC_26", "Profile", "Validate updating profile name changes avatar elements", tc_26_profile_update)
        run_test_case(driver, "TC_27", "Profile", "Validate currency updates modify dashboard balance indicators", tc_27_profile_currency)
        
        run_test_case(driver, "TC_28", "Logout", "Validate logout updates active session and displays login", tc_28_logout)
        
        run_test_case(driver, "TC_29", "Security Check", "Validate system authentication token signature status", tc_29_fail_token)
        run_test_case(driver, "TC_30", "Cloud Sync", "Validate automatic encrypted background cloud sync", tc_30_fail_sync)

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
        
        # Check if any tests failed (other than the 2 intentional failures)
        failed_tests = [t for t in excel_report.tests if t['status'].lower() == 'failed']
        failed_count = len(failed_tests)
        
        # Check if the failures match the expected intentional failure count of 2
        # Since we intentionally failed exactly TC_29 and TC_30, failed_count should be 2.
        # If it is exactly 2, we can exit with status 0 or 1. Let's make sure the script exits with 1 if there's any failure (normal E2E failure),
        # but wait, in GitHub Actions, exiting with 1 marks the workflow as failed. Let's exit with 1 because tests did fail (as requested).
        # We will exit with 1 if failed_count > 0, which is standard.
        if failed_count > 0:
            print(f"\n[-] {failed_count} tests failed. (TC_29 and TC_30 are expected intentional failures).")
            # If the only failures are TC_29 and TC_30, this is expected behavior.
            # Let's print out the failed tests for debugging
            for ft in failed_tests:
                print(f"  - {ft['id']} ({ft['scenario']}): {ft['failure_reason']}")
            sys.exit(1)
        else:
            print("\n[+] All tests completed successfully.")
            sys.exit(0)

if __name__ == "__main__":
    run_tests()
