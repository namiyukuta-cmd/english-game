(() => {
  'use strict';

  const ACTIVE_KEY = 'ddActiveGame';
  const MAP_VERSION = '20260825-3';
  const MAP_FILES = {
    world: [
      'data/dd-maps/world_01_01.txt',
      'data/dd-maps/world_01_02.txt',
      'data/dd-maps/world_01_03.txt',
      'data/dd-maps/world_01_04.txt'
    ],
    brackenfordVale: ['data/dd-maps/brackenford_vale.txt']
  };

  let worldData = null;
  let mapMode = 'region';
  const mapCache = new Map();
  let renderQueued = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'
  }[ch]));

  function readGame() {
    try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function writeGame(game) {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(game));
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`${src} を読み込めませんでした。`));
      document.head.appendChild(script);
    });
  }

  async function ensureWorldData() {
    if (!window.DD_WORLD_DATA) await loadScript(`data/dd-world.js?v=${MAP_VERSION}`);
    worldData = window.DD_WORLD_DATA || null;
    return worldData;
  }

  function timeText(game) {
    const t = game.time || {};
    return `${Number(t.day || 1)}日目 ${String(Number(t.hour ?? 8)).padStart(2,'0')}:${String(Number(t.minute ?? 0)).padStart(2,'0')}`;
  }

  function advanceMinutes(game, minutes) {
    game.time = game.time || {day:1,hour:8,minute:0};
    let total = Number(game.time.hour || 0) * 60 + Number(game.time.minute || 0) + Number(minutes || 0);
    let day = Number(game.time.day || 1);
    while (total >= 1440) { total -= 1440; day += 1; }
    while (total < 0) { total += 1440; day = Math.max(1, day - 1); }
    game.time.day = day;
    game.time.hour = Math.floor(total / 60);
    game.time.minute = total % 60;
    game.current = game.current || {};
    game.current.day = day;
    game.current.time = `${String(game.time.hour).padStart(2,'0')}:${String(game.time.minute).padStart(2,'0')}`;
  }

  function addLog(game, text, place) {
    game.log = Array.isArray(game.log) ? game.log : [];
    game.log.push({time:timeText(game), location:place || game.location?.label || '', text});
  }

  function initializeGame() {
    const game = readGame();
    if (!game || !worldData) return;
    game.world = game.world || {};
    game.worldState = game.worldState || {flags:{},events:{},places:{}};
    game.current = game.current || {};
    game.time = game.time || {day:1,hour:8,minute:0};
    if (game.time.day == null) game.time.day = 1;
    if (game.time.hour == null) game.time.hour = 8;
    if (game.time.minute == null) game.time.minute = 0;

    const label = String(game.location?.label || game.current?.location || '').trim();
    if (!label || label === '未設定') {
      game.location = {
        worldId:'world_01', regionId:'brackenford_vale', settlementId:'brackenford',
        placeId:'town_square', label:'ブラッケンフォード・中央広場'
      };
      Object.assign(game.current, {
        mode:'town', traveling:false, dungeon:null, combat:null,
        worldId:'world_01', regionId:'brackenford_vale', settlementId:'brackenford',
        placeId:'town_square', location:game.location.label
      });
      game.world.discoveredLocations = Array.isArray(game.world.discoveredLocations) ? game.world.discoveredLocations : [];
      for (const id of ['brackenford_vale','brackenford']) {
        if (!game.world.discoveredLocations.includes(id)) game.world.discoveredLocations.push(id);
      }
      if (!game.log?.length) addLog(game, 'ブラッケンフォードの中央広場から冒険を始める。', game.location.label);
      writeGame(game);
    }
  }

  function getTown(game) {
    return worldData?.towns?.[game.location?.settlementId || game.current?.settlementId] || null;
  }

  function getPlace(game, town) {
    return town?.places?.[game.location?.placeId || game.current?.placeId || town?.startPlaceId] || null;
  }

  function moveTown(placeId) {
    const game = readGame();
    const town = getTown(game || {});
    const from = getPlace(game || {}, town);
    const target = town?.places?.[placeId];
    if (!game || !town || !target) return;
    if (from && from.id !== placeId && !from.exits?.includes(placeId)) return;
    if (from?.id === placeId) return;

    advanceMinutes(game, 10);
    game.location = {
      worldId:'world_01', regionId:town.regionId, settlementId:town.id,
      placeId:target.id, label:`${town.nameJa}・${target.nameJa}`
    };
    Object.assign(game.current, {
      mode:'town', traveling:false, regionId:town.regionId,
      settlementId:town.id, placeId:target.id, location:game.location.label
    });
    addLog(game, `${from?.nameJa || '街中'}から${target.nameJa}へ移動した。`, game.location.label);
    writeGame(game);
    renderAll(true);
  }

  function enterBrackenford() {
    const game = readGame();
    const town = worldData?.towns?.brackenford;
    if (!game || !town) return;
    const start = town.places[town.startPlaceId];
    const previous = game.location?.label || '';
    game.location = {
      worldId:'world_01', regionId:'brackenford_vale', settlementId:'brackenford',
      placeId:start.id, label:`${town.nameJa}・${start.nameJa}`
    };
    game.current = game.current || {};
    Object.assign(game.current, {
      mode:'town', traveling:false, regionId:'brackenford_vale',
      settlementId:'brackenford', placeId:start.id, location:game.location.label
    });
    if (previous && previous !== game.location.label) addLog(game, `${town.nameJa}へ入った。`, game.location.label);
    writeGame(game);
    renderAll(true);
  }

  async function mapDataUrl(key) {
    if (mapCache.has(key)) return mapCache.get(key);
    const files = MAP_FILES[key] || [];
    const promise = Promise.all(files.map(async file => {
      const response = await fetch(`${file}?v=${MAP_VERSION}`);
      if (!response.ok) throw new Error(`地図画像 ${response.status}`);
      return (await response.text()).replace(/\s/g,'');
    })).then(parts => `data:image/webp;base64,${parts.join('')}`);
    mapCache.set(key, promise);
    return promise;
  }

  function injectStyle() {
    if (document.getElementById('ddWorldUiStyle')) return;
    const style = document.createElement('style');
    style.id = 'ddWorldUiStyle';
    style.textContent = `
      .dd-world-scene{min-height:100%;display:grid;grid-template-rows:auto auto 1fr;gap:12px;padding:14px;background:linear-gradient(#211c16,#17130f)}
      .dd-world-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:1px solid #514535;padding-bottom:10px}.dd-world-head h2{margin:0;color:#d5b982;font-size:22px}.dd-world-head small{color:#a9977f;font-size:11px}.dd-world-time{white-space:nowrap;color:#c3b299;font-size:12px}.dd-world-desc{margin:0;color:#e4d8c8;font-size:15px;line-height:1.65}
      .dd-town-exits{align-self:end;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.dd-town-exit{min-height:50px;border:1px solid #6b5c47;background:#34291f;color:#f2e8d8;font-size:16px;font-weight:700;padding:9px}.dd-town-exit:active{background:#4b3a2a}
      .dd-world-map{height:100%;min-height:180px;display:grid;grid-template-rows:auto 1fr;background:#15120f}.dd-map-tabs{display:flex;gap:6px;padding:7px;border-bottom:1px solid #5b4d3a}.dd-map-tab{min-height:35px;border:1px solid #5b4d3a;background:#262019;color:#d9cab4;padding:5px 10px;font-size:13px}.dd-map-tab.active{border-color:#ac8e62;background:#4a3928;color:#fff0da}
      .dd-map-stage{position:relative;min-height:0;background:#c6b58f center/100% 100% no-repeat;overflow:hidden}.dd-map-stage.loading::after{content:'地図を読み込み中…';position:absolute;inset:0;display:grid;place-items:center;background:#1a1712;color:#b8a58b;font-size:13px}.dd-map-stage.error::after{content:'地図画像を読み込めませんでした';position:absolute;inset:0;display:grid;place-items:center;background:#1a1712;color:#d8a79c;font-size:13px}
      .dd-map-point{position:absolute;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;border:2px solid #fff0ca;background:#6e6253;box-shadow:0 1px 5px #000;padding:0}.dd-map-point.playable{background:#9e2b20;cursor:pointer}.dd-map-point.current{width:22px;height:22px;background:#b6281d;box-shadow:0 0 0 4px rgba(255,232,182,.4),0 2px 7px #000}.dd-map-label{position:absolute;transform:translate(-50%,8px);font-size:10px;white-space:nowrap;color:#2f2417;background:rgba(239,222,186,.9);border:1px solid rgba(65,48,28,.55);padding:2px 4px;pointer-events:none}.dd-map-caption{position:absolute;left:8px;bottom:8px;max-width:74%;padding:5px 8px;border:1px solid rgba(80,59,35,.6);background:rgba(240,222,184,.88);color:#392b1b;font-size:10px;line-height:1.4}
      @media(max-width:680px){.dd-world-scene{padding:11px}.dd-world-head h2{font-size:19px}.dd-world-desc{font-size:14px}.dd-town-exits{grid-template-columns:1fr}.dd-town-exit{min-height:46px}.dd-map-label{display:none}}
    `;
    document.head.appendChild(style);
  }

  function sceneBody() {
    return document.querySelector('.dd-window[data-window-id="scene"] .window-body');
  }

  function mapBody() {
    return document.querySelector('.dd-window[data-window-id="map"] .window-body');
  }

  function logBody() {
    return document.querySelector('.dd-window[data-window-id="log"] .window-body');
  }

  function renderScene(force = false) {
    const body = sceneBody();
    const game = readGame();
    if (!body || !game || game.current?.mode !== 'town') return;
    const town = getTown(game);
    const place = getPlace(game, town);
    if (!town || !place) return;
    if (!force && body.firstElementChild?.classList.contains('dd-world-scene')) return;
    const exits = (place.exits || []).map(id => town.places[id]).filter(Boolean);
    body.className = 'window-body scene-body';
    body.innerHTML = `<section class="dd-world-scene">
      <header class="dd-world-head"><div><h2>${esc(place.nameJa)}</h2><small>${esc(town.nameJa)} / ${esc(place.type)}</small></div><span class="dd-world-time">${esc(timeText(game))}</span></header>
      <p class="dd-world-desc">${esc(place.description || '')}</p>
      <div class="dd-town-exits">${exits.map(exit => `<button class="dd-town-exit" type="button" data-dd-exit="${esc(exit.id)}">${esc(exit.nameJa)}へ</button>`).join('')}</div>
    </section>`;
    body.querySelectorAll('[data-dd-exit]').forEach(button => button.addEventListener('click', () => moveTown(button.dataset.ddExit)));
  }

  function pointMarkup(region, game) {
    return (region.landmarks || []).map(point => {
      const playable = !!point.playable;
      const current = point.id === 'brackenford' && game.location?.settlementId === 'brackenford';
      return `<button class="dd-map-point${playable?' playable':''}${current?' current':''}" type="button" style="left:${Number(point.x)}%;top:${Number(point.y)}%" data-dd-landmark="${esc(point.id)}" title="${esc(point.nameJa)}" ${playable?'':'disabled'}></button><span class="dd-map-label" style="left:${Number(point.x)}%;top:${Number(point.y)}%">${esc(point.nameJa)}</span>`;
    }).join('');
  }

  async function paintMap(stage, key) {
    stage.classList.add('loading');
    stage.classList.remove('error');
    try {
      const url = await mapDataUrl(key);
      if (!stage.isConnected) return;
      stage.style.backgroundImage = `url("${url}")`;
      stage.classList.remove('loading');
    } catch (error) {
      console.error(error);
      if (!stage.isConnected) return;
      stage.classList.remove('loading');
      stage.classList.add('error');
    }
  }

  function renderMap(force = false) {
    const body = mapBody();
    const game = readGame();
    const region = worldData?.regions?.brackenford_vale;
    if (!body || !game || !region) return;
    if (!force && body.firstElementChild?.classList.contains('dd-world-map')) return;
    body.className = 'window-body';
    body.innerHTML = `<section class="dd-world-map">
      <nav class="dd-map-tabs"><button class="dd-map-tab${mapMode==='world'?' active':''}" type="button" data-dd-map="world">世界地図</button><button class="dd-map-tab${mapMode==='region'?' active':''}" type="button" data-dd-map="region">地域地図</button></nav>
      <div class="dd-map-stage" data-dd-map-stage>${mapMode==='region' ? pointMarkup(region, game) : ''}<div class="dd-map-caption">${mapMode==='world'?'世界全体':'ブラッケンフォードの谷'}</div></div>
    </section>`;
    body.querySelectorAll('[data-dd-map]').forEach(button => button.addEventListener('click', () => {
      mapMode = button.dataset.ddMap;
      renderMap(true);
    }));
    body.querySelector('[data-dd-landmark="brackenford"]')?.addEventListener('click', enterBrackenford);
    paintMap(body.querySelector('[data-dd-map-stage]'), mapMode === 'world' ? 'world' : 'brackenfordVale');
  }

  function logText(entry) {
    if (typeof entry === 'string') return {text:entry,time:'',place:''};
    return {
      time:entry?.time || entry?.datetime || entry?.date || '',
      place:entry?.location || entry?.place || '',
      text:entry?.text || entry?.summary || entry?.event || entry?.action || JSON.stringify(entry)
    };
  }

  function renderLog(force = false) {
    const body = logBody();
    const game = readGame();
    if (!body || !game) return;
    if (!force && body.firstElementChild?.dataset?.ddWorldLog === '1') return;
    const logs = Array.isArray(game.log) ? game.log : [];
    body.className = 'window-body';
    body.innerHTML = `<div data-dd-world-log="1"><div class="window-note">ゲーム中の出来事を保存しておく欄です。GitHubへセーブした後、このログをAIに読ませて整理できます。</div><div class="log-list">${logs.length ? logs.map((entry,i) => {
      const l = logText(entry);
      return `<article class="log-entry"><div class="log-meta"><span>#${i+1}</span>${l.time?`<span>${esc(l.time)}</span>`:''}${l.place?`<span>${esc(l.place)}</span>`:''}</div><p>${esc(l.text)}</p></article>`;
    }).join('') : '<div class="empty-panel"><strong>ログはまだありません。</strong></div>'}</div></div>`;
  }

  function renderAll(force = false) {
    if (renderQueued && !force) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderScene(force);
      renderMap(force);
      renderLog(force);
    });
  }

  function observeWindows() {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    const observer = new MutationObserver(() => renderAll(false));
    observer.observe(desktop, {childList:true, subtree:true});
    renderAll(true);
  }

  async function boot() {
    if (!document.getElementById('desktop')) return;
    try {
      await ensureWorldData();
      injectStyle();
      initializeGame();
      observeWindows();
    } catch (error) {
      console.error(error);
    }
  }

  boot();
})();
