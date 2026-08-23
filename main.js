// main.js (司令塔・初期化モジュール) - 189地点完全網羅・自動★判定・安全設計版

window.defaultLayerSettings = {
    // ... [前回と同じデザイン設定のため省略。変更不要です] ...
    canvasBg: { fill: "#f5f3eb" },
    baseSvg: { stroke: "", opacity: 0.8 },
    lunarShadow: { fill: "#000000", opacity: 0.03 },
    astroPins: { fill: "#d4af37", stroke: "#d4af37", strokeWidth: 1.2, opacity: 1, scale: 1, radiusOffset: 0 },
    dateLines: { stroke: "#555555", strokeWidth: 1.5, opacity: 1 },
    lunarMansion: {
        strokeWidth: 0.5, opacity: 0.5, fontFamily: "'Shippori Mincho', 'YuMincho', serif", fontSize: 9,
        colorEast: "#888888", colorSouth: "#888888", colorWest: "#888888", colorNorth: "#888888",
        starSize: 1.5, bgRingColor: "#ffffff", bgRingOpacity: 0.05
    },
    tideGraph: { stroke: "#3b82f6", strokeWidth: 1.5, opacity: 1 },
    rainGraph: { stroke: "rgba(14, 165, 233, 0.8)", strokeWidth: 1.5, opacity: 1 },
    dailyRainBg: { fill: "rgba(14, 165, 233, 1)", opacity: 1, density: 0.35 },
    dailyRainText: { fontFamily: "'Arial', sans-serif", fontSize: 8, fill: "rgba(14, 165, 233, 1)", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    guideTime: { fontFamily: "'Shippori Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif", fontSize: 7, fill: "#2c3e50", fontWeight: "bold", stroke: "rgba(255, 255, 255, 0.5)", strokeWidth: 3, opacity: 1, offsetRadius: 0 },
    guideTideLine: { stroke: "rgba(114, 113, 113, 0.4)", strokeWidth: 0.5, opacity: 1 },
    guideTideText: { fontFamily: "'Shippori Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif", fontSize: 7, fill: "#3b82f6", fontWeight: "bold", stroke: "rgba(255, 255, 255, 0.5)", strokeWidth: 3, opacity: 1, offsetRadius: 0 },
    guideRainLine: { stroke: "rgba(14, 165, 233, 0.3)", strokeWidth: 1, opacity: 1 },
    guideRainText: { fontFamily: "'Shippori Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif", fontSize: 7, fill: "rgba(14, 165, 233, 1)", fontWeight: "bold", stroke: "rgba(255, 255, 255, 0.5)", strokeWidth: 2.5, opacity: 1, offsetRadius: 0 },
    gregorian: { fontFamily: "'Shippori Mincho', serif", fontSize: 9, fill: "#727171", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    weekday: { fontFamily: "'Shippori Mincho', serif", fontSize: 6, fill: "#b0b0b0", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0, lang: "en" },
    sekki: { fontFamily: "'Shippori Mincho', serif", fontSize: 19, fill: "#2c3e50", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    kou: { fontFamily: "'Shippori Mincho', serif", fontSize: 14, fill: "#2c3e50", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    wafuText: { fontFamily: "'Shippori Mincho', serif", fontSize: 70, fill: "#d4af37", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    gregorianText: { fontFamily: "'Shippori Mincho', serif", fontSize: 40, fill: "#b0b0b0", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    holiday: { fontFamily: "'Shippori Mincho', serif", fontSize: 6.5, fill: "#d25b4e", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    zassetsu: { fontFamily: "'Shippori Mincho', serif", fontSize: 6, fill: "#727171", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    important: { fontFamily: "'Shippori Mincho', serif", fontSize: 6, fill: "#2c3e50", fontWeight: "bold", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    eventShinto: { fontFamily: "'Shippori Mincho', serif", fontSize: 6.5, fill: "#1e3a8a", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    eventBuddhism: { fontFamily: "'Shippori Mincho', serif", fontSize: 6.5, fill: "#3f3d56", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    eventChurch: { fontFamily: "'Shippori Mincho', serif", fontSize: 6.5, fill: "#6b5b4e", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    eventSonota: { fontFamily: "'Shippori Mincho', serif", fontSize: 6.5, fill: "#555555", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 0 },
    haikuText: { fontFamily: "'Shippori Mincho', serif", fontSize: 8, fill: "#2c3e50", fontWeight: "normal", stroke: "#ffffff", strokeWidth: 0, opacity: 1, offsetRadius: 40 },
    lunar: {
        fontFamily: "'Shippori Mincho', serif", fontSize: 11, fontWeight: "normal", opacity: 1, offsetRadius: 0,
        phases: {
            normal:       { shape: "none", fill: "#2c3e50", bgFill: "transparent", shapeStroke: "#555555", shapeStrokeWidth: 0, scale: 1 },
            newMoon:      { shape: "circle", fill: "#d4af37", bgFill: "transparent", shapeStroke: "#d4af37", shapeStrokeWidth: 1.2, scale: 1 },
            firstQuarter: { shape: "none", fill: "#2c3e50", bgFill: "transparent", shapeStroke: "#555555", shapeStrokeWidth: 0, scale: 1 },
            fullMoon:     { shape: "none", fill: "#2c3e50", bgFill: "transparent", shapeStroke: "#555555", shapeStrokeWidth: 0, scale: 1 },
            lastQuarter:  { shape: "none", fill: "#2c3e50", bgFill: "transparent", shapeStroke: "#555555", shapeStrokeWidth: 0, scale: 1 }
        }
    }
};

window.haikuDatabase = {}; 
// ... [isObject, mergeDeep, parseCSVRow などの便利関数は以前のまま省略] ...

function parseCSVRow(str) {
    const result = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === '"') {
            if (inQuotes && str[i+1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) { result.push(current); current = ''; } 
        else current += c;
    }
    result.push(current);
    return result.map(s => s.trim());
}

function formatDateStr(dateObj) {
    const y = dateObj.getFullYear(), m = String(dateObj.getMonth() + 1).padStart(2, '0'), d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const standardizeDateKey = (rawStr) => rawStr.replace(/\//g, '-').split('-').map(p => p.length === 1 ? '0'+p : p).join('-');

window.appSettings = JSON.parse(localStorage.getItem('polarCalendarSettingsV5')) || { global: JSON.parse(JSON.stringify(window.defaultLayerSettings)), months: {} };
window.layerSettings = {}; 

window.loadSettingsForCycle = function(cycleIdx) {
    let base = mergeDeep(JSON.parse(JSON.stringify(window.defaultLayerSettings)), JSON.parse(JSON.stringify(window.appSettings.global)));
    let monthData = window.appSettings.months[`cycle_${cycleIdx}`];
    window.layerSettings = monthData ? mergeDeep(base, monthData) : base;
};

// ... [各種設定保存関数は以前のまま] ...

let koyomiDatabase = {};
const KOYOMI_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRqoX31YV0YAO3Mq4WatmLhjP7uUSF6dPMy3D2H3ktEFDFg1X1gJmoIXkul9JpS4aLgK9Ze3SSbV9BZ/pub?gid=0&single=true&output=csv';
const HAIKU_CSV_URL = 'https://docs.google.com/spreadsheets/d/1m0y8AOJNx1Ad4I44poPheQAQNki1-QQIwi9wSw8jaBg/export?format=csv&gid=126185184';

// ▼ 天気APIと潮汐CSVの両方を取得する関数（データがない場合の安全処理付き） ▼
async function fetchMeteoAndTideData(startDateMs) {
    const dStart = new Date(startDateMs);
    const dEnd = new Date(startDateMs + 30 * 86400000);
    
    // データリセット
    apiRainData = new Array(720).fill(null);
    localRainData = {}; 
    highLowTidePoints = []; 
    
    const sDate = formatDateStr(dStart);
    const eDate = formatDateStr(dEnd);
    const targetYear = dStart.getFullYear(); 

    // 1. 天気API（Open-Meteo）の取得
    const isHistorical = dEnd.getTime() < Date.now() - (5 * 86400000);
    const weatherBaseUrl = isHistorical ? 'https://archive-api.open-meteo.com/v1/archive' : 'https://api.open-meteo.com/v1/forecast';
    const rainApiUrl = `${weatherBaseUrl}?latitude=${currentLat}&longitude=${currentLon}&hourly=precipitation&daily=precipitation_sum&start_date=${sDate}&end_date=${eDate}&timezone=Asia%2FTokyo`;

    try {
        const rainRes = await fetch(rainApiUrl);
        if (rainRes.ok) {
            const json = await rainRes.json();
            if(json.hourly && json.hourly.precipitation) {
                for(let i=0; i<720; i++) apiRainData[i] = json.hourly.precipitation[i] || 0;
            }
            if(json.daily && json.daily.precipitation_sum && json.daily.time) {
                json.daily.time.forEach((t, idx) => {
                    localRainData[standardizeDateKey(t)] = json.daily.precipitation_sum[idx] || 0;
                });
            }
        }
    } catch(e) { console.error("Weather API Error:", e); }

    // 2. 潮汐CSV（ローカル）の取得
    const station = TIDE_STATIONS[currentTideStationIndex];
    const csvFileName = `tides/tide_${station.code}_${targetYear}.csv`; 
    
    let tideDataFound = false;

    try {
        const tideRes = await fetch(csvFileName);
        if (tideRes.ok) {
            const tideTxt = await tideRes.text();
            const lines = tideTxt.split('\n');
            
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length >= 3) {
                    const dateStr = standardizeDateKey(parts[0]);
                    const timeMs = new Date(`${dateStr}T${parts[1].trim()}:00+09:00`).getTime();
                    
                    if (timeMs >= startDateMs && timeMs <= startDateMs + 30 * 86400000) {
                        const tide = parseFloat(parts[2].trim());
                        if (!isNaN(timeMs) && !isNaN(tide)) {
                            highLowTidePoints.push({ time: timeMs, tide: tide });
                        }
                    }
                }
            }
            if (highLowTidePoints.length > 0) {
                highLowTidePoints.sort((a, b) => a.time - b.time);
                tideDataFound = true;
            }
        }
    } catch(e) {
        // Fetch自体が失敗（ファイルがない等）した場合のキャッチ
    }

    // データが1件も見つからなかった場合はステータスバーで通知
    const sb = document.getElementById('status-bar');
    if (sb) {
        if (!tideDataFound) {
            sb.innerText = `⚠️ ${station.name} (${station.code}) のデータがありません (tidesフォルダにCSVを追加してください)`;
            sb.style.color = "#ff8888";
        } else {
            sb.innerText = `✅ ${station.name} のデータを読み込みました`;
            sb.style.color = "#38bdf8";
        }
    }
}

// ... [loadAllData などの関数は以前のまま] ...
async function loadAllData() {
    const fetchCSV = async (url) => {
        try {
            const res = await fetch(url);
            return res.ok ? await res.text() : null;
        } catch(e) { return null; }
    };

    const [koyomiTxt, haikuTxt] = await Promise.all([
        fetchCSV(KOYOMI_CSV_URL), fetchCSV(HAIKU_CSV_URL)
    ]);

    if (koyomiTxt) {
        const lines = koyomiTxt.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVRow(lines[i]);
            if (row[0]) koyomiDatabase[standardizeDateKey(row[0])] = row;
        }
    }

    if (haikuTxt) {
        const lines = haikuTxt.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVRow(lines[i]);
            if (row.length > 11 && row[1] === "西田上酢" && row[10] === "完成句" && row[11]) {
                const dateKey = standardizeDateKey(row[11]);
                if (!window.haikuDatabase[dateKey]) window.haikuDatabase[dateKey] = [];
                window.haikuDatabase[dateKey].push(row[0]);
            }
        }
    }
}

async function updateCalendarCycle() {
    window.loadSettingsForCycle(currentCycle);
    document.body.style.backgroundColor = window.layerSettings.canvasBg.fill;

    const estimatedStartTimeMs = baseDate.getTime() + (currentCycle * synodicMonth) * 86400000;
    let startDate = new Date(estimatedStartTimeMs);

    for (let offset = -3; offset <= 3; offset++) {
        const checkDate = new Date(estimatedStartTimeMs + offset * 86400000);
        const dbRow = koyomiDatabase[formatDateStr(checkDate)];
        if (dbRow && dbRow[1] && dbRow[1].includes("月一日")) {
            startDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
            break;
        }
    }

    const cycleStartTimeMs = startDate.getTime();
    currentStartSegment = Math.round(((cycleStartTimeMs - baseDate.getTime()) / 86400000 % 30) / 0.25) % 120;
    if (currentStartSegment < 0) currentStartSegment += 120;
    globalRotation = -currentStartSegment * 3;

    const targetYear = startDate.getFullYear();
    const cycleDisplay = document.getElementById('cycleDisplay');
    if (cycleDisplay) cycleDisplay.innerHTML = `${targetYear}年 ${startDate.getMonth() + 1}月 <span style="font-size:10px;">▼</span><br><span style="font-size:11px; color:#8b949e;">新月: ${startDate.getMonth() + 1}月${startDate.getDate()}日〜</span>`;

    // ★ 表示する「年」が変わった場合は、CSVがあるか裏側でチェックしてプルダウンを更新
    if (window.lastCheckedTideYear !== targetYear) {
        if (typeof window.checkAvailableTides === 'function') {
            window.checkAvailableTides(targetYear);
        }
        window.lastCheckedTideYear = targetYear;
    }

    computeMonthDays(startDate);
    
    // API天気とローカル潮汐CSVを取得
    await fetchMeteoAndTideData(cycleStartTimeMs);

    drawLunarShadow(cycleStartTimeMs);
    drawAstronomicalPins(cycleStartTimeMs);
    drawDynamicLines();
    // データがない場合は highLowTidePoints が空のまま drawTideGraph が呼ばれるため、エラーなく空白になります
    drawTideGraph(cycleStartTimeMs); 
    drawDailyRainStats(startDate);   
    drawLunarMansions(cycleStartTimeMs);
    renderSavedData();
    drawTimeLabels();
    drawKoyomiEvents(startDate);
    drawHaikus(startDate);
    drawRainfallGraph(cycleStartTimeMs);

    if (masterGroup) masterGroup.setAttribute('transform', `rotate(${globalRotation}, ${cx}, ${cy})`);

    if (bgGroup) {
        const stBase = window.layerSettings.baseSvg;
        bgGroup.style.opacity = stBase.opacity;
        Array.from(bgGroup.querySelectorAll('*')).forEach(el => {
            if (stBase.stroke) el.setAttribute('stroke', stBase.stroke);
            else {
                const orig = el.getAttribute('data-orig-stroke');
                if (orig) el.setAttribute('stroke', orig);
                else el.removeAttribute('stroke');
            }
        });
    }
}

async function initApp() {
    initUI();
    await loadAllData();

    try {
        const svgResponse = await fetch('calendar.svg');
        const svgCode = await svgResponse.text();
        
        if (container) container.innerHTML = svgCode;
        svg = container.querySelector('svg');
        if (!svg) return;
        
        // ... [以降、SVG初期化の定型処理は以前と全く同じため省略。そのまま活かしてください] ...
