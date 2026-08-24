// globals.js (全体のデータと状態の管理) - 最終完成版

const container = document.getElementById('container');
const statusBar = document.getElementById('status-bar');

const loader = document.createElement('div');
loader.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,17,26,0.8); z-index:999; display:flex; justify-content:center; align-items:center; color:#d4af37; font-size:24px; font-weight:bold; backdrop-filter:blur(5px); display:none;";
loader.innerHTML = "☁️ 観測データを統合中...";
document.body.appendChild(loader);

let svg, masterGroup, bgGroup;
let viewBox = { x: -479.3141, y: -208.5241, w: 2800, h: 2800 };
const cx = 920.6859;
const cy = 1191.4759;
const svgNS = "http://www.w3.org/2000/svg";

let currentTool = 'pointer'; 
let interactionMode = 'pan'; 
let activeBrush = "#38bdf8"; 
let globalRotation = 0; 

let calendarData = JSON.parse(localStorage.getItem('polarCalendarDataV27')) || {};
let concentricRings = []; 

// ▼ 雨（降水量）用の地名（検索ボックスの初期値） ▼
let currentLocationName = "今治"; 

// ＝★＝★＝★＝★＝★＝★＝★＝★＝★＝★＝
// ▼ 潮汐（CSV）用の観測所リスト ▼
// あなたが用意した「189箇所の正確な座標データ」を、ここの配列（[ ]の中身）と丸ごと差し替えてください。
// ＝★＝★＝★＝★＝★＝★＝★＝★＝★＝★＝
const TIDE_STATIONS = [
    {code: 'WN', name: '稚内', lat: 35.68, lon: 139.76}, 
    {code: 'KE', name: '枝幸', lat: 35.68, lon: 139.76}, 
    {code: 'A0', name: '紋別', lat: 35.68, lon: 139.76}, 
    // ... （以下省略していますが、あなたの持つ全地点データでここを上書きしてください）...
    {code: 'FK', name: '深浦', lat: 35.68, lon: 139.76}
];

let currentTideStationIndex = TIDE_STATIONS.findIndex(s => s.code === 'D8');
if (currentTideStationIndex === -1) currentTideStationIndex = 0;

const baseDate = new Date(2026, 7, 13);
const synodicMonth = 29.530589;
let currentCycle = 0; 
let currentStartSegment = 0; 

let localRainData = {};
let apiRainData = [];
let highLowTidePoints = []; 

// ▼ 天文学計算用エンジン (SunCalc 完全数学的修正版) ▼
const PI = Math.PI, rad = PI / 180.0, e = rad * 23.4397;
function toJulian(date) { return date.valueOf() / 86400000 - 0.5 + 2440588; }
function fromJulian(j) { return new Date((j + 0.5 - 2440588) * 86400000); }
function toDays(date) { return toJulian(date) - 2451545; }
function rightAscension(l, b) { return Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)); }
function declination(l, b) { return Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)); }
function azimuth(H, phi, dec) { return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)); }
function altitude(H, phi, dec) { return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)); }
function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
function eclipticLongitude(M) {
    var C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)), P = rad * 102.9372;
    return M + C + P + PI;
}
function sunCoords(d) {
    var M = solarMeanAnomaly(d), L = eclipticLongitude(M);
    return { dec: declination(L, 0), ra: rightAscension(L, 0) };
}

function moonCoords(d) {
    var L = rad * (218.316 + 13.176396 * d);
    var M = rad * (134.963 + 13.064993 * d);
    var F = rad * (93.272 + 13.229350 * d);
    var l = L + rad * 6.289 * Math.sin(M);
    var b = rad * 5.128 * Math.sin(F);
    var dt = 385001 - 20905 * Math.cos(M);
    return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt };
}

function getTimes(date, lat, lng, height) {
    var lw = rad * -lng, phi = rad * lat, d = toDays(date);
    var n = Math.round(d - 0.0009 - lw / (2 * PI));
    var h0 = -0.0053 - 2.076 * Math.sqrt(height || 0) / 60;
    var c = sunCoords(d + n);
    var val = (Math.sin(h0) - Math.sin(phi) * Math.sin(c.dec)) / (Math.cos(phi) * Math.cos(c.dec));
    if (val > 1) val = 1; if (val < -1) val = -1;
    var H = Math.acos(val);
    var Jnoon = 2451545 + 0.0009 + lw / (2 * PI) + n; 
    var Jset = Jnoon + H / (2 * PI), Jrise = Jnoon - H / (2 * PI);
    return { sunrise: fromJulian(Jrise), sunset: fromJulian(Jset) };
}

function getMoonTimes(date, lat, lng) {
    var t = new Date(date); t.setHours(0, 0, 0, 0);
    var hc = 0.133 * rad, h0 = getMoonPosition(t, lat, lng).altitude - hc, h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
    for (var i = 1; i <= 24; i += 2) {
        h1 = getMoonPosition(new Date(t.valueOf() + i * 3600000), lat, lng).altitude - hc;
        h2 = getMoonPosition(new Date(t.valueOf() + (i + 1) * 3600000), lat, lng).altitude - hc;
        
        a = (h0 + h2) / 2 - h1; 
        b = (h2 - h0) / 2; 
        roots = 0;

        if (a === 0) {
            if (b !== 0) {
                x1 = -h1 / b;
                if (Math.abs(x1) <= 1) roots++;
            }
        } else {
            xe = -b / (2 * a); 
            ye = (a * xe + b) * xe + h1; 
            d = b * b - 4 * a * h1; 
            if (d >= 0) {
                dx = Math.sqrt(d) / (Math.abs(a) * 2);
                x1 = xe - dx; 
                x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2;
            }
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1; else set = i + x1;
        } else if (roots === 2) {
            if (ye < 0) { rise = i + x2; set = i + x1; }
            else { rise = i + x1; set = i + x2; }
        }
        if (rise && set) break; 
        h0 = h2;
    }
    var result = {};
    if (rise) result.rise = new Date(t.valueOf() + rise * 3600000);
    if (set) result.set = new Date(t.valueOf() + set * 3600000);
    return result;
}

function getMoonPosition(date, lat, lng) {
    var lw = rad * -lng, phi = rad * lat, d = toDays(date), c = moonCoords(d), H = siderealTime(d, lw) - c.ra;
    var h = altitude(H, phi, c.dec), pa = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H));
    h = h + rad * 0.017 / Math.tan(h + rad * 10.26 / (h + rad * 5.10));
    return { azimuth: azimuth(H, phi, c.dec), altitude: h, distance: c.dist, parallacticAngle: pa };
}

// UIアイコン群
const iconPan = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`;
const iconRotate = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
const iconPaint = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;
const iconErase = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20H20V20Z"/><line x1="6" y1="11" x2="15" y2="20"/></svg>`;
const iconTrash = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const iconHome = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const iconPrint = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;
const iconDrop = `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
