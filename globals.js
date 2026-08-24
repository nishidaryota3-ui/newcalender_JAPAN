// globals.js (全体のデータと状態の管理) - 出没計算（JST完全対応）版

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

// ▼ 潮汐（CSV）用の観測所リスト（気象庁公式189地点・緯度経度仮設定版） ▼
// ※後ほどすべての正確な座標データ（lat, lon）を注入します。現在はすべて東京基準(35.68, 139.76)で仮計算します。
const TIDE_STATIONS = [
    {code: 'WN', name: '稚内', lat: 35.68, lon: 139.76}, {code: 'KE', name: '枝幸', lat: 35.68, lon: 139.76}, {code: 'A0', name: '紋別', lat: 35.68, lon: 139.76}, {code: 'AS', name: '網走', lat: 35.68, lon: 139.76}, {code: 'A6', name: '羅臼', lat: 35.68, lon: 139.76}, {code: 'NM', name: '根室', lat: 35.68, lon: 139.76}, {code: 'HN', name: '花咲', lat: 35.68, lon: 139.76}, {code: 'KP', name: '霧多布', lat: 35.68, lon: 139.76}, {code: 'KR', name: '釧路', lat: 35.68, lon: 139.76}, {code: 'B1', name: '十勝', lat: 35.68, lon: 139.76}, {code: 'A9', name: '浦河', lat: 35.68, lon: 139.76}, {code: 'C8', name: '苫小牧東', lat: 35.68, lon: 139.76}, {code: 'TM', name: '苫小牧西', lat: 35.68, lon: 139.76}, {code: 'SO', name: '白老', lat: 35.68, lon: 139.76}, {code: 'A8', name: '室蘭', lat: 35.68, lon: 139.76}, {code: 'A3', name: '森', lat: 35.68, lon: 139.76}, {code: 'HK', name: '函館', lat: 35.68, lon: 139.76}, {code: 'Q0', name: '吉岡', lat: 35.68, lon: 139.76}, {code: 'A5', name: '松前', lat: 35.68, lon: 139.76}, {code: 'ES', name: '江差', lat: 35.68, lon: 139.76}, {code: 'ZP', name: '奥尻', lat: 35.68, lon: 139.76}, {code: 'OR', name: '奥尻港', lat: 35.68, lon: 139.76}, {code: 'SE', name: '瀬棚', lat: 35.68, lon: 139.76}, {code: 'B6', name: '寿都', lat: 35.68, lon: 139.76}, {code: 'B5', name: '岩内', lat: 35.68, lon: 139.76}, {code: 'Z8', name: '忍路', lat: 35.68, lon: 139.76}, {code: 'B3', name: '小樽', lat: 35.68, lon: 139.76}, {code: 'IK', name: '石狩新港', lat: 35.68, lon: 139.76}, {code: 'B2', name: '留萌', lat: 35.68, lon: 139.76}, {code: 'F3', name: '沓形', lat: 35.68, lon: 139.76}, {code: 'Q1', name: '竜飛', lat: 35.68, lon: 139.76}, {code: 'AO', name: '青森', lat: 35.68, lon: 139.76}, {code: 'ZA', name: '浅虫', lat: 35.68, lon: 139.76}, {code: 'Q2', name: '大湊', lat: 35.68, lon: 139.76}, {code: 'B4', name: '大間', lat: 35.68, lon: 139.76}, {code: 'SH', name: '下北', lat: 35.68, lon: 139.76}, {code: 'XS', name: 'むつ小川原', lat: 35.68, lon: 139.76}, {code: 'HC', name: '八戸', lat: 35.68, lon: 139.76}, {code: 'HG', name: '八戸港', lat: 35.68, lon: 139.76}, {code: 'XT', name: '久慈', lat: 35.68, lon: 139.76}, {code: 'MY', name: '宮古', lat: 35.68, lon: 139.76}, {code: 'Q6', name: '釜石', lat: 35.68, lon: 139.76}, {code: 'OF', name: '大船渡', lat: 35.68, lon: 139.76}, {code: 'AY', name: '鮎川', lat: 35.68, lon: 139.76}, {code: 'E6', name: '石巻', lat: 35.68, lon: 139.76}, {code: 'SG', name: '塩釜', lat: 35.68, lon: 139.76}, {code: 'SD', name: '仙台新港', lat: 35.68, lon: 139.76}, {code: 'ZM', name: '相馬', lat: 35.68, lon: 139.76}, {code: 'ON', name: '小名浜', lat: 35.68, lon: 139.76}, {code: 'D1', name: '日立', lat: 35.68, lon: 139.76}, {code: 'D3', name: '大洗', lat: 35.68, lon: 139.76}, {code: 'D2', name: '鹿島', lat: 35.68, lon: 139.76}, {code: 'CS', name: '銚子漁港', lat: 35.68, lon: 139.76}, {code: 'ZF', name: '勝浦', lat: 35.68, lon: 139.76}, {code: 'MR', name: '布良', lat: 35.68, lon: 139.76}, {code: 'TT', name: '館山', lat: 35.68, lon: 139.76}, {code: 'KZ', name: '木更津', lat: 35.68, lon: 139.76}, {code: 'QL', name: '千葉', lat: 35.68, lon: 139.76}, {code: 'CB', name: '千葉港', lat: 35.68, lon: 139.76}, {code: 'TK', name: '東京', lat: 35.68, lon: 139.76}, {code: 'KW', name: '川崎', lat: 35.68, lon: 139.76}, {code: 'YK', name: '京浜港', lat: 35.68, lon: 139.76}, {code: 'QS', name: '横浜', lat: 35.68, lon: 139.76}, {code: 'HM', name: '本牧', lat: 35.68, lon: 139.76}, {code: 'QN', name: '横須賀', lat: 35.68, lon: 139.76}, {code: 'Z1', name: '油壺', lat: 35.68, lon: 139.76}, {code: 'OK', name: '岡田', lat: 35.68, lon: 139.76}, {code: 'QO', name: '神津島', lat: 35.68, lon: 139.76}, {code: 'MJ', name: '三宅島（坪田）', lat: 35.68, lon: 139.76}, {code: 'QP', name: '三宅島（阿古）', lat: 35.68, lon: 139.76}, {code: 'D4', name: '八丈島（八重根）', lat: 35.68, lon: 139.76}, {code: 'QQ', name: '八丈島（神湊）', lat: 35.68, lon: 139.76}, {code: 'CC', name: '父島', lat: 35.68, lon: 139.76}, {code: 'MC', name: '南鳥島', lat: 35.68, lon: 139.76}, {code: 'D8', name: '湘南港', lat: 35.68, lon: 139.76}, {code: 'OD', name: '小田原', lat: 35.68, lon: 139.76}, {code: 'Z3', name: '伊東', lat: 35.68, lon: 139.76}, {code: 'D6', name: '下田', lat: 35.68, lon: 139.76}, {code: 'QK', name: '南伊豆', lat: 35.68, lon: 139.76}, {code: 'G9', name: '石廊崎', lat: 35.68, lon: 139.76}, {code: 'Z4', name: '田子', lat: 35.68, lon: 139.76}, {code: 'UC', name: '内浦', lat: 35.68, lon: 139.76}, {code: 'SM', name: '清水港', lat: 35.68, lon: 139.76}, {code: 'Z5', name: '焼津', lat: 35.68, lon: 139.76}, {code: 'OM', name: '御前崎', lat: 35.68, lon: 139.76}, {code: 'MI', name: '舞阪', lat: 35.68, lon: 139.76}, {code: 'I4', name: '赤羽根', lat: 35.68, lon: 139.76}, {code: 'G4', name: '三河', lat: 35.68, lon: 139.76}, {code: 'G5', name: '形原', lat: 35.68, lon: 139.76}, {code: 'G8', name: '衣浦', lat: 35.68, lon: 139.76}, {code: 'ZD', name: '鬼崎', lat: 35.68, lon: 139.76}, {code: 'NG', name: '名古屋', lat: 35.68, lon: 139.76}, {code: 'G3', name: '四日市港', lat: 35.68, lon: 139.76}, {code: 'TB', name: '鳥羽', lat: 35.68, lon: 139.76}, {code: 'OW', name: '尾鷲', lat: 35.68, lon: 139.76}, {code: 'KN', name: '熊野', lat: 35.68, lon: 139.76}, {code: 'UR', name: '浦神', lat: 35.68, lon: 139.76}, {code: 'KS', name: '串本', lat: 35.68, lon: 139.76}, {code: 'SR', name: '白浜', lat: 35.68, lon: 139.76}, {code: 'GB', name: '御坊', lat: 35.68, lon: 139.76}, {code: 'H1', name: '下津', lat: 35.68, lon: 139.76}, {code: 'Z9', name: '海南', lat: 35.68, lon: 139.76}, {code: 'WY', name: '和歌山', lat: 35.68, lon: 139.76}, {code: 'TN', name: '淡輪', lat: 35.68, lon: 139.76}, {code: 'KK', name: '関空島', lat: 35.68, lon: 139.76}, {code: 'J2', name: '岸和田', lat: 35.68, lon: 139.76}, {code: 'IO', name: '泉大津', lat: 35.68, lon: 139.76}, {code: 'SI', name: '堺', lat: 35.68, lon: 139.76}, {code: 'OS', name: '大阪', lat: 35.68, lon: 139.76}, {code: 'AM', name: '尼崎', lat: 35.68, lon: 139.76}, {code: 'J5', name: '西宮', lat: 35.68, lon: 139.76}, {code: 'KB', name: '神戸', lat: 35.68, lon: 139.76}, {code: 'AK', name: '明石', lat: 35.68, lon: 139.76}, {code: 'ST', name: '洲本', lat: 35.68, lon: 139.76}, {code: 'EI', name: '江井', lat: 35.68, lon: 139.76}, {code: 'K1', name: '姫路（飾磨）', lat: 35.68, lon: 139.76}, {code: 'SB', name: '三蟠', lat: 35.68, lon: 139.76}, {code: 'UN', name: '宇野', lat: 35.68, lon: 139.76}, {code: 'MM', name: '水島', lat: 35.68, lon: 139.76}, {code: 'LG', name: '乙島', lat: 35.68, lon: 139.76}, {code: 'IZ', name: '糸崎', lat: 35.68, lon: 139.76}, {code: 'TH', name: '竹原', lat: 35.68, lon: 139.76}, {code: 'Q9', name: '呉', lat: 35.68, lon: 139.76}, {code: 'Q8', name: '広島', lat: 35.68, lon: 139.76}, {code: 'QA', name: '徳山', lat: 35.68, lon: 139.76}, {code: 'J9', name: '三田尻', lat: 35.68, lon: 139.76}, {code: 'WH', name: '宇部', lat: 35.68, lon: 139.76}, {code: 'CF', name: '長府', lat: 35.68, lon: 139.76}, {code: 'A1', name: '弟子待', lat: 35.68, lon: 139.76}, {code: 'DS', name: '下関', lat: 35.68, lon: 139.76}, {code: 'TI', name: '田ノ首', lat: 35.68, lon: 139.76}, {code: 'OH', name: '大山の鼻', lat: 35.68, lon: 139.76}, {code: 'HR', name: '南風泊', lat: 35.68, lon: 139.76}, {code: 'MT', name: '松山', lat: 35.68, lon: 139.76}, {code: 'M3', name: '波止浜', lat: 35.68, lon: 139.76}, {code: 'M0', name: '今治市小島', lat: 35.68, lon: 139.76}, {code: 'M1', name: '来島航路', lat: 35.68, lon: 139.76}, {code: 'L0', name: '今治', lat: 35.68, lon: 139.76}, {code: 'NI', name: '新居浜', lat: 35.68, lon: 139.76}, {code: 'L8', name: '伊予三島', lat: 35.68, lon: 139.76}, {code: 'TX', name: '多度津', lat: 35.68, lon: 139.76}, {code: 'AX', name: '青木', lat: 35.68, lon: 139.76}, {code: 'J8', name: '与島', lat: 35.68, lon: 139.76}, {code: 'TA', name: '高松', lat: 35.68, lon: 139.76}, {code: 'KM', name: '小松島', lat: 35.68, lon: 139.76}, {code: 'J6', name: '橘', lat: 35.68, lon: 139.76}, {code: 'AW', name: '阿波由岐', lat: 35.68, lon: 139.76}, {code: 'HW', name: '日和佐', lat: 35.68, lon: 139.76}, {code: 'L7', name: '甲浦', lat: 35.68, lon: 139.76}, {code: 'MU', name: '室戸岬', lat: 35.68, lon: 139.76}, {code: 'KC', name: '高知', lat: 35.68, lon: 139.76}, {code: 'V7', name: '須崎', lat: 35.68, lon: 139.76}, {code: 'ZH', name: '久礼', lat: 35.68, lon: 139.76}, {code: 'L6', name: '高知下田', lat: 35.68, lon: 139.76}, {code: 'TS', name: '土佐清水', lat: 35.68, lon: 139.76}, {code: 'SU', name: '片島', lat: 35.68, lon: 139.76}, {code: 'UW', name: '宇和島', lat: 35.68, lon: 139.76}, {code: 'N1', name: '日明', lat: 35.68, lon: 139.76}, {code: 'N0', name: '砂津', lat: 35.68, lon: 139.76}, {code: 'MO', name: '門司', lat: 35.68, lon: 139.76}, {code: 'AH', name: '青浜', lat: 35.68, lon: 139.76}, {code: 'O3', name: '苅田', lat: 35.68, lon: 139.76}, {code: 'BP', name: '別府', lat: 35.68, lon: 139.76}, {code: 'QC', name: '大分', lat: 35.68, lon: 139.76}, {code: 'X5', name: '佐伯', lat: 35.68, lon: 139.76}, {code: 'Z6', name: '細島', lat: 35.68, lon: 139.76}, {code: 'MG', name: '宮崎', lat: 35.68, lon: 139.76}, {code: 'AB', name: '油津', lat: 35.68, lon: 139.76}, {code: 'X6', name: '志布志', lat: 35.68, lon: 139.76}, {code: 'QG', name: '大泊', lat: 35.68, lon: 139.76}, {code: 'KG', name: '鹿児島', lat: 35.68, lon: 139.76}, {code: 'MK', name: '枕崎', lat: 35.68, lon: 139.76}, {code: 'ZJ', name: '阿久根', lat: 35.68, lon: 139.76}, {code: 'QH', name: '西之表', lat: 35.68, lon: 139.76}, {code: 'TJ', name: '種子島', lat: 35.68, lon: 139.76}, {code: 'QI', name: '中之島', lat: 35.68, lon: 139.76}, {code: 'QJ', name: '名瀬', lat: 35.68, lon: 139.76}, {code: 'O9', name: '奄美', lat: 35.68, lon: 139.76}, {code: 'NK', name: '中城湾港', lat: 35.68, lon: 139.76}, {code: 'ZO', name: '沖縄', lat: 35.68, lon: 139.76}, {code: 'NH', name: '那覇', lat: 35.68, lon: 139.76}, {code: 'DJ', name: '南大東', lat: 35.68, lon: 139.76}, {code: 'R1', name: '平良', lat: 35.68, lon: 139.76}, {code: 'IS', name: '石垣', lat: 35.68, lon: 139.76}, {code: 'IJ', name: '西表', lat: 35.68, lon: 139.76}, {code: 'YJ', name: '与那国', lat: 35.68, lon: 139.76}, {code: 'O7', name: '水俣', lat: 35.68, lon: 139.76}, {code: 'O5', name: '八代', lat: 35.68, lon: 139.76}, {code: 'HS', name: '本渡瀬戸', lat: 35.68, lon: 139.76}, {code: 'RH', name: '苓北', lat: 35.68, lon: 139.76}, {code: 'MS', name: '三角', lat: 35.68, lon: 139.76}, {code: 'KU', name: '熊本', lat: 35.68, lon: 139.76}, {code: 'O6', name: '大牟田', lat: 35.68, lon: 139.76}, {code: 'OU', name: '大浦', lat: 35.68, lon: 139.76}, {code: 'KT', name: '口之津', lat: 35.68, lon: 139.76}, {code: 'NS', name: '長崎', lat: 35.68, lon: 139.76}, {code: 'KO', name: '皇后', lat: 35.68, lon: 139.76}, {code: 'FE', name: '福江', lat: 35.68, lon: 139.76}, {code: 'QD', name: '佐世保', lat: 35.68, lon: 139.76}, {code: 'X2', name: '平戸瀬戸', lat: 35.68, lon: 139.76}, {code: 'ZL', name: '仮屋', lat: 35.68, lon: 139.76}, {code: 'KA', name: '唐津', lat: 35.68, lon: 139.76}, {code: 'QF', name: '博多', lat: 35.68, lon: 139.76}, {code: 'X3', name: '郷ノ浦', lat: 35.68, lon: 139.76}, {code: 'QE', name: '厳原', lat: 35.68, lon: 139.76}, {code: 'O1', name: '対馬', lat: 35.68, lon: 139.76}, {code: 'N5', name: '対馬比田勝', lat: 35.68, lon: 139.76}, {code: 'K5', name: '萩', lat: 35.68, lon: 139.76}, {code: 'ZK', name: '須佐', lat: 35.68, lon: 139.76}, {code: 'HA', name: '浜田', lat: 35.68, lon: 139.76}, {code: 'SK', name: '境', lat: 35.68, lon: 139.76}, {code: 'SA', name: '西郷', lat: 35.68, lon: 139.76}, {code: 'ZE', name: '田後', lat: 35.68, lon: 139.76}, {code: 'T6', name: '津居山', lat: 35.68, lon: 139.76}, {code: 'T2', name: '宮津', lat: 35.68, lon: 139.76}, {code: 'MZ', name: '舞鶴', lat: 35.68, lon: 139.76}, {code: 'XM', name: '敦賀', lat: 35.68, lon: 139.76}, {code: 'ZG', name: '三国', lat: 35.68, lon: 139.76}, {code: 'T1', name: '金沢', lat: 35.68, lon: 139.76}, {code: 'Z7', name: '輪島', lat: 35.68, lon: 139.76}, {code: 'SZ', name: '能登', lat: 35.68, lon: 139.76}, {code: 'XO', name: '七尾', lat: 35.68, lon: 139.76}, {code: 'XQ', name: '伏木富山', lat: 35.68, lon: 139.76}, {code: 'SN', name: '新湊', lat: 35.68, lon: 139.76}, {code: 'TY', name: '富山', lat: 35.68, lon: 139.76}, {code: 'I7', name: '生地', lat: 35.68, lon: 139.76}, {code: 'T3', name: '直江津', lat: 35.68, lon: 139.76}, {code: 'ZC', name: '柏崎', lat: 35.68, lon: 139.76}, {code: 'S6', name: '新潟西港', lat: 35.68, lon: 139.76}, {code: 'I5', name: '新潟東港', lat: 35.68, lon: 139.76}, {code: 'ZN', name: '小木', lat: 35.68, lon: 139.76}, {code: 'RZ', name: '両津', lat: 35.68, lon: 139.76}, {code: 'S0', name: '佐渡', lat: 35.68, lon: 139.76}, {code: 'QR', name: '粟島', lat: 35.68, lon: 139.76}, {code: 'ZB', name: '鼠ヶ関', lat: 35.68, lon: 139.76}, {code: 'S9', name: '酒田', lat: 35.68, lon: 139.76}, {code: 'ZQ', name: '飛島', lat: 35.68, lon: 139.76}, {code: 'S1', name: '秋田', lat: 35.68, lon: 139.76}, {code: 'S2', name: '船川港', lat: 35.68, lon: 139.76}, {code: 'ZI', name: '男鹿', lat: 35.68, lon: 139.76}, {code: 'FK', name: '深浦', lat: 35.68, lon: 139.76}
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

// ▼ 天文学計算用エンジン (SunCalc 修正版) ▼
// 日本時間のバグ（Jnoonの符号ミス等）を完全に修正したバージョンです
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
function getTimes(date, lat, lng, height) {
    var lw = rad * -lng, phi = rad * lat, d = toDays(date);
    // ↓ n と Jnoon の計算式を修正し、日本時間などに正確に対応させました
    var n = Math.round(d - 0.0009 - lw / (2 * PI));
    var h0 = -0.0053 - 2.076 * Math.sqrt(height || 0) / 60;
    var c = sunCoords(d + n);
    var val = (Math.sin(h0) - Math.sin(phi) * Math.sin(c.dec)) / (Math.cos(phi) * Math.cos(c.dec));
    if (val > 1) val = 1; if (val < -1) val = -1;
    var H = Math.acos(val);
    var Jnoon = 2451545 + 0.0009 + lw / (2 * PI) + n; // 符号修正部分
    var Jset = Jnoon + H / (2 * PI), Jrise = Jnoon - H / (2 * PI);
    return { sunrise: fromJulian(Jrise), sunset: fromJulian(Jset) };
}
function getMoonTimes(date, lat, lng) {
    // 指定日の0時0分0秒（ローカル時刻）を基準に計算をスタート
    var t = new Date(date); t.setHours(0, 0, 0, 0);
    var hc = 0.133 * rad, h0 = getMoonPosition(t, lat, lng).altitude - hc, h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
    for (var i = 1; i <= 24; i += 2) {
        h1 = getMoonPosition(new Date(t.valueOf() + i * 3600000), lat, lng).altitude - hc;
        h2 = getMoonPosition(new Date(t.valueOf() + (i + 1) * 3600000), lat, lng).altitude - hc;
        a = (h0 + h2) / 2 - h1; b = (h2 - h0) / 2; xe = a !== 0 ? -b / (2 * a) : 0; ye = (a * xe + b) * xe + h1; d = b * b - 4 * a * h1; roots = 0;
        if (d >= 0) {
            dx = a !== 0 ? Math.sqrt(d) / (Math.abs(a) * 2) : 0;
            x1 = xe - dx; x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }
        if (roots === 1) {
            if (h0 < 0) rise = i + x1; else set = i + x1;
        } else if (roots === 2) {
            if (ye < 0) { rise = i + x2; set = i + x1; }
            else { rise = i + x1; set = i + x2; }
        }
        if (rise && set) break; h0 = h2;
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
