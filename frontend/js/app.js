/* ==========================================================================
   Smart Crop Monitoring & Disease Detection - Application Logic (app.js)
   ========================================================================== */

// --- Global Application State ---
const state = {
  backendBaseUrl: 'http://127.0.0.1:5000',
  isOnline: false,
  currentLanguage: localStorage.getItem('smartcrop_lang') || 'en',
  activeView: 'home',
  profile: {
    name: 'Rama Rao',
    phone: '+91 98765 43210',
    location: 'Kaza Village, Guntur',
    crop: 'tomato',
    size: '4.5',
    soil: 'black'
  },
  sensorHistory: {
    moisture: [45, 48, 50, 47, 44, 41, 38, 35, 34, 38, 41, 42],
    temp: [26, 27, 28, 29, 31, 32, 33, 32, 30, 29, 29, 29.4],
    humidity: [72, 70, 68, 65, 62, 60, 58, 60, 63, 66, 67, 68]
  },
  alerts: [
    { id: 'alert-1', type: 'critical', textKey: 'alertCritical1', timeKey: 'alertTimeJustNow', node: 'Edge AI Engine' },
    { id: 'alert-2', type: 'warning', textKey: 'alertCritical2', timeKey: 'alertTime10m', node: 'IoT Sensor Node 4' },
    { id: 'alert-3', type: 'info', textKey: 'alertInfo1', timeKey: 'alertTime1h', node: 'Drone Patroller A' }
  ],
  diagnosticHistory: JSON.parse(localStorage.getItem('smartcrop_diagnostics')) || [
    { timestamp: '2026-06-10 14:32', crop: 'Tomato', disease: 'Early Blight (Alternaria solani)', confidence: 94, treatment: 'Apply organic copper-octanoate spray.' },
    { timestamp: '2026-06-08 09:15', crop: 'Rice', disease: 'Rice Blast (వరి అగ్గి తెగులు)', confidence: 89, treatment: 'Drain field, spray Tricyclazole.' }
  ]
};

// Map Alert text keys to translations dynamically
const alertTextMap = {
  alertCritical1: { en: "Zone C: Rice Blast Outbreak Detected", te: "జోన్ C: వరి అగ్గి తెగులు వ్యాప్తి కనుగొనబడింది" },
  alertCritical2: { en: "Zone A: Soil Moisture Critical (28%)", te: "జోన్ A: నేల తేమ లోపం తక్కువగా ఉంది (28%)" },
  alertInfo1: { en: "Drone flight patrol completed successfully. No thermal anomalies.", te: "డ్రోన్ విమాన రౌండ్ విజయవంతంగా పూర్తయింది. ఎలాంటి మార్పులు లేవు." }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Check Login Status first
  const loggedIn = localStorage.getItem('smartcrop_logged_in') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.querySelector('.app-container');
  if (loggedIn) {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
  } else {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
  }

  // Load saved profile if exists
  const savedProfile = localStorage.getItem('smartcrop_profile');
  if (savedProfile) {
    state.profile = JSON.parse(savedProfile);
  }

  // Bind routing navigation
  setupNavigation();
  
  // Set profile form values
  populateProfileForm();
  
  // Render Scan History Table
  renderHistoryTable();

  // Initialize Language
  setLanguage(state.currentLanguage);

  // Setup Image upload / AI Scanning drag & drop
  setupImageDiagnostics();

  // Setup Drone Video Feeds
  setupDroneMonitor();

  // Setup Chatbot Interaction & Voice Simulation
  setupChatbot();

  // Initialize connection state UI
  updateConnectionStatusUI();
  
  // Check backend status immediately and set periodic check
  checkBackendStatus();
  setInterval(checkBackendStatus, 5000);

  // Start real-time simulation loops
  startSensorSimulation();
  startTimeClock();

  // Setup Notifications Bell interaction
  setupNotificationsBell();

  // Render initial SVG chart
  renderSvgCharts();

  // Re-run lucide icons to capture dynamically generated elements
  lucide.createIcons();
});

// --- API Connection & Backend Integration Functions ---
async function checkBackendStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${state.backendBaseUrl}/api/health`, { 
      method: 'GET',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'healthy') {
        if (!state.isOnline) {
          state.isOnline = true;
          updateConnectionStatusUI();
          showToast(
            state.currentLanguage === 'en' ? 'Connected to Edge API' : 'ఎడ్జ్ API అనుసంధానించబడింది',
            state.currentLanguage === 'en' ? 'Synchronizing farm telemetry and SQLite database.' : 'పంట వివరాలు మరియు SQLite డేటాబేస్ సింక్ అవుతోంది.',
            'info'
          );
          await syncWithBackend();
        }
        return true;
      }
    }
  } catch (err) {
    // catch block handles connection issues silently
  }
  
  if (state.isOnline) {
    state.isOnline = false;
    updateConnectionStatusUI();
    showToast(
      state.currentLanguage === 'en' ? 'Edge Server Disconnected' : 'ఎడ్జ్ సర్వర్ డిస్‌కనెక్ట్ అయింది',
      state.currentLanguage === 'en' ? 'Falling back to offline simulation mode.' : 'ఆఫ్‌లైన్ మోడ్‌లోకి మార్చబడింది.',
      'warning'
    );
  }
  return false;
}

function updateConnectionStatusUI() {
  const dot = document.getElementById('api-status-dot');
  const text = document.getElementById('api-status-text');
  const badge = document.getElementById('api-status-badge');
  const t = window.translations[state.currentLanguage];
  
  if (!dot || !text || !badge) return;
  
  if (state.isOnline) {
    dot.className = 'status-indicator-dot online';
    text.textContent = t.apiOnline || 'Online Mode';
    badge.classList.add('online-badge');
  } else {
    dot.className = 'status-indicator-dot offline';
    text.textContent = t.apiOffline || 'Offline Mode';
    badge.classList.remove('online-badge');
  }
}

async function syncWithBackend() {
  await loadBackendProfile();
  await loadBackendDiagnostics();
  await loadBackendAlerts();
  updateAdvisoryBox();
  renderHistoryTable();
  renderAlertsList();
  renderSvgCharts();
}

async function loadBackendProfile() {
  try {
    const res = await fetch(`${state.backendBaseUrl}/api/profile`);
    if (res.ok) {
      const data = await res.json();
      state.profile = data;
      populateProfileForm();
    }
  } catch (e) {
    console.error("Failed to load profile from backend:", e);
  }
}

async function loadBackendDiagnostics() {
  try {
    const res = await fetch(`${state.backendBaseUrl}/api/diagnose/history`);
    if (res.ok) {
      const data = await res.json();
      state.diagnosticHistory = data.map(item => ({
        timestamp: item.timestamp,
        crop: item.crop,
        disease: item.disease,
        confidence: item.confidence,
        treatment: item.treatment
      }));
      renderHistoryTable();
    }
  } catch (e) {
    console.error("Failed to load diagnostics from backend:", e);
  }
}

async function loadBackendAlerts() {
  try {
    const res = await fetch(`${state.backendBaseUrl}/api/alerts`);
    if (res.ok) {
      const data = await res.json();
      state.alerts = data.map(item => {
        alertTextMap[item.id] = {
          en: item.text_en,
          te: item.text_te
        };
        return {
          id: item.id,
          type: item.type,
          textKey: item.id,
          timeKey: item.timeKey,
          node: item.node
        };
      });
      renderAlertsList();
    }
  } catch (e) {
    console.error("Failed to load alerts from backend:", e);
  }
}

// --- System Time Clock ---
function startTimeClock() {
  const timeSpan = document.getElementById('current-timestamp');
  const updateClock = () => {
    const now = new Date();
    // format to hh:mm A
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    // In Telugu, show AM/PM appropriately
    const timeStr = `${hours}:${minutes} ${ampm}`;
    timeSpan.textContent = timeStr;
  };
  
  updateClock();
  setInterval(updateClock, 1000);
}

// --- Dynamic Client-Side Router ---
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const headerTitle = document.getElementById('header-page-title');

  const switchView = (viewName) => {
    state.activeView = viewName;
    
    // Update active nav class
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update section visibility
    viewSections.forEach(section => {
      if (section.id === `${viewName}-view`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update header title based on active view language
    updateHeaderTitle(viewName);
    
    // If opening dashboard, re-render charts to fit size
    if (viewName === 'dashboard') {
      setTimeout(renderSvgCharts, 100);
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.getAttribute('data-view');
      switchView(viewName);
    });
  });

  // Get Started Hero CTA button router
  const heroCta = document.getElementById('hero-cta-btn');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      switchView('dashboard');
    });
  }

  // Global window function to navigate
  window.navigateToView = switchView;
}

function updateHeaderTitle(viewName) {
  const headerTitle = document.getElementById('header-page-title');
  const t = window.translations[state.currentLanguage];
  
  switch (viewName) {
    case 'home':
      headerTitle.textContent = t.navHome;
      break;
    case 'dashboard':
      headerTitle.textContent = t.navDashboard;
      break;
    case 'detection':
      headerTitle.textContent = t.navDetection;
      break;
    case 'drone':
      headerTitle.textContent = t.navDrone;
      break;
    case 'alerts':
      headerTitle.textContent = t.navAlerts;
      break;
    case 'profile':
      headerTitle.textContent = t.navProfile;
      break;
    default:
      headerTitle.textContent = "SmartCrop AI";
  }
}

// --- Multi-Language Framework ---
function setLanguage(lang) {
  state.currentLanguage = lang;
  localStorage.setItem('smartcrop_lang', lang);

  // Apply translations to elements with data-i18n
  const translatables = document.querySelectorAll('[data-i18n]');
  translatables.forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (window.translations[lang] && window.translations[lang][key]) {
      elem.textContent = window.translations[lang][key];
    }
  });

  // Translate placeholders
  const placeholdables = document.querySelectorAll('[data-i18n-placeholder]');
  placeholdables.forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (window.translations[lang] && window.translations[lang][key]) {
      elem.setAttribute('placeholder', window.translations[lang][key]);
    }
  });

  // Toggle button texts representation
  const langDesktop = document.getElementById('lang-btn-desktop');
  const langMobile = document.getElementById('lang-btn-mobile');
  
  const oppositeText = lang === 'en' ? 'తెలుగు' : 'English';
  
  if (langDesktop) langDesktop.querySelector('span').textContent = oppositeText;
  if (langMobile) langMobile.querySelector('span').textContent = oppositeText;

  // Re-translate current header page title
  updateHeaderTitle(state.activeView);

  // Re-translate lists
  renderAlertsList();
  renderHistoryTable();
  
  // Refresh advisories based on active metrics and language
  updateAdvisoryBox();
}

// Bind desktop language button
document.getElementById('lang-btn-desktop').addEventListener('click', toggleLanguage);
document.getElementById('lang-btn-mobile').addEventListener('click', toggleLanguage);

function toggleLanguage() {
  const nextLang = state.currentLanguage === 'en' ? 'te' : 'en';
  setLanguage(nextLang);
  showToast(
    state.currentLanguage === 'en' ? 'Language Changed' : 'భాష మార్చబడింది',
    state.currentLanguage === 'en' ? 'Application set to English' : 'అప్లికేషన్ తెలుగులోకి మార్చబడింది',
    'info'
  );
}

// --- Real-Time IoT Sensor Simulator ---
function updateSensorMetricsUI(moisture, temp, humidity) {
  const moistureValSpan = document.getElementById('sensor-moisture-val');
  const tempValSpan = document.getElementById('sensor-temp-val');
  const humidityValSpan = document.getElementById('sensor-humidity-val');

  // Update state arrays
  state.sensorHistory.moisture.shift();
  state.sensorHistory.moisture.push(parseFloat(moisture.toFixed(1)));
  
  state.sensorHistory.temp.shift();
  state.sensorHistory.temp.push(parseFloat(temp.toFixed(1)));

  state.sensorHistory.humidity.shift();
  state.sensorHistory.humidity.push(parseFloat(humidity.toFixed(1)));

  // Update text content
  if (moistureValSpan) moistureValSpan.innerHTML = `${Math.round(moisture)}<span class="sensor-unit">%</span>`;
  if (tempValSpan) tempValSpan.innerHTML = `${temp.toFixed(1)}<span class="sensor-unit">°C</span>`;
  if (humidityValSpan) humidityValSpan.innerHTML = `${Math.round(humidity)}<span class="sensor-unit">%</span>`;

  // Alert triggering condition: Low Moisture
  if (moisture < 30) {
    triggerLowMoistureAlert(moisture);
  }

  // Refresh charts and operational recommendations
  renderSvgCharts();
  updateAdvisoryBox();
}

function startSensorSimulation() {
  setInterval(async () => {
    if (state.isOnline) {
      try {
        const res = await fetch(`${state.backendBaseUrl}/api/sensors`);
        if (res.ok) {
          const data = await res.json();
          updateSensorMetricsUI(data.moisture, data.temp, data.humidity);
          await loadBackendAlerts();
          return;
        }
      } catch (e) {
        console.error("Failed to fetch sensors from API, falling back to local simulation:", e);
      }
    }

    // Local simulation: Slight fluctuations
    let currMoisture = state.sensorHistory.moisture[state.sensorHistory.moisture.length - 1];
    let currTemp = state.sensorHistory.temp[state.sensorHistory.temp.length - 1];
    let currHumidity = state.sensorHistory.humidity[state.sensorHistory.humidity.length - 1];

    currMoisture += (Math.random() - 0.5) * 3;
    currTemp += (Math.random() - 0.5) * 0.8;
    currHumidity += (Math.random() - 0.5) * 2;

    currMoisture = Math.max(25, Math.min(80, currMoisture));
    currTemp = Math.max(18, Math.min(42, currTemp));
    currHumidity = Math.max(35, Math.min(95, currHumidity));

    updateSensorMetricsUI(currMoisture, currTemp, currHumidity);
  }, 4000);
}

let moistureAlertActive = false;
function triggerLowMoistureAlert(value) {
  if (moistureAlertActive) return; // Prevent spamming notifications
  moistureAlertActive = true;

  const t = window.translations[state.currentLanguage];
  const title = state.currentLanguage === 'en' ? 'Critical Moisture Level' : 'క్లిష్టమైన నేల తేమ';
  const desc = state.currentLanguage === 'en' 
    ? `Zone A Soil moisture critical at ${Math.round(value)}%. Irrigate now.` 
    : `జోన్ A నేల తేమ చాలా తక్కువగా ఉంది ${Math.round(value)}%. వెంటనే నీరు పారించండి.`;

  showToast(title, desc, 'critical');

  // Push new alert to head of list
  const newAlert = {
    id: `alert-moisture-${Date.now()}`,
    type: 'critical',
    textKey: 'alertMoistureTrigger',
    timeKey: 'alertTimeJustNow',
    node: 'IoT Node 4'
  };

  // Add translation dynamically
  alertTextMap['alertMoistureTrigger'] = {
    en: `Zone A: Soil Moisture Critical (${Math.round(value)}%)`,
    te: `జోన్ A: నేల తేమ లోపం తక్కువగా ఉంది (${Math.round(value)}%)`
  };

  state.alerts.unshift(newAlert);
  renderAlertsList();
}

function updateAdvisoryBox() {
  const advBox = document.getElementById('dashboard-advisory-box');
  const advText = document.getElementById('dashboard-advisory-text');
  const advIcon = document.getElementById('advisory-icon-ref');
  const cropHealth = document.getElementById('overall-crop-status');

  const currMoisture = state.sensorHistory.moisture[state.sensorHistory.moisture.length - 1];
  const t = window.translations[state.currentLanguage];

  if (!advBox || !advText) return;

  if (currMoisture < 35) {
    // Critical alert state
    advBox.className = "advisory-box critical";
    advText.textContent = t.adviseMoistureLow;
    cropHealth.innerHTML = `<span class="status-dot critical"></span><span>${t.statusCritical}</span>`;
    advIcon.setAttribute('data-lucide', 'alert-triangle');
  } else if (currMoisture >= 35 && currMoisture < 40) {
    // Warning state
    advBox.className = "advisory-box warning";
    advText.textContent = t.adviseTempHigh;
    cropHealth.innerHTML = `<span class="status-dot warning"></span><span>${t.statusWarning}</span>`;
    advIcon.setAttribute('data-lucide', 'alert-circle');
  } else {
    // Normal healthy state
    advBox.className = "advisory-box";
    advText.textContent = t.adviseNormal;
    cropHealth.innerHTML = `<span class="status-dot healthy"></span><span>${t.statusHealthy}</span>`;
    advIcon.setAttribute('data-lucide', 'info');
  }

  // Restore lucide icons
  lucide.createIcons();
}

// --- Dynamic SVG Line Charting Logic ---
function renderSvgCharts() {
  const svg = document.getElementById('sensor-svg-chart');
  if (!svg) return;

  const width = 800;
  const height = 250;
  const paddingX = 50;
  const paddingY = 50;

  const plotWidth = width - (paddingX * 2);
  const plotHeight = height - (paddingY * 2);

  const pointsGroup = document.getElementById('chart-points-group');
  pointsGroup.innerHTML = '';

  // Max value references
  const maxVal = 100;

  const getPointsStr = (dataArray) => {
    return dataArray.map((val, index) => {
      const x = paddingX + (index * (plotWidth / (dataArray.length - 1)));
      // mapping 0-100 to plotHeight down from height-paddingY (200) to paddingY (50)
      const y = (height - paddingY) - (val * (plotHeight / maxVal));
      return { x, y, val };
    });
  };

  const moisturePoints = getPointsStr(state.sensorHistory.moisture);
  const tempPoints = getPointsStr(state.sensorHistory.temp);
  const humidityPoints = getPointsStr(state.sensorHistory.humidity);

  const getPathD = (points) => {
    return points.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');
  };

  // Draw Moisture Area path
  const moisturePath = getPathD(moisturePoints);
  document.getElementById('chart-line-moisture').setAttribute('d', moisturePath);
  
  const moistureAreaPath = moisturePath + `L ${moisturePoints[moisturePoints.length - 1].x} ${height - paddingY} L ${moisturePoints[0].x} ${height - paddingY} Z`;
  document.getElementById('chart-area-moisture').setAttribute('d', moistureAreaPath);

  // Draw Temp & Humidity paths
  document.getElementById('chart-line-temp').setAttribute('d', getPathD(tempPoints));
  document.getElementById('chart-line-humidity').setAttribute('d', getPathD(humidityPoints));

  // Plot hover circles
  const renderCircles = (points, colorClass, label) => {
    points.forEach(p => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('class', `chart-point ${colorClass}`);
      circle.setAttribute('stroke', colorClass === 'moisture' ? '#2563eb' : (colorClass === 'temp' ? '#ea580c' : '#0891b2'));
      
      // Title tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${label}: ${p.val}${label.includes('Temp') ? '°C' : '%'}`;
      circle.appendChild(title);
      pointsGroup.appendChild(circle);
    });
  };

  renderCircles(moisturePoints, 'moisture', 'Soil Moisture');
  renderCircles(tempPoints, 'temp', 'Air Temp');
  renderCircles(humidityPoints, 'humidity', 'Air Humidity');
}

// --- Disease Detection & Scanning AI Simulator ---
function setupImageDiagnostics() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const useSampleBtn = document.getElementById('use-sample-btn');
  const previewImg = document.getElementById('preview-img');
  const placeholderIcon = document.getElementById('placeholder-icon');
  const scannerOverlay = document.getElementById('scanner-overlay');
  const boundingBox = document.getElementById('bounding-box');
  const resultsCard = document.getElementById('results-card');

  // Trigger file browser on click
  dropZone.addEventListener('click', (e) => {
    if (e.target !== useSampleBtn) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Drag and drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  // Use sample image button click
  useSampleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering file input opening
    simulateSampleScan();
  });

  function handleFileSelected(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      runImageScanAnimation(e.target.result, false);
    };
    reader.readAsDataURL(file);
  }

  function simulateSampleScan() {
    runImageScanAnimation('assets/disease-sample.png', true);
  }

  function displayDiagnosticResults(disease, confidence, treatment, bbox) {
    const t = window.translations[state.currentLanguage];
    
    // Populate labels
    document.getElementById('res-disease-name').textContent = disease;
    document.getElementById('res-confidence').textContent = `${confidence}%`;
    document.getElementById('res-treatment').textContent = treatment;
    
    // Update Bounding Box location
    if (bbox) {
      boundingBox.style.top = `${bbox.top}%`;
      boundingBox.style.left = `${bbox.left}%`;
      boundingBox.style.width = `${bbox.width}px`;
      boundingBox.style.height = `${bbox.height}px`;
      document.getElementById('bounding-label').textContent = bbox.label || (state.currentLanguage === 'en' ? "Infection Zone" : "వ్యాధి మచ్చ");
      boundingBox.style.display = 'block';
    } else {
      boundingBox.style.display = 'none';
    }

    // Display results card
    resultsCard.style.display = 'block';
    
    // Transition confidence bar width
    setTimeout(() => {
      document.getElementById('confidence-bar').style.width = `${confidence}%`;
    }, 50);

    // Trigger toast alert
    const successTitle = state.currentLanguage === 'en' ? 'Diagnostics Completed' : 'పరీక్ష పూర్తయింది';
    const successDesc = state.currentLanguage === 'en' ? 'Crop health diagnostic report generated.' : 'పంట తెగులు రోగ నిర్ధారణ నివేదిక సిద్ధమైంది.';
    showToast(successTitle, successDesc, 'info');
  }

  async function runImageScanAnimation(imageSrc, isSample) {
    // Reset views
    placeholderIcon.style.display = 'none';
    previewImg.src = imageSrc;
    previewImg.style.display = 'block';
    resultsCard.style.display = 'none';
    boundingBox.style.display = 'none';
    scannerOverlay.style.display = 'block';

    if (state.isOnline) {
      try {
        const formData = new FormData();
        formData.append('crop', state.profile.crop);
        formData.append('lang', state.currentLanguage);
        formData.append('is_sample', isSample ? 'true' : 'false');

        // Simulate 2s scanning delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await fetch(`${state.backendBaseUrl}/api/diagnose`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          scannerOverlay.style.display = 'none';
          displayDiagnosticResults(data.disease, data.confidence, data.treatment, data.bbox);
          await loadBackendDiagnostics();
          return;
        }
      } catch (e) {
        console.error("API Diagnostic failed, falling back to local simulation:", e);
      }
    }

    // Local simulation: 2s latency simulation
    setTimeout(() => {
      // Done scanning
      scannerOverlay.style.display = 'none';
      
      // Calculate randomized results based on user selected crop
      const selectedCrop = state.profile.crop;
      const t = window.translations[state.currentLanguage];
      
      let disease = '';
      let treatment = '';
      let labelBox = '';

      if (isSample) {
        // Sample photo points to Rice Blast/Tomato Blight depending on primary crop
        if (selectedCrop === 'rice') {
          disease = t.diseaseRiceBlast;
          treatment = t.treatmentRiceBlast;
          labelBox = state.currentLanguage === 'en' ? "Rice Blast Outbreak" : "వరి అగ్గి తెగులు";
        } else if (selectedCrop === 'wheat') {
          disease = t.diseaseWheatRust;
          treatment = t.treatmentWheatRust;
          labelBox = state.currentLanguage === 'en' ? "Wheat Rust Infection" : "తుప్పు తెగులు";
        } else {
          disease = t.diseaseTomatoBlight;
          treatment = t.treatmentTomatoBlight;
          labelBox = state.currentLanguage === 'en' ? "Early Blight Spots" : "ముందస్తు తెగులు";
        }
      } else {
        // Randomly output healthy leaf (20% chance) or diseases (80%)
        const roll = Math.random();
        if (roll < 0.2) {
          disease = t.diseaseHealthy;
          treatment = t.treatmentHealthy;
          labelBox = state.currentLanguage === 'en' ? "Healthy Leaf" : "ఆరోగ్యకరమైనది";
        } else if (roll < 0.5) {
          disease = t.diseaseRiceBlast;
          treatment = t.treatmentRiceBlast;
          labelBox = state.currentLanguage === 'en' ? "Rice Blast" : "వరి అగ్గి తెగులు";
        } else if (roll < 0.8) {
          disease = t.diseaseTomatoBlight;
          treatment = t.treatmentTomatoBlight;
          labelBox = state.currentLanguage === 'en' ? "Early Blight Spots" : "ముందస్తు తెగులు";
        } else {
          disease = t.diseaseWheatRust;
          treatment = t.treatmentWheatRust;
          labelBox = state.currentLanguage === 'en' ? "Wheat Rust" : "ఆకు తుప్పు తెగులు";
        }
      }

      // Generate confidence
      const confidence = Math.round(85 + Math.random() * 12);
      
      const bboxObj = (disease !== t.diseaseHealthy) ? {
        top: Math.round(30 + Math.random() * 40),
        left: Math.round(20 + Math.random() * 50),
        width: Math.round(80 + Math.random() * 100),
        height: Math.round(60 + Math.random() * 80),
        label: labelBox
      } : null;

      displayDiagnosticResults(disease, confidence, treatment, bboxObj);

      // Append reports to farmer profile histories
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
      
      const cleanDiseaseStr = disease.split('(')[0].trim(); // trim scientific notation
      const newHistory = {
        timestamp: dateStr,
        crop: selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1),
        disease: cleanDiseaseStr,
        confidence: confidence,
        treatment: treatment.slice(0, 70) + '...'
      };

      state.diagnosticHistory.unshift(newHistory);
      localStorage.setItem('smartcrop_diagnostics', JSON.stringify(state.diagnosticHistory));
      renderHistoryTable();

    }, 2000);
  }
}

// --- Drone Monitoring HUD Simulator ---
function setupDroneMonitor() {
  const normalBtn = document.getElementById('btn-view-normal');
  const ndviBtn = document.getElementById('btn-view-ndvi');
  const monitorBox = document.getElementById('drone-feed-box');

  normalBtn.addEventListener('click', () => {
    normalBtn.classList.add('active');
    ndviBtn.classList.remove('active');
    monitorBox.classList.remove('ndvi-active');
  });

  ndviBtn.addEventListener('click', () => {
    ndviBtn.classList.add('active');
    normalBtn.classList.remove('active');
    monitorBox.classList.add('ndvi-active');
  });

  // Fluctuate Drone Altitude and Battery Telemetries
  const altSpan = document.getElementById('drone-alt');
  const batSpan = document.getElementById('drone-bat');
  
  let baseAlt = 42.5;
  let baseBat = 88;

  setInterval(() => {
    if (state.activeView !== 'drone') return;
    baseAlt += (Math.random() - 0.5) * 0.4;
    altSpan.textContent = `${baseAlt.toFixed(1)}m`;

    if (Math.random() < 0.1) {
      baseBat -= 1;
      baseBat = Math.max(5, baseBat);
      batSpan.textContent = `${baseBat}%`;
    }
  }, 3000);
}

// --- Farmer Profile CRUD Handler ---
function populateProfileForm() {
  document.getElementById('farmer-name').value = state.profile.name;
  document.getElementById('farmer-phone').value = state.profile.phone;
  document.getElementById('farm-location').value = state.profile.location;
  document.getElementById('farm-crop').value = state.profile.crop;
  document.getElementById('farm-size').value = state.profile.size;
  document.getElementById('soil-type').value = state.profile.soil;
}

window.saveProfile = async function(event) {
  event.preventDefault();
  
  state.profile.name = document.getElementById('farmer-name').value;
  state.profile.phone = document.getElementById('farmer-phone').value;
  state.profile.location = document.getElementById('farm-location').value;
  state.profile.crop = document.getElementById('farm-crop').value;
  state.profile.size = document.getElementById('farm-size').value;
  state.profile.soil = document.getElementById('soil-type').value;

  localStorage.setItem('smartcrop_profile', JSON.stringify(state.profile));

  if (state.isOnline) {
    try {
      const res = await fetch(`${state.backendBaseUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.profile)
      });
      if (res.ok) {
        console.log("Profile synchronized with SQLite backend.");
      }
    } catch (e) {
      console.error("Failed to sync profile with SQLite backend:", e);
    }
  }

  const t = window.translations[state.currentLanguage];
  const successMsg = state.currentLanguage === 'en' ? 'Profile Saved' : 'ప్రొఫైల్ సేవ్ అయింది';
  showToast(successMsg, t.saveSuccessMsg, 'info');
};

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  if (state.diagnosticHistory.length === 0) {
    const t = window.translations[state.currentLanguage];
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--neutral-700);">${t.historyEmpty}</td></tr>`;
    return;
  }

  tbody.innerHTML = state.diagnosticHistory.map(row => `
    <tr>
      <td>${row.timestamp}</td>
      <td><strong>${row.crop}</strong> - ${row.disease}</td>
      <td><span class="badge-percent">${row.confidence}%</span></td>
      <td style="font-size: 0.85rem; color: var(--neutral-700); max-width:250px;">${row.treatment}</td>
    </tr>
  `).join('');
}

// Bind Clear History Button
const clearHistBtn = document.getElementById('clear-history-btn');
if (clearHistBtn) {
  clearHistBtn.addEventListener('click', async () => {
    state.diagnosticHistory = [];
    localStorage.removeItem('smartcrop_diagnostics');
    
    if (state.isOnline) {
      try {
        await fetch(`${state.backendBaseUrl}/api/diagnose/history`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to clear diagnostic history from SQLite backend:", e);
      }
    }
    
    renderHistoryTable();
    showToast(
      state.currentLanguage === 'en' ? 'History Cleared' : 'చరిత్ర తొలగించబడింది',
      state.currentLanguage === 'en' ? 'Diagnostic scanning history erased.' : 'పంట పరీక్షల చరిత్ర పూర్తిగా తొలగించబడింది.',
      'info'
    );
  });
}

// --- Alerts Engine Interface ---
function renderAlertsList() {
  const container = document.getElementById('alerts-list-container');
  const countBadge = document.getElementById('notif-count');
  
  if (!container) return;

  if (state.alerts.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 2rem; color:var(--neutral-700); font-weight:600;">No active alerts. All systems operational.</div>`;
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  if (countBadge) {
    countBadge.style.display = 'flex';
    countBadge.textContent = state.alerts.length;
  }

  const t = window.translations[state.currentLanguage];

  container.innerHTML = state.alerts.map(alert => {
    const label = alert.type.toUpperCase();
    const alertText = alertTextMap[alert.textKey] ? alertTextMap[alert.textKey][state.currentLanguage] : alert.textKey;
    const timeText = t[alert.timeKey] || alert.timeKey;
    
    return `
      <div class="alert-item-card ${alert.type}" data-alert-id="${alert.id}">
        <span class="alert-badge ${alert.type}">${label === 'CRITICAL' ? (t.alertCritical || 'CRITICAL') : (label === 'WARNING' ? (t.alertWarning || 'WARNING') : (t.alertInfo || 'INFO'))}</span>
        <div class="alert-details">
          <div class="alert-text">${alertText}</div>
          <div class="alert-meta">
            <span><i data-lucide="clock"></i> <span>${timeText}</span></span>
            <span><i data-lucide="cpu"></i> ${alert.node}</span>
          </div>
        </div>
        <button class="dismiss-alert-btn" onclick="dismissAlert('${alert.id}')">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

window.dismissAlert = async function(alertId) {
  state.alerts = state.alerts.filter(alert => alert.id !== alertId);
  
  // If moisture alert cleared, let it trigger again in future
  if (alertId.startsWith('alert-moisture-')) {
    moistureAlertActive = false;
  }

  if (state.isOnline) {
    try {
      await fetch(`${state.backendBaseUrl}/api/alerts/${alertId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error("Failed to delete alert from SQLite backend:", e);
    }
  }

  renderAlertsList();
  showToast(
    state.currentLanguage === 'en' ? 'Alert Cleared' : 'అలర్ట్ తొలగించబడింది',
    state.currentLanguage === 'en' ? 'Notification dismissed.' : 'నోటిఫికేషన్ తొలగించబడింది.',
    'info'
  );
};

// Bind Clear All Alerts button
const clearAlertsBtn = document.getElementById('clear-alerts-btn');
if (clearAlertsBtn) {
  clearAlertsBtn.addEventListener('click', async () => {
    state.alerts = [];
    moistureAlertActive = false;
    
    if (state.isOnline) {
      try {
        await fetch(`${state.backendBaseUrl}/api/alerts`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to clear alerts from SQLite backend:", e);
      }
    }

    renderAlertsList();
    showToast(
      state.currentLanguage === 'en' ? 'Alerts Cleared' : 'అన్ని అలర్ట్‌లు తొలగించబడ్డాయి',
      state.currentLanguage === 'en' ? 'All active warnings dismissed.' : 'అన్ని నోటిఫికేషన్‌లు క్లియర్ చేయబడ్డాయి.',
      'info'
    );
  });
}

function setupNotificationsBell() {
  const bell = document.getElementById('notif-bell');
  if (bell) {
    bell.addEventListener('click', () => {
      window.navigateToView('alerts');
    });
  }
}

// --- AI Chatbot Interface & Speech Simulator ---
function setupChatbot() {
  const trigger = document.getElementById('chatbot-trigger');
  const windowBox = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const textInput = document.getElementById('chatbot-text-input');
  const messagesBox = document.getElementById('chatbot-messages-container');
  const micBtn = document.getElementById('chatbot-mic-btn');
  const waveBox = document.getElementById('voice-wave-box');

  // Open/Close chat toggle
  trigger.addEventListener('click', () => {
    windowBox.classList.toggle('active');
  });

  closeBtn.addEventListener('click', () => {
    windowBox.classList.remove('active');
  });

  // Text message submit
  const submitMessage = async () => {
    const text = textInput.value.trim();
    if (!text) return;
    
    appendMessage(text, 'user');
    textInput.value = '';
    
    // Auto scroll down
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Show AI typing indicator
    showTypingIndicator();

    let reply = '';
    if (state.isOnline) {
      try {
        const res = await fetch(`${state.backendBaseUrl}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lang: state.currentLanguage })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        }
      } catch (e) {
        console.error("Chatbot API request failed, falling back to local reply generator:", e);
      }
    }

    if (!reply) {
      reply = generateBotReply(text);
    }

    setTimeout(() => {
      removeTypingIndicator();
      appendMessage(reply, 'bot');
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 1000);
  };

  sendBtn.addEventListener('click', submitMessage);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitMessage();
  });

  // Global scope binding for quick question pills
  window.sendQuickQuestion = function(topic) {
    let questionText = "";
    if (topic === 'rice blast') {
      questionText = state.currentLanguage === 'en' ? "How to treat Rice Blast disease?" : "వరి అగ్గి తెగులు నివారణ ఎలా?";
    } else if (topic === 'early blight') {
      questionText = state.currentLanguage === 'en' ? "What is early blight in tomato?" : "టమోటా ఎర్లీ బ్లైట్ నివారణ మార్గాలు?";
    } else if (topic === 'soil moisture') {
      questionText = state.currentLanguage === 'en' ? "What is the optimal soil moisture level?" : "నేల తేమ ఎంత శాతం ఉండాలి?";
    } else if (topic === 'wheat rust') {
      questionText = state.currentLanguage === 'en' ? "Wheat rust organic control?" : "గోధుమ తుప్పు తెగులు చికిత్స విధానం?";
    }
    
    textInput.value = questionText;
    submitMessage();
  };

  // Simulated Speech-to-Text Input Voice Button
  let micActive = false;
  micBtn.addEventListener('click', () => {
    if (micActive) return; // Prevent double trigger
    micActive = true;

    micBtn.classList.add('active');
    waveBox.style.display = 'flex';

    // Status hint in placeholder
    const t = window.translations[state.currentLanguage];
    textInput.setAttribute('placeholder', t.botVoiceActive || 'Listening...');

    setTimeout(() => {
      // Done listening - populate question
      micBtn.classList.remove('active');
      waveBox.style.display = 'none';
      
      // Select text based on current language
      const spokenQuestion = state.currentLanguage === 'en' 
        ? "how to treat early blight?" 
        : "టమోటా ఎర్లీ బ్లైట్ నివారణ మార్గాలు?";
      
      textInput.value = spokenQuestion;
      textInput.setAttribute('placeholder', t.botPlaceholder);
      micActive = false;

      // Automatically submit spoken text
      submitMessage();
    }, 2500);
  });

  // Chat message rendering helpers
  function appendMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    messagesBox.appendChild(bubble);
  }

  function showTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot typing';
    bubble.id = 'chatbot-typing-bubble';
    bubble.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messagesBox.appendChild(bubble);
  }

  function removeTypingIndicator() {
    const bubble = document.getElementById('chatbot-typing-bubble');
    if (bubble) bubble.remove();
  }

  function generateBotReply(text) {
    const cleanText = text.toLowerCase();
    const t = window.translations[state.currentLanguage];

    if (cleanText.includes('blast') || cleanText.includes('వరి') || cleanText.includes('అగ్గి')) {
      return t.botReplyBlast;
    } else if (cleanText.includes('blight') || cleanText.includes('టమోటా') || cleanText.includes('బ్లైట్')) {
      return t.botReplyBlight;
    } else if (cleanText.includes('rust') || cleanText.includes('తుప్పు') || cleanText.includes('గోధుమ')) {
      return t.botReplyRust;
    } else if (cleanText.includes('moisture') || cleanText.includes('తేమ') || cleanText.includes('నీరు') || cleanText.includes('water')) {
      return t.botReplyMoisture;
    }
    return t.botReplyDefault;
  }
}

// --- Dynamic Toast Popup Alert Notifications ---
function showToast(title, text, type = 'info') {
  const container = document.getElementById('toast-wrapper');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  
  let iconName = 'info';
  if (type === 'critical') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-text">${text}</div>
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Remove toast automatically after 4.5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideInToast 0.3s ease-in reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4500);
}

// --- Authentication UI Handlers ---

window.handleLocalLogin = function(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('login-username').value;
  const passwordInput = document.getElementById('login-password').value;
  
  // Show loading spinner
  const overlay = document.getElementById('auth-loading-overlay');
  const loadingText = document.getElementById('loading-text');
  if (overlay) overlay.classList.remove('hidden');
  if (loadingText) loadingText.textContent = state.currentLanguage === 'en' ? 'Verifying credentials...' : 'రుజువులను ధృవీకరిస్తోంది...';
  
  setTimeout(() => {
    if (overlay) overlay.classList.add('hidden');
    
    // Store logged in state
    localStorage.setItem('smartcrop_logged_in', 'true');
    
    // Transition screens
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.querySelector('.app-container');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');
    
    showToast(
      state.currentLanguage === 'en' ? 'Login Successful' : 'లాగిన్ విజయవంతమైంది',
      state.currentLanguage === 'en' ? `Welcome back, ${state.profile.name || 'Farmer'}!` : `తిరిగి స్వాగతం, ${state.profile.name || 'రైతు'}!`,
      'info'
    );
  }, 1200);
};

window.handleGoogleLogin = function() {
  // Show loading spinner for Google authentication
  const overlay = document.getElementById('auth-loading-overlay');
  const loadingText = document.getElementById('loading-text');
  if (overlay) overlay.classList.remove('hidden');
  if (loadingText) loadingText.textContent = state.currentLanguage === 'en' ? 'Connecting to Google Accounts...' : 'గూగుల్ ఖాతాకు అనుసంధానిస్తోంది...';
  
  setTimeout(() => {
    if (loadingText) loadingText.textContent = state.currentLanguage === 'en' ? 'Authenticating...' : 'ధృవీకరిస్తోంది...';
    
    setTimeout(() => {
      if (overlay) overlay.classList.add('hidden');
      
      // Store logged in state
      localStorage.setItem('smartcrop_logged_in', 'true');
      
      // Transition screens
      const loginScreen = document.getElementById('login-screen');
      const appContainer = document.querySelector('.app-container');
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appContainer) appContainer.classList.remove('hidden');
      
      showToast(
        state.currentLanguage === 'en' ? 'Google Auth Successful' : 'గూగుల్ లాగిన్ విజయవంతమైంది',
        state.currentLanguage === 'en' ? `Signed in with Google. Welcome back, ${state.profile.name || 'Farmer'}!` : `గూగుల్ ద్వారా లాగిన్ అయ్యారు. తిరిగి స్వాగతం, ${state.profile.name || 'రైతు'}!`,
        'info'
      );
    }, 1000);
  }, 1000);
};

window.handleLogout = function() {
  // Clear state
  localStorage.removeItem('smartcrop_logged_in');
  
  // Transition screens
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.querySelector('.app-container');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appContainer) appContainer.classList.add('hidden');
  
  // Reset inputs
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.reset();
  
  showToast(
    state.currentLanguage === 'en' ? 'Logged Out' : 'లాగ్అవుట్ అయ్యారు',
    state.currentLanguage === 'en' ? 'You have successfully signed out.' : 'మీరు విజయవంతంగా లాగ్అవుట్ అయ్యారు.',
    'info'
  );
};

window.toggleLoginPassword = function() {
  const passInput = document.getElementById('login-password');
  const toggleIcon = document.getElementById('password-toggle');
  if (!passInput || !toggleIcon) return;
  
  if (passInput.type === 'password') {
    passInput.type = 'text';
    toggleIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    passInput.type = 'password';
    toggleIcon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
};

