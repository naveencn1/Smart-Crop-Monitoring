# Smart Crop Monitoring & Disease Detection System

This directory consolidates the frontend static app, backend Flask API, SQLite database, and automated browser testing suite in a single location.

---

## 📂 Project Structure

```text
smart-crop-monitoring-system/
├── frontend/             # Static web application (HTML/JS/CSS)
│   ├── css/              # Custom design sheets (style.css)
│   ├── js/               # Client-side router, state & localization (app.js, translations.js)
│   ├── assets/           # Sample leaves, drone footage & hero farm images
│   └── index.html        # Main farmer dashboard structure
│
├── backend/              # Python Flask REST API server
│   ├── app.py            # API routing, image scan logic & SQLite models
│   ├── crop_monitoring.db# SQLite Database storing farmer profiles, metrics & histories
│   └── requirements.txt  # Python server packages dependencies
│
└── tests/                # Automated validation suites
    ├── verify_api.py     # Endpoint HTTP checks script
    └── test_e2e.py       # Headless Selenium automated browser test suite
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Launch the SQLite Flask Backend Server
The server stores sensor telemetry, diagnostic history logs, and profile records in SQLite.

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the API server:
   ```bash
   python app.py
   ```
   *The server runs locally at `http://127.0.0.1:5000`.*

### 2. Start the Frontend Dashboard App
The frontend is a lightweight Single Page Application (SPA). It uses an **Automatic Failover Bridge** to fetch server data when connected, and falls back to offline simulations when the server is stopped.

1. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Start a simple local server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser:
   👉 **[http://localhost:8000](http://localhost:8000)**

---

## 🧪 Running Automated E2E Tests

Ensure both the backend server (port 5000) and frontend server (port 8000) are active, then run the tests.

1. Navigate to the `tests/` folder:
   ```bash
   cd tests
   ```
2. Install Selenium testing dependencies:
   ```bash
   pip install selenium webdriver-manager
   ```
3. Execute the automated tests:
   ```bash
   python test_e2e.py
   ```
   *The Selenium script runs Chrome in headless mode, performing sidebar routing, Leaf scan checks, sensor graphics verification, chatbot interactions, localization switching, and form updates.*
