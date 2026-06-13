import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def test_endpoint(name, url, method="GET", json_data=None, form_data=None):
    try:
        if method == "GET":
            r = requests.get(url, timeout=3)
        elif method == "POST":
            if json_data:
                r = requests.post(url, json=json_data, timeout=3)
            elif form_data:
                r = requests.post(url, data=form_data, timeout=3)
            else:
                r = requests.post(url, timeout=3)
        elif method == "DELETE":
            r = requests.delete(url, timeout=3)
        else:
            print(f"[-] Unknown method {method}")
            return False

        if r.status_code in [200, 201]:
            print(f"[+] {name}: PASSED (HTTP {r.status_code})")
            return True
        else:
            print(f"[-] {name}: FAILED (HTTP {r.status_code}) -> {r.text}")
            return False
    except Exception as e:
        print(f"[-] {name}: ERROR -> {e}")
        return False

def main():
    print("==================================================")
    print("Pinging Smart Crop Monitoring & Disease Detection API...")
    print("==================================================")
    
    # 1. Health check
    if not test_endpoint("Health Check", f"{BASE_URL}/api/health"):
        print("\nEnsure the Flask server is running on port 5000. Run: python app.py inside backend/")
        sys.exit(1)
        
    # 2. Sensors reading
    test_endpoint("Sensors Telemetry", f"{BASE_URL}/api/sensors")
    
    # 3. Farmer Profile load
    test_endpoint("Get Farmer Profile", f"{BASE_URL}/api/profile")
    
    # 4. Farmer Profile save
    profile_payload = {
        "name": "Rama Rao Test",
        "phone": "+91 99999 88888",
        "location": "Guntur",
        "crop": "tomato",
        "size": "5.0",
        "soil": "black"
    }
    test_endpoint("Update Farmer Profile", f"{BASE_URL}/api/profile", "POST", json_data=profile_payload)
    
    # 5. Alerts list
    test_endpoint("Get Alerts", f"{BASE_URL}/api/alerts")
    
    # 6. AI Diagnosis Scan
    diagnose_payload = {
        "crop": "rice",
        "lang": "en",
        "is_sample": "true"
    }
    test_endpoint("Post Leaf Diagnosis (Sample Rice)", f"{BASE_URL}/api/diagnose", "POST", form_data=diagnose_payload)
    
    # 7. Diagnostics history list
    test_endpoint("Get Diagnosis History", f"{BASE_URL}/api/diagnose/history")
    
    # 8. Chatbot interaction
    chat_payload = {
        "message": "how to treat early blight?",
        "lang": "en"
    }
    test_endpoint("Post Chatbot Query", f"{BASE_URL}/api/chatbot", "POST", json_data=chat_payload)
    
    print("==================================================")
    print("Verification Completed.")
    print("==================================================")

if __name__ == "__main__":
    main()
