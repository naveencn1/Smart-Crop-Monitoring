# -*- coding: utf-8 -*-
"""
Smart Crop Monitoring & AI Disease Detection - Backend SQLite REST Server
Framework: Flask, SQLite3
"""

import os
import json
import random
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'crop_monitoring.db')

# --- SQLite Setup & Queries Helpers ---

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Enables index by column name
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Profile Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phone TEXT,
            location TEXT,
            crop TEXT,
            size REAL,
            soil TEXT
        )
    ''')
    
    # 2. Sensors Log Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            moisture REAL,
            temp REAL,
            humidity REAL,
            timestamp TEXT
        )
    ''')
    
    # 3. Alerts Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            type TEXT,
            text_en TEXT,
            text_te TEXT,
            timeKey TEXT,
            node TEXT,
            timestamp TEXT
        )
    ''')
    
    # 4. Diagnostics History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diagnostics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            crop TEXT,
            disease TEXT,
            confidence INTEGER,
            treatment TEXT
        )
    ''')
    
    # Seed Initial Data if blank
    cursor.execute('SELECT COUNT(*) FROM profile')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO profile (id, name, phone, location, crop, size, soil)
            VALUES (1, 'Rama Rao', '+91 98765 43210', 'Kaza Village, Guntur', 'tomato', 4.5, 'black')
        ''')
        
    cursor.execute('SELECT COUNT(*) FROM alerts')
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO alerts (id, type, text_en, text_te, timeKey, node, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', [
            ('alert-1', 'critical', 'Zone C: Rice Blast Outbreak Detected', 'జోన్ C: వరి అగ్గి తెగులు వ్యాప్తి కనుగొనబడింది', 'alertTimeJustNow', 'Edge AI Engine', datetime.now().isoformat()),
            ('alert-2', 'warning', 'Zone A: Soil Moisture Critical (28%)', 'జోన్ A: నేల తేమ లోపం తక్కువగా ఉంది (28%)', 'alertTime10m', 'IoT Sensor Node 4', datetime.now().isoformat()),
            ('alert-3', 'info', 'Drone flight patrol completed successfully. No thermal anomalies.', 'డ్రోన్ విమాన రౌండ్ విజయవంతంగా పూర్తయింది. ఎలాంటి మార్పులు లేవు.', 'alertTime1h', 'Drone Patroller A', datetime.now().isoformat())
        ])
        
    conn.commit()
    conn.close()
    print('[Database] SQLite initialized successfully.')

# Initialize on startup
init_db()

# --- API Endpoints ---

# Health Check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "SmartCrop AI SQLite Backend"}), 200

# IoT Sensors [GET] - Generates a reading, stores it in DB, and returns it
@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    moisture = random.uniform(34.0, 52.0)
    temp = random.uniform(25.5, 34.0)
    humidity = random.uniform(55.0, 75.0)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Store in database log
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sensors (moisture, temp, humidity, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (round(moisture, 1), round(temp, 1), round(humidity, 1), now_str))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Database Error] Sensor logging failed: {e}")
    
    return jsonify({
        "moisture": round(moisture, 1),
        "temp": round(temp, 1),
        "humidity": round(humidity, 1),
        "timestamp": now_str
    }), 200

# Farm Profile [GET / POST]
@app.route('/api/profile', methods=['GET', 'POST'])
def profile_handler():
    if request.method == 'GET':
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM profile WHERE id = 1').fetchone()
        conn.close()
        
        if row:
            return jsonify({
                "name": row["name"],
                "phone": row["phone"],
                "location": row["location"],
                "crop": row["crop"],
                "size": str(row["size"]),
                "soil": row["soil"]
            }), 200
        return jsonify({"status": "error", "message": "Profile not found."}), 404
        
    elif request.method == 'POST':
        data = request.json
        if data:
            try:
                conn = get_db_connection()
                conn.execute('''
                    UPDATE profile 
                    SET name = ?, phone = ?, location = ?, crop = ?, size = ?, soil = ?
                    WHERE id = 1
                ''', (data.get("name"), data.get("phone"), data.get("location"), data.get("crop"), float(data.get("size", 0)), data.get("soil")))
                conn.commit()
                conn.close()
                return jsonify({"status": "success", "message": "Profile updated in SQLite."}), 200
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 500
        return jsonify({"status": "error", "message": "Invalid payload."}), 400

# Alerts Center [GET / POST / DELETE]
@app.route('/api/alerts', methods=['GET', 'POST', 'DELETE'])
def alerts_handler():
    if request.method == 'GET':
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM alerts ORDER BY timestamp DESC').fetchall()
        conn.close()
        
        alerts = []
        for r in rows:
            alerts.append({
                "id": r["id"],
                "type": r["type"],
                "text_en": r["text_en"],
                "text_te": r["text_te"],
                "timeKey": r["timeKey"],
                "node": r["node"]
            })
        return jsonify(alerts), 200
        
    elif request.method == 'POST':
        data = request.json
        if data:
            alert_id = "alert-moisture-" + str(int(random.random() * 100000))
            try:
                conn = get_db_connection()
                conn.execute('''
                    INSERT INTO alerts (id, type, text_en, text_te, timeKey, node, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert_id,
                    data.get("type", "warning"),
                    data.get("text_en", "Low Moisture alert"),
                    data.get("text_te", "నేల తేమ అలర్ట్"),
                    "alertTimeJustNow",
                    data.get("node", "IoT Node"),
                    datetime.now().isoformat()
                ))
                conn.commit()
                conn.close()
                return jsonify({"id": alert_id, "status": "created"}), 201
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)}), 500
        return jsonify({"status": "error"}), 400
        
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            conn.execute('DELETE FROM alerts')
            conn.commit()
            conn.close()
            return jsonify({"status": "success", "message": "All alerts cleared."}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def delete_single_alert(alert_id):
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM alerts WHERE id = ?', (alert_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Alert {alert_id} deleted."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Leaf AI Diagnostics [POST]
@app.route('/api/diagnose', methods=['POST'])
def diagnose_leaf():
    crop = request.form.get('crop', 'tomato')
    lang = request.form.get('lang', 'en')
    is_sample = request.form.get('is_sample', 'false') == 'true'
    
    # Core agricultural diseases mapping
    disease_dict = {
        "en": {
            "rice_blast": "Rice Blast (Magnaporthe oryzae)",
            "rice_blast_t": "Avoid excessive nitrogen fertilizers. Drain the field temporarily to reduce humidity. Apply tricyclazole or copper-based fungicide to infected areas.",
            "tomato_blight": "Early Blight (Alternaria solani)",
            "tomato_blight_t": "Prune lower infected leaves to improve airflow. Water the base of the plant, not the leaves, to reduce wetness. Apply organic copper-octanoate spray.",
            "wheat_rust": "Leaf Rust (Puccinia recondita)",
            "wheat_rust_t": "Plant rust-resistant crop varieties next season. Apply sulfur-based organic dust or systemic triazole fungicides immediately to limit spore dispersal.",
            "healthy": "Healthy Crop Leaf",
            "healthy_t": "No disease detected. Continue normal irrigation and crop nutrition schedules. Monitor soil moisture closely."
        },
        "te": {
            "rice_blast": "వరి అగ్గి తెగులు (రైస్ బ్లాస్ట్)",
            "rice_blast_t": "నత్రజని ఎరువుల వినియోగాన్ని తగ్గించండి. పొలంలో నీటిని తాత్కాలికంగా తీసివేసి గాలి ఆడేలా చేయండి. తీవ్రత 10% మించితే ట్రైసైక్లాజోల్ పిచికారీ చేయండి.",
            "tomato_blight": "టమోటా ముందస్తు తెగులు (ఎర్లీ బ్లైట్)",
            "tomato_blight_t": "గాలి బాగా తగలడానికి కింద పడిపోయిన రోగగ్రస్త ఆకులను కత్తిరించండి. నీటిని మొదట్లో పోయండి. ప్రతి 7 రోజులకు ఒకసారి కాపర్ స్ప్రే చేయండి.",
            "wheat_rust": "గోధుమ ఆకు తుప్పు తెగులు (లీఫ్ రస్ట్)",
            "wheat_rust_t": "తదుపరి పంట కాలంలో తెగుళ్లను తట్టుకునే రకాలను నాటండి. స్పోర్స్ వ్యాప్తిని అరికట్టడానికి సల్ఫర్ శిలీంద్ర నాశనిని వెంటనే పిచికారీ చేయండి.",
            "healthy": "ఆరోగ్యకరమైన పంట ఆకు",
            "healthy_t": "ఎటువంటి తెగులు కనుగొనబడలేదు. సాధారణ నీటి పారుదల మరియు పోషకాలను కొనసాగించండి. నేల తేమను పర్యవేక్షించండి."
        }
    }
    
    t = disease_dict.get(lang, disease_dict["en"])
    
    if is_sample:
        if crop == 'rice':
            disease = t["rice_blast"]
            treatment = t["rice_blast_t"]
            bbox = { "top": 35, "left": 55, "width": 130, "height": 90, "label": "Rice Blast" if lang == 'en' else "వరి అగ్గి" }
        elif crop == 'wheat':
            disease = t["wheat_rust"]
            treatment = t["wheat_rust_t"]
            bbox = { "top": 25, "left": 45, "width": 110, "height": 100, "label": "Rust Spots" if lang == 'en' else "తుప్పు మచ్చలు" }
        else:
            disease = t["tomato_blight"]
            treatment = t["tomato_blight_t"]
            bbox = { "top": 40, "left": 35, "width": 150, "height": 85, "label": "Blight Lesions" if lang == 'en' else "ఎర్లీ బ్లైట్" }
    else:
        roll = random.random()
        if roll < 0.20:
            disease = t["healthy"]
            treatment = t["healthy_t"]
            bbox = None
        elif roll < 0.50:
            disease = t["rice_blast"]
            treatment = t["rice_blast_t"]
            bbox = { "top": 40, "left": 50, "width": 110, "height": 100, "label": "Lesion" }
        elif roll < 0.80:
            disease = t["tomato_blight"]
            treatment = t["tomato_blight_t"]
            bbox = { "top": 35, "left": 30, "width": 160, "height": 90, "label": "Infected Zone" }
        else:
            disease = t["wheat_rust"]
            treatment = t["wheat_rust_t"]
            bbox = { "top": 30, "left": 45, "width": 120, "height": 120, "label": "Fungal Spores" }

    confidence = random.randint(86, 98)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Save to SQLite database table
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO diagnostics (timestamp, crop, disease, confidence, treatment)
            VALUES (?, ?, ?, ?, ?)
        ''', (now_str, crop.capitalize(), disease.split('(')[0].strip() if '(' in disease else disease, confidence, treatment))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Database Error] Diagnostics save failed: {e}")

    return jsonify({
        "disease": disease,
        "confidence": confidence,
        "treatment": treatment,
        "bbox": bbox
    }), 200

# Diagnostics History [GET / DELETE]
@app.route('/api/diagnose/history', methods=['GET', 'DELETE'])
def diagnostics_history():
    if request.method == 'GET':
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM diagnostics ORDER BY id DESC').fetchall()
        conn.close()
        
        history = []
        for r in rows:
            history.append({
                "timestamp": r["timestamp"],
                "crop": r["crop"],
                "disease": r["disease"],
                "confidence": r["confidence"],
                "treatment": r["treatment"]
            })
        return jsonify(history), 200
        
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            conn.execute('DELETE FROM diagnostics')
            conn.commit()
            conn.close()
            return jsonify({"status": "success", "message": "Diagnostics history cleared."}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

# Chatbot Response API [POST]
@app.route('/api/chatbot', methods=['POST'])
def chatbot_reply():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"reply": "Invalid request."}), 400
        
    message = data.get('message', '').lower()
    lang = data.get('lang', 'en')
    
    bot_responses = {
        "en": {
            "blast": "Rice Blast is caused by fungus. Avoid high nitrogen applications, spray Tricyclazole 75% WP, and keep the field clean.",
            "blight": "Early Blight of tomato can be treated by pruning infected lower leaves and spraying a copper fungicide or organic Neem extract.",
            "rust": "Wheat Rust is highly infectious. Apply propiconazole or tebuconazole immediately and plant resistant seeds next cycle.",
            "moisture": "Standard cereal crops like rice prefer saturated soils. Vegetables prefer a moisture level between 40% and 60%. Try to irrigate in the early morning.",
            "default": "I am analyzing that. To prevent crop yield losses, maintain soil moisture above 40%. Upload a leaf photograph in the 'Disease Detection' tab for diagnosis."
        },
        "te": {
            "blast": "వరి అగ్గి తెగులు శిలీంద్రం వల్ల వస్తుంది. నత్రజని అధికంగా వాడొద్దు, ట్రైసైక్లాజోల్ 75% WP పిచికారీ చేయండి, పొలాన్ని శుభ్రంగా ఉంచండి.",
            "blight": "టమోటా ఎర్లీ బ్లైట్ నివారణకు కింద ఉన్న రోగగ్రస్త ఆకులను కత్తిరించి, రాగి శిలీంద్ర నాశని లేదా వేప నూనెను పిచికారీ చేయండి.",
            "rust": "గోధుమ ఆకు తుప్పు చాలా త్వరగా వ్యాపిస్తుంది. ప్రొపికోనాజోల్ లేదా టెబుకోనాజోల్ వెంటనే పిచికారీ చేసి, తదుపరి సారి తెగులు తట్టుకునే విత్తనాలు వాడండి.",
            "moisture": "వరి పంట నిండుగా నీరు ఉండడానికి ఇష్టపడుతుంది. కూరగాయలకు 40% నుండి 60% తేమ అవసరం. ఉదయాన్నే నీరు పెట్టడానికి ప్రయత్నించండి.",
            "default": "నేను విశ్లేషిస్తున్నాను. మంచి దిగుబడి కోసం పంట నేల తేమను 40% పైన ఉంచండి. తెగుళ్ళ గుర్తింపు కోసం 'తెగుళ్ల గుర్తింపు' ట్యాబ్‌లో ఆకును స్కాన్ చేయండి."
        }
    }
    
    r = bot_responses.get(lang, bot_responses["en"])
    
    if "blast" in message or "వరి" in message or "అగ్గి" in message:
        reply = r["blast"]
    elif "blight" in message or "టమోటా" in message or "బ్లైట్" in message:
        reply = r["blight"]
    elif "rust" in message or "తుప్పు" in message or "గోధుమ" in message:
        reply = r["rust"]
    elif "moisture" in message or "తేమ" in message or "నీరు" in message or "water" in message:
        reply = r["moisture"]
    else:
        reply = r["default"]
        
    return jsonify({"reply": reply}), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)  # nosec B201

