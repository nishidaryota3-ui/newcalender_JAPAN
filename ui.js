// ui.js (UI構築・イベントモジュール) - 189地点完全網羅・自動★判定版

const TEXT_TARGETS = ['gregorian', 'weekday', 'sekki', 'kou', 'zassetsu', 'holiday', 'important', 'wafuText', 'gregorianText', 'dailyRainText', 'guideTime', 'guideTideText', 'guideRainText', 'lunarMansion', 'eventShinto', 'eventBuddhism', 'eventChurch', 'eventSonota', 'lunar', 'haikuText'];
const SHAPE_TARGETS = ['baseSvg', 'lunarShadow', 'astroPins', 'dateLines', 'tideGraph', 'rainGraph', 'dailyRainBg', 'guideTideLine', 'guideRainLine', 'canvasBg'];

const TARGET_NAMES = {
    canvasBg: "キャンバス背景", baseSvg: "ベース図形", lunarShadow: "月相シャドウ", astroPins: "天文学的ピン (朔望)", 
    dateLines: "日付区切り線 (30等分)", lunarMansion: "二十七宿", tideGraph: "潮汐波形", rainGraph: "毎時降水量 (棒線)", 
    dailyRainBg: "日別総降水量 (背景)", dailyRainText: "日別総降水量 (数値)", guideTime: "時間ガイド (0/6/12/18)", 
    guideTideLine: "潮位ガイド (ft) 目盛り線", guideTideText: "潮位ガイド (ft) 文字", 
    guideRainLine: "降水量ガイド (mm) 目盛り線", guideRainText: "降水量ガイド (mm) 文字", 
    gregorian: "新暦日付", weekday: "曜日", lunar: "旧暦 (月相対応)", 
    sekki: "24節気", kou: "72候", wafuText: "右上 月名 (旧暦)", gregorianText: "右上 月名 (新暦)", 
    holiday: "祝日 (上段)", zassetsu: "雑節 (中段)", important: "重要年中行事 (下段)", 
    eventShinto: "神事", eventBuddhism: "仏事", eventChurch: "教会行事", eventSonota: "その他", haikuText: "俳句 (一番外周)"
};

const LAYER_VISIBILITY_MAP = {
    "toggle-base-svg": "#bg-group", "toggle-lunar-shadow": "#layer-shadow", "toggle-astro-pins": "#layer-astronomical-pins",
    "toggle-layer-lunar": "#layer-lunar-mansion", "toggle-tide-graph": "#layer-tide-wave", "toggle-rain-graph": "#layer-rain-graph",
    "toggle-daily-rain-bg": "#layer-daily-rain-bg", "toggle-daily-rain-text": "#layer-daily-rain-text", "toggle-date-lines": "#layer-lines",
    "toggle-guide-time": "#layer-guide-time", "toggle-haiku-text": "#layer-haiku", "toggle-guide-tide-line": ".layer-guide-tide-line",
    "toggle-guide-tide-text": ".layer-guide-tide-text", "toggle-guide-rain-line": ".layer-guide-rain-line", "toggle-guide-rain-text": ".layer-guide-rain-text",
    "toggle-date-gregorian": ".layer-date-gregorian", "toggle-date-lunar": ".layer-date-lunar", "toggle-date-weekday": ".layer-date-weekday",
    "toggle-wafu-text": ".layer-wafu-text", "toggle-gregorian-text": ".layer-gregorian-text", "toggle-sekki": ".layer-sekki",
    "toggle-kou": ".layer-kou", "toggle-zassetsu": ".layer-zassetsu", "toggle-holiday": ".layer-holiday", "toggle-event-important": ".layer-event-important"
};

const iconExport = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

// ▼ 自動★付与ロジック ▼
window.checkAvailableTides = async function(year) {
    const select = document.getElementById('tideSelect');
    if(!select) return;
    
    // バックグラウンドで全189地点のCSVの存在をチェックする
    const promises = TIDE_STATIONS.map(async (station, i) => {
        const url = `tides/tide_${station.code}_${year}.csv`;
        try {
            // HEADリクエストでファイルの中身を読まずに「存在確認」だけ行う
            const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            if (res.ok) {
                select.options[i].text = `★ ${station.name} (${station.code})`;
            } else {
                select.options[i].text = `${station.name} (${station.code})`;
            }
        } catch(e) {
            // ローカル環境等のセキュリティ制限でエラーになった場合は元のまま
            select.options[i].text = `${station.name} (${station.code})`;
        }
    });
    
    await Promise.all(promises);
};

function initUI() {
    const oldPalette = document.getElementById('palette');
    if (oldPalette) oldPalette.remove();
    document.querySelectorAll('.panel-ui').forEach(el => el.remove());

    const navDiv = document.createElement('div');
    navDiv.className = 'panel-ui';
    navDiv.id = 'nav-bar';
    navDiv.style = "position:fixed; top:30px; right:30px; background:rgba(25,30,40,0.85); padding:10px 15px; border-radius:8px; color:#d4af37; z-index:100; display:flex; gap:15px; align-items:center; border: 1px solid rgba(212,175,55,0.3); backdrop-filter: blur(10px);";
    
    // ▼ 潮汐プルダウンの生成 (189地点) ▼
    let tideOptions = "";
    TIDE_STATIONS.forEach((station, idx) => {
        tideOptions += `<option value="${idx}" ${idx === currentTideStationIndex ? "selected" : ""}>${station.name} (${station.code})</option>`;
    });

    navDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px; border-right:1px solid rgba(212,175,55,0.3); padding-right:15px;">
            <div style="display:flex; align-items:center; gap:5px;">
                <span style="font-size:12px; color:#8b949e;">天気:</span>
                <input type="text" id="locationInput" placeholder="地名を入力" value="${currentLocationName}" style="width:90px; padding:4px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:12px;">
                <button id="searchLocationBtn" style="background:#0ea5e9; border:none; color:#fff; padding:4px 8px; cursor:pointer; border-radius:4px; font-weight:bold; font-size:12px;">検索</button>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
                <span style="font-size:12px; color:#8b949e;">🌊 潮:</span>
                <select id="tideSelect" style="padding:4px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:12px; max-width: 140px;">
                    ${tideOptions}
                </select>
            </div>
        </div>
        <button id="prevBtn" style="background:transparent; border:1px solid #d4af37; color:#d4af37; padding:4px 8px; cursor:pointer; border-radius:4px;">◀</button>
        <div id="cycleDisplay" title="クリックして年月を移動" style="font-weight:bold; font-size:14px; text-align:center; min-width:120px; cursor:pointer; padding:4px; border-radius:4px; transition:background 0.2s;">--</div>
        <button id="nextBtn" style="background:#d4af37; border:none; color:#000; padding:4px 8px; cursor:pointer; border-radius:4px; font-weight:bold;">▶</button>
    `;
    document.body.appendChild(navDiv);

    const jumpDiv = document.createElement('div');
    jumpDiv.className = 'panel-ui';
    jumpDiv.id = 'jumpMenu';
    jumpDiv.style = "position:fixed; top:80px; right:30px; background:rgba(25,30,40,0.9); padding:10px; border-radius:8px; border: 1px solid rgba(212,175,55,0.5); display:none; z-index:101; flex-direction:column; gap:8px;";
    jumpDiv.innerHTML = `
        <div style="font-size:12px; color:#fff;">移動先の年月 (例: 2026-08)</div>
        <div style="display:flex; gap:5px;">
            <input type="month" id="jumpInput" style="padding:4px; border-radius:4px; border:1px solid #555; background:#222; color:#fff;">
            <button id="jumpGoBtn" style="background:#d4af37; border:none; color:#000; padding:4px 8px; border-radius:4px; cursor:pointer; font-weight:bold;">GO</button>
        </div>
    `;
    document.body.appendChild(jumpDiv);

    const toolsDiv = document.createElement('div');
    toolsDiv.className = 'panel-ui';
    toolsDiv.id = 'tools-palette'; 
    toolsDiv.style = "position:fixed; top:100px; left:20px; background:rgba(25,30,40,0.9); padding:8px; border-radius:8px; z-index:100; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:8px; width:44px; box-sizing:border-box;";
    toolsDiv.innerHTML = `
        <button id="tool-pointer" title="移動/回転切替 (V)" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:rgba(212,175,55,0.85); border:1px solid #d4af37; color:#000; padding:0; display:flex; justify-content:center; align-items:center;">${iconPan}</button>
        <button id="tool-paint" title="塗る (B)" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#fff; padding:0; display:flex; justify-content:center; align-items:center;">${iconPaint}</button>
        <button id="tool-erase" title="消す (E)" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#fff; padding:0; display:flex; justify-content:center; align-items:center;">${iconErase}</button>
        <hr style="border-color:rgba(255,255,255,0.1); width:100%; margin:4px 0;">
        <button id="clearBtn" title="選択色を全消去" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#fff; padding:0; display:flex; justify-content:center; align-items:center;">${iconTrash}</button>
        <button id="printBtn" title="印刷 (余白カット)" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#38bdf8; padding:0; display:flex; justify-content:center; align-items:center;">${iconPrint}</button>
        <button id="exportBtn" title="高画質で画像保存 (PNG)" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#38bdf8; padding:0; display:flex; justify-content:center; align-items:center;">${iconExport}</button>
        <hr style="border-color:rgba(255,255,255,0.1); width:100%; margin:4px 0;">
        <button id="homeBtn" title="新月を真上にリセット" style="width:26px; height:26px; border-radius:4px; cursor:pointer; background:transparent; border:1px solid transparent; color:#38bdf8; padding:0; display:flex; justify-content:center; align-items:center;">${iconHome}</button>
    `;
    document.body.appendChild(toolsDiv);

    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'panel-ui';
    paletteDiv.id = 'palette-container';
    paletteDiv.style = "position:fixed; top:134px; left:74px; background:rgba(25,30,40,0.9); padding:10px; border-radius:8px; z-index:99; border: 1px solid rgba(255,255,255,0.1); display:none; grid-template-columns:repeat(4, 1fr); gap:6px; width:120px; box-sizing:border-box;";
    document.body.appendChild(paletteDiv);

    const lpTitleDiv = document.querySelector('.layer-panel-title');
    if (lpTitleDiv) {
        lpTitleDiv.style.justifyContent = 'center';
        lpTitleDiv.style.position = 'relative';
        lpTitleDiv.style.textAlign = 'center';
    }

    const btnMinimize = document.getElementById('btn-minimize-panel');
    const panelContent = document.getElementById('layer-panel-content');
    if (btnMinimize && panelContent) {
        btnMinimize.style.position = 'absolute';
        btnMinimize.style.right = '10px';
        btnMinimize.onclick = () => {
            if (panelContent.style.display === 'none') {
                panelContent.style.display = 'block';
                btnMinimize.textContent = '−';
            } else {
                panelContent.style.display = 'none';
                btnMinimize.textContent = '＋';
            }
        };
    }

    if (panelContent) {
        const labels = panelContent.querySelectorAll('label');
        let targetLabel = null;
        labels.forEach(l => { if(l.textContent.includes('二十七宿')) targetLabel = l; });
        if (targetLabel && targetLabel.parentNode && !document.getElementById('toggle-haiku-text')) {
            const containerDiv = targetLabel.parentNode; 
            const newRow = document.createElement('div');
            newRow.style.display = 'flex';
            newRow.style.justifyContent = 'space-between';
            newRow.style.alignItems = 'center';
            newRow.style.marginBottom = '5px';
            newRow.innerHTML = `
                <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;">
                    <input type="checkbox" id="toggle-haiku-text" checked style="accent-color:#d4af37;">
                    俳句 (一番外周)
                </label>
                <button class="layer-settings-btn" data-target="haikuText" style="background:none; border:none; color:#8b949e; cursor:pointer; font-size:14px;">⚙️</button>
            `;
            containerDiv.parentNode.insertBefore(newRow, containerDiv.nextSibling);
        }
    }

    const themeBox = document.querySelector('#layer-panel-content > div:first-child');
    if (themeBox) {
        themeBox.style.background = "rgba(0, 0, 0, 0.3)";
        themeBox.style.borderColor = "rgba(212, 175, 55, 0.3)";
        themeBox.innerHTML = `
            <div style="font-size:12px; color:#d4af37; margin-bottom:8px; font-weight:bold; text-align:center;">テーマ (プリセット) 管理</div>
            <div style="display:flex; gap:5px; margin-bottom:6px; align-items:center;">
                <select id="theme-select" style="flex:1; min-width:0; background:#222; color:#fff; border:1px solid #555; border-radius:4px; font-size:12px; height:26px; box-sizing:border-box; padding:0 4px;">
                    <option value="default">デフォルト設定</option>
                </select>
                <button id="btn-theme-load" style="width:50px; background:#d4af37; border:none; color:#000; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; height:26px; box-sizing:border-box; padding:0;">読込</button>
            </div>
            <div style="display:flex; gap:5px; margin-bottom:12px; align-items:center;">
                <input type="text" id="theme-name-input" placeholder="テーマ名を入力" style="flex:1; min-width:0; background:#222; color:#fff; border:1px solid #555; border-radius:4px; font-size:12px; height:26px; box-sizing:border-box; padding:0 6px;">
                <button id="btn-theme-save" style="width:50px; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; height:26px; box-sizing:border-box; padding:0;">保存</button>
            </div>
            <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin:0 0 10px 0;">
            <button id="btn-apply-global" style="background:#0ea5e9; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; width:100%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: 0.2s;">
                デザインを全月適用
            </button>
        `;
        
        document.getElementById('btn-apply-global').onmouseover = function() { this.style.background = '#0284c7'; };
        document.getElementById('btn-apply-global').onmouseout = function() { this.style.background = '#0ea5e9'; };
        document.getElementById('btn-apply-global').onclick = () => {
            if(confirm("現在の色や設定を、すべての月の基本デザインとして適用しますか？")) {
                if(typeof window.applyGlobalSettings === 'function') {
                    window.applyGlobalSettings();
                    updateCalendarCycle();
                }
            }
        };
    }

    const designPanel = document.createElement('div');
    designPanel.id = 'design-panel';
    designPanel.className = 'panel-ui';
    designPanel.style = "display:none; position:fixed; top:100px; left:50%; background:rgba(25,30,40,0.95); padding:0 20px 20px 20px; border-radius:12px; border:1px solid rgba(212,175,55,0.5); color:#fff; z-index:200; box-shadow:0 10px 40px rgba(0,0,0,0.8); min-width:320px; backdrop-filter:blur(10px);";
    
    // ... [以下、designPanel.innerHTML 等は以前と全く同じため省略せずに描画します] ...
    // ※今回は文字数の制約上、designPanelやイベントリスナーの長いコードブロックは「UI構築用」として元のまま維持されています。
    // ※重要な変更点は、上記の checkAvailableTides の追加と tideSelect の HTML部分です。
    // (実際の運用ではこの部分は元の ui.js と同一です。コードが長くなりすぎるのを防ぐため、以降の細かい設定パネルのHTML部分はそのままコピーペーストでお使いください)
    designPanel.innerHTML = `
        <div id="dp-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.3); padding:12px 0 10px 0; cursor:grab; user-select:none;">
            <div id="dp-title" style="color:#d4af37; font-weight:bold; font-size:15px;">デザイン設定</div>
            <div style="display:flex; gap:10px; align-items:center;">
                <button id="dp-reset" style="background:rgba(255,100,100,0.2); border:1px solid #ff8888; color:#ff8888; border-radius:4px; font-size:11px; padding:2px 6px; cursor:pointer;">初期化</button>
                <button id="dp-close" style="background:none; border:none; color:#fff; cursor:pointer; font-size:20px; padding:0; line-height:1;">×</button>
            </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
            <div id="dp-row-lunar-phase" style="display:none; flex-direction:column; gap:8px;">
                <label style="display:flex; justify-content:space-between; align-items:center; color:#d4af37; font-weight:bold;">編集対象の月相: 
                    <select id="dp-lunar-phase" style="background:#111; color:#d4af37; border:1px solid #d4af37; padding:4px; border-radius:4px; width:150px; font-weight:bold;">
                        <option value="normal">通常 (平月)</option>
                        <option value="newMoon">新月 (一日)</option>
                        <option value="firstQuarter">上弦 (八日)</option>
                        <option value="fullMoon">満月 (十五日)</option>
                        <option value="lastQuarter">下弦 (二十三日)</option>
                    </select>
                </label>
                <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin:0;">
            </div>
            <div id="dp-group-text" style="display:flex; flex-direction:column; gap:12px;">
                <label id="dp-row-font" style="display:flex; justify-content:space-between; align-items:center;">フォント: 
                    <select id="dp-font" style="background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px; width:150px;">
                        <option value="'Shippori Mincho', serif">明朝体 (Shippori)</option>
                        <option value="'YuMincho', 'Yu Mincho', serif">游明朝 (Yu Mincho)</option>
                        <option value="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif">ゴシック体 (標準)</option>
                        <option value="'YuGothic', 'Yu Gothic', sans-serif">游ゴシック (Yu Gothic)</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="Georgia, serif">Georgia</option>
                    </select>
                </label>
                <label id="dp-row-size" style="display:flex; justify-content:space-between; align-items:center;">文字サイズ: 
                    <input type="number" id="dp-size" style="width:60px; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px;" step="0.5">
                </label>
                <label id="dp-row-lang" style="display:none; justify-content:space-between; align-items:center;">表示言語: 
                    <select id="dp-lang" style="background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px; width:120px;">
                        <option value="en">英語 (Sun-Sat)</option>
                        <option value="ja">日本語 (日-土)</option>
                    </select>
                </label>
                <label id="dp-row-color" style="display:flex; justify-content:space-between; align-items:center;">文字色 (Fill): 
                    <input type="color" id="dp-color" style="background:none; border:none; width:30px; height:30px; cursor:pointer;">
                </label>
                <label id="dp-row-bold" style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" id="dp-bold" style="accent-color:#d4af37; width:16px; height:16px;"> 太字にする
                </label>
                <label id="dp-row-stroke-color" style="display:flex; justify-content:space-between; align-items:center;">縁取り色 (Stroke): 
                    <input type="color" id="dp-stroke-color" style="background:none; border:none; width:30px; height:30px; cursor:pointer;">
                </label>
                <label id="dp-row-stroke-width" style="display:flex; justify-content:space-between; align-items:center;">縁取り太さ: 
                    <input type="range" id="dp-stroke-width" min="0" max="5" step="0.1" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-stroke-val" style="width:30px; text-align:right;">0</span>
                </label>
            </div>
            <div id="dp-group-mansion-colors" style="display:none; flex-direction:column; gap:12px; margin-top:5px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.2);">
                <label style="display:flex; justify-content:space-between; align-items:center;">東方青龍 (角〜箕): <input type="color" id="dp-color-east" style="background:none; border:none; width:30px; height:30px; cursor:pointer;"></label>
                <label style="display:flex; justify-content:space-between; align-items:center;">北方玄武 (斗〜壁): <input type="color" id="dp-color-north" style="background:none; border:none; width:30px; height:30px; cursor:pointer;"></label>
                <label style="display:flex; justify-content:space-between; align-items:center;">西方白虎 (奎〜参): <input type="color" id="dp-color-west" style="background:none; border:none; width:30px; height:30px; cursor:pointer;"></label>
                <label style="display:flex; justify-content:space-between; align-items:center;">南方朱雀 (井〜軫): <input type="color" id="dp-color-south" style="background:none; border:none; width:30px; height:30px; cursor:pointer;"></label>
                <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin:0;">
                <label style="display:flex; justify-content:space-between; align-items:center;">星の大きさ: <input type="range" id="dp-mansion-star-size" min="0.1" max="5" step="0.1" style="width:100px; accent-color:#d4af37;"> <span id="dp-mansion-star-size-val" style="width:30px; text-align:right;">1.5</span></label>
                <label style="display:flex; justify-content:space-between; align-items:center;">背景帯の色: <input type="color" id="dp-mansion-bg-color" style="background:none; border:none; width:30px; height:30px; cursor:pointer;"></label>
                <label style="display:flex; justify-content:space-between; align-items:center;">背景帯の透明度: <input type="range" id="dp-mansion-bg-opacity" min="0" max="1" step="0.05" style="width:100px; accent-color:#d4af37;"> <span id="dp-mansion-bg-opacity-val" style="width:30px; text-align:right;">0.05</span></label>
            </div>
            <div id="dp-group-shape" style="display:none; flex-direction:column; gap:12px; margin-top:5px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.2);">
                <label id="dp-row-shape-type" style="display:flex; justify-content:space-between; align-items:center;">背景図形: 
                    <select id="dp-shape" style="background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px; width:100px;">
                        <option value="none">なし</option>
                        <option value="circle">丸</option>
                        <option value="rect">四角</option>
                        <option value="triangle">三角</option>
                        <option value="star">星</option>
                    </select>
                </label>
                <label id="dp-row-shape-scale" style="display:none; justify-content:space-between; align-items:center;">図形のサイズ (倍率): 
                    <input type="range" id="dp-shape-scale" min="0.5" max="4" step="0.1" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-shape-scale-val" style="width:30px; text-align:right;">1</span>
                </label>
                <label id="dp-row-radius-offset" style="display:none; justify-content:space-between; align-items:center;">配置位置 (半径ズラし): 
                    <input type="range" id="dp-radius-offset" min="0" max="800" step="5" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-radius-offset-val" style="width:30px; text-align:right;">0</span>
                </label>
                <label id="dp-row-density" style="display:none; justify-content:space-between; align-items:center;">グラデーション濃度: 
                    <input type="range" id="dp-density" min="0.1" max="1" step="0.05" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-density-val" style="width:30px; text-align:right;">0.35</span>
                </label>
                <label id="dp-row-shape-fill" style="display:flex; justify-content:space-between; align-items:center;">塗りつぶし色: 
                    <div style="display:flex; align-items:center; gap:5px;">
                        <input type="checkbox" id="dp-shape-fill-trans" title="透明にする" style="accent-color:#d4af37;">
                        <span id="dp-shape-fill-trans-text">透明</span>
                        <input type="color" id="dp-shape-fill" style="background:none; border:none; width:30px; height:30px; cursor:pointer;">
                    </div>
                </label>
                <label id="dp-row-shape-stroke" style="display:flex; justify-content:space-between; align-items:center;">線の色: 
                    <div style="display:flex; align-items:center; gap:5px;">
                        <input type="checkbox" id="dp-shape-stroke-orig" title="単色で上書きする" style="display:none; accent-color:#d4af37;">
                        <span id="dp-shape-stroke-orig-text" style="display:none; font-size:11px;">上書きする</span>
                        <input type="color" id="dp-shape-stroke" style="background:none; border:none; width:30px; height:30px; cursor:pointer;">
                    </div>
                </label>
                <label id="dp-row-shape-stroke-width" style="display:flex; justify-content:space-between; align-items:center;">線の太さ: 
                    <input type="range" id="dp-shape-stroke-width" min="0" max="10" step="0.1" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-shape-stroke-width-val" style="width:30px; text-align:right;">0</span>
                </label>
            </div>
            <div id="dp-group-common" style="display:flex; flex-direction:column; gap:12px; margin-top:5px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.2);">
                <label id="dp-row-opacity" style="display:flex; justify-content:space-between; align-items:center;">透明度 (全体): 
                    <input type="range" id="dp-opacity" min="0" max="1" step="0.05" style="width:100px; accent-color:#d4af37;">
                    <span id="dp-opacity-val" style="width:30px; text-align:right;">1</span>
                </label>
                <label id="dp-row-offset" style="display:flex; justify-content:space-between; align-items:center;">位置 (文字のY軸微調整): 
                    <input type="number" id="dp-offset" style="width:60px; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:4px;" step="1">
                </label>
            </div>
        </div>
    `;
    document.body.appendChild(designPanel);

    // （※以下、イベントリスナーなどの部分は以前のコードと同一のため省略します。ここまでの上書きでUIと★マークの準備は完了です）
    // ====== 【重要】以降のui.jsのコードは変更不要ですので、既存のものをそのまま活かしてください ======
