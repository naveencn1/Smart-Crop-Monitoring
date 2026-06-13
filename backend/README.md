# Smart Crop Monitoring & Disease Detection - Deployment Guide

This project is partitioned into a decoupled **Frontend** static web application and a **Backend** Python REST API server.

---

## 🛠️ Requirements & Setup

Ensure you have **Python 3.x** installed on your system.

### 1. Launch the Backend Server
The backend is built with Python Flask and provides REST endpoints for telemetry, AI leaf scanning, profile saving, alerts, and the chatbot.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies listed in `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
3. Launch the API server:
   ```bash
   python app.py
   ```
   *The server runs locally at `http://127.0.0.1:5000`.*

### 2. Launch the Frontend
The frontend is a lightweight Single Page Application (SPA).

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Run a simple local HTTP server (using Python):
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   👉 **[http://localhost:8000](http://localhost:8000)**

---

## 🔗 How it Connects (Automatic Failover Bridge)

*   **API-Mode:** When the Flask server at `http://localhost:5000` is active, the frontend automatically establishes a connection. Sensor metrics, chatbot answers, crop diagnoses, alerts, and profile updates will be fetched/saved dynamically via the server.
*   **Simulation-Mode:** If the backend is offline, the frontend console prints `[API] Backend offline. Running on local mock cache.`. The frontend automatically falls back to its internal real-time IoT and crop diagnostics simulations, remaining fully interactive and testable.
