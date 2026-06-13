const translations = {
  en: {
    // Navigation
    brandTitle: "SmartCrop AI",
    navHome: "Home",
    navDashboard: "Dashboard",
    navDetection: "Disease Detection",
    navDrone: "Drone Monitor",
    navAlerts: "Alerts Center",
    navProfile: "Farm Profile",
    langToggle: "తెలుగు",
    apiOnline: "Online Mode",
    apiOffline: "Offline Mode",

    // Home Page
    heroTitle: "Next-Gen AI Crop Monitoring & Edge IoT",
    heroSubtitle: "Empowering farmers with real-time crop disease detection, satellite drone feeds, and localized edge sensor telemetry to optimize yield and prevent losses.",
    getStartedBtn: "Get Started",
    systemOverviewTitle: "About the System",
    systemOverviewText: "Our platform integrates Artificial Intelligence with Edge Computing to provide offline-capable, real-time farm diagnostics. IoT sensors embedded in fields collect vital data, while aerial drone monitoring highlights stressed areas. On-site AI models analyze leaf images directly, recommending instant treatments without requiring high-bandwidth internet.",
    
    featuresTitle: "Core Features",
    featDetectionTitle: "Disease Detection",
    featDetectionDesc: "Snap leaf photos to diagnose crop infections instantly using edge-based computer vision.",
    featIoTTitle: "IoT Telemetry",
    featIoTDesc: "Monitor live soil moisture, humidity, and temperature sensor readouts from your plots.",
    featAlertsTitle: "Smart Alerts",
    featAlertsDesc: "Receive critical push notifications when soil moisture drops or pest outbreaks occur.",
    featDroneTitle: "Drone Analysis",
    featDroneDesc: "Access remote-sensing aerial imagery mapping field stress and vegetation indexes.",

    // Disease Detection
    detectionHeader: "AI Leaf Disease Diagnostics",
    dragDropLabel: "Drag & drop leaf photo here, or click to browse",
    supportedFormats: "Supports JPG, PNG, WEBP. Maximum size 5MB.",
    sampleBtn: "Use Sample Infected Leaf",
    analyzingText: "Analyzing leaf image with Edge AI...",
    resultsTitle: "Diagnostic Report",
    diseaseNameLabel: "Detected Disease",
    confidenceLabel: "Confidence Level",
    treatmentLabel: "Suggested Treatment Plan",
    historySaveMsg: "Report saved to Farm Profile history log.",
    
    // Crop diseases mock
    diseaseRiceBlast: "Rice Blast (Magnaporthe oryzae)",
    treatmentRiceBlast: "Avoid excessive nitrogen fertilizers. Drain the field temporarily to reduce humidity. Apply tricyclazole or copper-based fungicide to infected areas if severity exceeds 10%.",
    
    diseaseTomatoBlight: "Early Blight (Alternaria solani)",
    treatmentTomatoBlight: "Prune lower infected leaves to improve airflow. Water the base of the plant, not the leaves, to reduce wetness. Apply organic copper-octanoate spray every 7 days.",
    
    diseaseWheatRust: "Leaf Rust (Puccinia recondita)",
    treatmentWheatRust: "Plant rust-resistant crop varieties next season. Apply sulfur-based organic dust or systemic triazole fungicides immediately to limit spore dispersal.",
    
    diseaseHealthy: "Healthy Crop Leaf",
    treatmentHealthy: "No disease detected. Continue normal irrigation and crop nutrition schedules. Monitor soil moisture closely.",

    // Dashboard Page
    dashboardHeader: "Edge Sensor Dashboard",
    cropHealthStatusLabel: "Overall Crop Health Status",
    statusHealthy: "Healthy",
    statusWarning: "Warning",
    statusCritical: "Critical",
    sensorMoisture: "Soil Moisture",
    sensorTemp: "Air Temperature",
    sensorHumidity: "Air Humidity",
    sensorSolar: "Solar Radiation",
    chartTitle: "Sensor Activity (Last 12 Hours)",
    lastUpdated: "Last updated: Just now",
    recommendationTitle: "AI Operational Advisory",
    adviseMoistureLow: "Soil moisture is low (below 35%). Activate drip irrigation system immediately in Zone B.",
    adviseTempHigh: "Air temperature is elevated. Watch for heat stress. Ensure consistent soil dampness.",
    adviseNormal: "Sensors report optimal levels. Next scheduled watering in 6 hours. Weather is stable.",

    // Alerts Page
    alertsHeader: "Real-Time Field Alerts",
    activeAlertsTitle: "Active Warning Notifications",
    alertDismissAll: "Clear All Notifications",
    alertCritical: "CRITICAL",
    alertWarning: "WARNING",
    alertInfo: "INFO",
    alertTimeJustNow: "Just Now",
    alertTime10m: "10 mins ago",
    alertTime1h: "1 hour ago",
    alertTime4h: "4 hours ago",

    // Drone Monitoring Page
    droneHeader: "Drone Aerial Monitoring",
    droneStatus: "Drone Telemetry: ONLINE (Auto-patrol Mode)",
    altitudeLabel: "Altitude",
    speedLabel: "Ground Speed",
    batteryLabel: "Battery",
    coverageLabel: "Field Coverage",
    viewNormal: "Visual Camera Feed",
    viewNDVI: "NDVI (Crop Stress Indicator)",
    affectedZonesHeader: "Identified Stress Hotspots",
    zoneRedText: "Zone C: Fungal Outbreak detected. 12% crop stress. Recommended local fungicide spray.",
    zoneYellowText: "Zone B: Sub-optimal soil hydration. Thermal scan indicates thermal stress.",
    mapLayoutTitle: "Field Flight Grid Overlay",

    // Farmer Profile Page
    profileHeader: "Farmer & Land Profile",
    farmerDetailsTitle: "Farmer Details",
    farmDetailsTitle: "Farm Details",
    farmerNameLabel: "Farmer Name",
    farmerPhoneLabel: "Phone Number",
    farmLocationLabel: "Farm Location / Village",
    farmCropLabel: "Primary Crop Type",
    farmSizeLabel: "Cultivated Area (Acres)",
    soilTypeLabel: "Soil Category",
    saveProfileBtn: "Update Profile Info",
    saveSuccessMsg: "Profile details updated successfully!",
    detectionHistoryTitle: "Diagnostic History Logs",
    historyEmpty: "No past diagnostic reports. Go to Disease Detection to run a scan.",
    historyClearBtn: "Clear History Logs",

    // Weather Widget
    weatherTitle: "Local Weather Station",
    weatherToday: "Today",
    weatherForecast: "3-Day Farming Forecast",
    weatherAdvisory: "Farming Advisory",
    weatherAdviseText: "Dry weather expected. Ideal conditions for harvesting or foliar fertilizer spraying. Avoid middle-of-the-day operations due to high heat index.",

    // AI Chatbot
    botHeader: "Krishi AI Assistant",
    botPlaceholder: "Ask Krishi AI (e.g., 'How to treat leaf rust?')...",
    botSendBtn: "Send",
    botVoiceActive: "Listening... speak now.",
    botVoiceInactive: "Start voice input",
    botGreeting: "Hello! I am Krishi AI, your agricultural assistant. Ask me anything about crop diseases, fertilizers, or water management.",
    botReplyDefault: "I'm analyzing that query. For best yields, ensure your soil moisture is above 40%. For specific disease treatments, check the Disease Detection tab to scan a leaf.",
    botReplyBlast: "Rice Blast is caused by fungus. Avoid high nitrogen applications, spray Tricyclazole 75% WP, and keep the field clean.",
    botReplyMoisture: "Standard cereal crops like rice prefer saturated soils. Vegetables prefer a moisture level between 40% and 60%. Try to irrigate in the early morning.",
    botReplyBlight: "Early Blight of tomato can be treated by pruning infected lower leaves and spraying a copper fungicide or organic Neem extract.",
    botReplyRust: "Wheat Rust is highly infectious. Apply propiconazole or tebuconazole immediately and plant resistant seeds next cycle.",
  },
  te: {
    // Navigation
    brandTitle: "స్మార్ట్ క్రాప్ AI",
    navHome: "హోమ్",
    navDashboard: "డాష్‌బోర్డ్",
    navDetection: "తెగుళ్ల గుర్తింపు",
    navDrone: "డ్రోన్ మానిటర్",
    navAlerts: "అలర్ట్స్ సెంటర్",
    navProfile: "రైతు ప్రొఫైల్",
    langToggle: "English",
    apiOnline: "ఆన్‌లైన్ మోడ్",
    apiOffline: "ఆఫ్‌లైన్ మోడ్",

    // Home Page
    heroTitle: "అధునాతన AI పంట పర్యవేక్షణ & ఎడ్జ్ IoT",
    heroSubtitle: "నిజ సమయ పంట తెగుళ్ల గుర్తింపు, శాటిలైట్ డ్రోన్ ఫీడ్‌లు మరియు స్థానిక ఎడ్జ్ సెన్సార్ డేటా సహాయంతో దిగుబడిని పెంచుకోండి మరియు నష్టాలను నివారించండి.",
    getStartedBtn: "ప్రారంభించండి",
    systemOverviewTitle: "వ్యవస్థ పరిచయం",
    systemOverviewText: "మా ప్లాట్‌ఫారమ్ ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (AI) మరియు ఎడ్జ్ కంప్యూటింగ్‌ను అనుసంధానించి, ఇంటర్నెట్ లేకపోయినా పనిచేసే పంట విశ్లేషణను అందిస్తుంది. పొలాల్లో ఉంచిన IoT సెన్సార్లు నేల తేమ, ఉష్ణోగ్రత మరియు గాలి తేమను సేకరిస్తాయి. డ్రోన్లు పొలంలో దెబ్బతిన్న భాగాలను గుర్తిస్తాయి. ఆన్-సైట్ AI మోడల్స్ ఆకుల ఫోటోలను విశ్లేషించి తక్షణ చికిత్సలను సూచిస్తాయి.",
    
    featuresTitle: "ముఖ్యమైన సేవలు",
    featDetectionTitle: "తెగుళ్ల గుర్తింపు",
    featDetectionDesc: "ఎడ్జ్ కంప్యూటర్ విజన్ ద్వారా పంట ఆకుల ఫోటోలను తీసి తెగుళ్లను తక్షణమే గుర్తించండి.",
    featIoTTitle: "IoT టెలిమెట్రీ",
    featIoTDesc: "మీ పొలం నుండి నేల తేమ, గాలి ఉష్ణోగ్రత మరియు తేమ శాతాన్ని ప్రత్యక్షంగా పర్యవేక్షించండి.",
    featAlertsTitle: "స్మార్ట్ అలర్ట్‌లు",
    featAlertsDesc: "నేల తేమ తగ్గినప్పుడు లేదా తెగుళ్లు సోకినప్పుడు తక్షణ హెచ్చరికలను పొందండి.",
    featDroneTitle: "డ్రోన్ విశ్లేషణ",
    featDroneDesc: "రిమోట్ సెన్సింగ్ డ్రోన్ చిత్రాల ద్వారా పొలంలో పంట ఒత్తిడి మరియు ఎదుగుదలని గమనించండి.",

    // Disease Detection
    detectionHeader: "AI ఆకు తెగుళ్ల విశ్లేషణ",
    dragDropLabel: "ఆకు ఫోటోను ఇక్కడ డ్రాప్ చేయండి, లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి",
    supportedFormats: "JPG, PNG, WEBP ఫార్మాట్‌లకు మాత్రమే మద్దతు ఉంది. గరిష్ట పరిమాణం 5MB.",
    sampleBtn: "నమూనా వ్యాధి ఆకును ఉపయోగించండి",
    analyzingText: "ఎడ్జ్ AI తో ఆకు చిత్రాన్ని విశ్లేషిస్తోంది...",
    resultsTitle: "రోగ నిర్ధారణ నివేదిక",
    diseaseNameLabel: "గుర్తించిన తెగులు పేరు",
    confidenceLabel: "ఖచ్చితత్వం శాతం",
    treatmentLabel: "సూచించిన చికిత్స విధానం",
    historySaveMsg: "నివేదిక రైతు ప్రొఫైల్ చరిత్రలో సేవ్ చేయబడింది.",
    
    // Crop diseases mock
    diseaseRiceBlast: "వరి అగ్గి తెగులు (రైస్ బ్లాస్ట్)",
    treatmentRiceBlast: "నత్రజని ఎరువుల వినియోగాన్ని తగ్గించండి. పొలంలో నీటిని తాత్కాలికంగా తీసివేసి గాలి ఆడేలా చేయండి. తీవ్రత 10% మించితే ట్రైసైక్లాజోల్ లేదా రాగి ఆధారిత శిలీంద్ర నాశనిని పిచికారీ చేయండి.",
    
    diseaseTomatoBlight: "టమోటా ముందస్తు తెగులు (ఎర్లీ బ్లైట్)",
    treatmentTomatoBlight: "గాలి బాగా తగలడానికి కింద పడిపోయిన రోగగ్రస్త ఆకులను కత్తిరించండి. నీటిని ఆకులపై కాకుండా మొక్క మొదట్లో పోయండి. ప్రతి 7 రోజులకు ఒకసారి సేంద్రీయ కాపర్ స్ప్రే చేయండి.",
    
    diseaseWheatRust: "గోధుమ ఆకు తుప్పు తెగులు (లీఫ్ రస్ట్)",
    treatmentWheatRust: "తదుపరి పంట కాలంలో తెగుళ్లను తట్టుకునే రకాలను నాటండి. స్పోర్స్ వ్యాప్తిని అరికట్టడానికి సల్ఫర్ ఆధారిత సేంద్రీయ పొడి లేదా ట్రయాజోల్ శిలీంద్ర నాశనిని వెంటనే పిచికారీ చేయండి.",
    
    diseaseHealthy: "ఆరోగ్యకరమైన పంట ఆకు",
    treatmentHealthy: "ఎటువంటి తెగులు కనుగొనబడలేదు. సాధారణ నీటి పారుదల మరియు పోషకాలను కొనసాగించండి. నేల తేమను నిరంతరం పర్యవేక్షించండి.",

    // Dashboard Page
    dashboardHeader: "ఎడ్జ్ సెన్సార్ డాష్‌బోర్డ్",
    cropHealthStatusLabel: "మొత్తం పంట ఆరోగ్య స్థితి",
    statusHealthy: "ఆరోగ్యకరం",
    statusWarning: "హెచ్చరిక",
    statusCritical: "ప్రమాదం",
    sensorMoisture: "నేల తేమ",
    sensorTemp: "గాలి ఉష్ణోగ్రత",
    sensorHumidity: "గాలి తేమ",
    sensorSolar: "సౌర వికిరణం",
    chartTitle: "సెన్సార్ యాక్టివిటీ (గత 12 గంటలు)",
    lastUpdated: "చివరి అప్‌డేట్: ఇప్పుడే",
    recommendationTitle: "AI పంట సలహా",
    adviseMoistureLow: "నేల తేమ తక్కువగా ఉంది (35% కంటే తక్కువ). జోన్ సి లో వెంటనే బిందు సేద్యం (డ్రిప్) ప్రారంభించండి.",
    adviseTempHigh: "గాలి ఉష్ణోగ్రత ఎక్కువగా ఉంది. వేడి ఒత్తిడిని గమనించండి. నేల నిరంతరం తేమగా ఉండేలా చూడండి.",
    adviseNormal: "సెన్సార్లు సరైన పరిమాణాలను చూపిస్తున్నాయి. తదుపరి నీటి పారుదల 6 గంటల్లో. వాతావరణం అనుకూలంగా ఉంది.",

    // Alerts Page
    alertsHeader: "నిజ సమయ పొలం హెచ్చరికలు",
    activeAlertsTitle: "సక్రియ హెచ్చరిక నోటిఫికేషన్‌లు",
    alertDismissAll: "అన్ని నోటిఫికేషన్‌లను తొలగించు",
    alertCritical: "తీవ్రమైనది",
    alertWarning: "హెచ్చరిక",
    alertInfo: "సమాచారం",
    alertTimeJustNow: "ఇప్పుడే",
    alertTime10m: "10 నిమిషాల క్రితం",
    alertTime1h: "1 గంట క్రితం",
    alertTime4h: "4 గంటల క్రితం",

    // Drone Monitoring Page
    droneHeader: "డ్రోన్ వైమానిక పర్యవేక్షణ",
    droneStatus: "డ్రోన్ టెలిమెట్రీ: ఆన్‌లైన్ (ఆటో-పెట్రోల్ మోడ్)",
    altitudeLabel: "ఎత్తు (ఆల్టిట్యూడ్)",
    speedLabel: "వేగం (స్పీడ్)",
    batteryLabel: "బ్యాటరీ",
    coverageLabel: "పొలం కవరేజ్",
    viewNormal: "సాధారణ కెమెరా ఫీడ్",
    viewNDVI: "NDVI (పంట ఒత్తిడి సూచిక)",
    affectedZonesHeader: "గుర్తించిన సమస్యాత్మక ప్రాంతాలు",
    zoneRedText: "జోన్ C: శిలీంద్ర వ్యాప్తి కనుగొనబడింది. 12% పంట ఒత్తిడి. స్థానిక శిలీంద్రనాశని పిచికారీ సిఫార్సు చేయబడింది.",
    zoneYellowText: "జోన్ B: నేల తేమ లోపం. థర్మల్ స్కాన్ ద్వారా వేడి ఒత్తిడి సూచించబడింది.",
    mapLayoutTitle: "పొలం ఫ్లైట్ గ్రిడ్ లేఅవుట్",

    // Farmer Profile Page
    profileHeader: "రైతు & భూమి ప్రొఫైల్",
    farmerDetailsTitle: "రైతు వివరాలు",
    farmDetailsTitle: "పొలం వివరాలు",
    farmerNameLabel: "రైతు పేరు",
    farmerPhoneLabel: "ఫోన్ నెంబర్",
    farmLocationLabel: "గ్రామం / నివాసం",
    farmCropLabel: "ప్రధాన పంట రకం",
    farmSizeLabel: "సాగు భూమి (ఎకరాలు)",
    soilTypeLabel: "నేల రకం",
    saveProfileBtn: "ప్రొఫైల్ అప్‌డేట్ చేయి",
    saveSuccessMsg: "ప్రొఫైల్ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!",
    detectionHistoryTitle: "పంట పరీక్షల చరిత్ర",
    historyEmpty: "గతంలో ఎలాంటి పరీక్షలు జరగలేదు. తెగుళ్ల గుర్తింపు విభాగంలో స్కాన్ చేయండి.",
    historyClearBtn: "చరిత్రను తొలగించు",

    // Weather Widget
    weatherTitle: "స్థానిక వాతావరణ కేంద్రం",
    weatherToday: "ఈరోజు",
    weatherForecast: "3-రోజుల పంట వాతావరణ అంచనా",
    weatherAdvisory: "వ్యవసాయ సలహా",
    weatherAdviseText: "పొడి వాతావరణం ఉంటుంది. పంట కోయడానికి లేదా ఎరువులు చల్లడానికి అనుకూల సమయం. తీవ్రమైన వేడి కారణంగా మధ్యాహ్నం పనులను నివారించండి.",

    // AI Chatbot
    botHeader: "కృషి AI సహాయకుడు",
    botPlaceholder: "కృషి AI ని అడగండి (ఉదా: 'ఆకు తుప్పు తెగులు నివారణ ఎలా?')...",
    botSendBtn: "పంపు",
    botVoiceActive: "వింటున్నాను... మాట్లాడండి.",
    botVoiceInactive: "వాయిస్ ఇన్‌పుట్ ప్రారంభించండి",
    botGreeting: "నమస్కారం! నేను కృషి AI వ్యవసాయ సహాయకుడిని. పంట తెగుళ్లు, ఎరువులు లేదా నీటి యాజమాన్యం గురించి నన్ను ఏదైనా అడగండి.",
    botReplyDefault: "నేను మీ ప్రశ్నను విశ్లేషిస్తున్నాను. మంచి దిగుబడి కోసం మీ పొలం తేమ 40% పైన ఉండేలా చూసుకోండి. తెగుళ్లను గుర్తించడానికి Disease Detection ట్యాబ్ లో ఆకును స్కాన్ చేయండి.",
    botReplyBlast: "వరి అగ్గి తెగులు శిలీంద్రం వల్ల వస్తుంది. నత్రజని అధికంగా వాడొద్దు, ట్రైసైక్లాజోల్ 75% WP పిచికారీ చేయండి, పొలాన్ని శుభ్రంగా ఉంచండి.",
    botReplyMoisture: "వరి పంట నిండుగా నీరు ఉండడానికి ఇష్టపడుతుంది. కూరగాయలకు 40% నుండి 60% తేమ అవసరం. ఉదయాన్నే నీరు పెట్టడానికి ప్రయత్నించండి.",
    botReplyBlight: "టమోటా ఎర్లీ బ్లైట్ నివారణకు కింద ఉన్న రోగగ్రస్త ఆకులను కత్తిరించి, రాగి శిలీంద్ర నాశని లేదా వేప నూనెను పిచికారీ చేయండి.",
    botReplyRust: "గోధుమ ఆకు తుప్పు చాలా త్వరగా వ్యాపిస్తుంది. ప్రొపికోనాజోల్ లేదా టెబుకోనాజోల్ వెంటనే పిచికారీ చేసి, తదుపరి సారి తెగులు తట్టుకునే విత్తనాలు వాడండి.",
  }
};

// Make it available on window object
window.translations = translations;
