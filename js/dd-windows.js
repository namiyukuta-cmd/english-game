(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const desktop = $('desktop');
  const rail = $('menuRail');
  const sceneLauncher = $('sceneLauncher');
  const mapLauncher = $('mapLauncher');
  const playerPortrait = $('playerPortrait');
  const npcPortrait = $('npcPortrait');
  const toast = $('toast');
  const tokenModal = $('tokenModal');
  const tokenInput = $('tokenInput');
  const connectSaveBtn = $('connectSaveBtn');
  const cancelTokenBtn = $('cancelTokenBtn');

  let game = null;
  let zCounter = 30;
  let toastTimer = null;
  const windows = new Map();

  const windowDefs = {
    scene: {title:'場面', x:28, y:28, w:66, h:68, minW:280, minH:220},
    map: {title:'地図', x:62, y:42, w:35, h:39, minW:220, minH:190},
    quest: {title:'クエスト', x:38, y:48, w:48, h:58, minW:270, minH:240},
    player: {title:'プレイヤー', x:32, y:34, w:54, h:64, minW:300, minH:270},
    skill: {title:'スキル', x:42, y:40, w:52, h:61, minW:290, minH:260},
    inventory: {title:'所持品', x:48, y:46, w:48, h:58, minW:280, minH:250},
    log: {title:'ログ', x:36, y:52, w:58, h:58, minW:310, minH:260},
    note: {title:'ノート', x:44, y:58, w:50, h:52, minW:280, minH:240}
  };

  function showToast(message, ms = 2200) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
  }

  function readGame() {
    try {
      const raw = localStorage.getItem('ddActiveGame');
      game = raw ? JSON.parse(raw) : null;
    } catch (_) {
      game = null;
    }
    if (!game) {
      location.replace('DD_top.html');
      return false;
    }
    game.character = game.character || {};
    game.quests = Array.isArray(game.quests) ? game.quests : [];
    game.inventory = Array.isArray(game.inventory) ? game.inventory : [];
    game.log = Array.isArray(game.log) ? game.log : [];
    game.world = game.world || {};
    game.current = game.current || {};
    if (typeof game.note !== 'string') game.note = game.notes?.freeText || '';
    return true;
  }

  function writeLocalActive() {
    localStorage.setItem('ddActiveGame', JSON.stringify(game));
  }

  function bringFront(win) {
    zCounter += 1;
    win.style.zIndex = String(zCounter);
    windows.forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
  }

  function viewportSize() {
    return {w:desktop.clientWidth, h:desktop.clientHeight};
  }

  function defaultRect(def) {
    const {w:dw,h:dh} = viewportSize();
    const narrow = dw < 650;
    if (narrow) {
      const width = Math.max(def.minW, Math.floor(dw * .90));
      const height = Math.max(def.minH, Math.floor(dh * (def.title === '場面' ? .58 : .52)));
      return {left:Math.max(6,Math.floor((dw-width)/2)), top:42, width:Math.min(width,dw-12), height:Math.min(height,dh-64)};
    }
    const width = Math.max(def.minW, Math.floor(dw * def.w / 100));
    const height = Math.max(def.minH, Math.floor(dh * def.h / 100));
    return {
      left:Math.max(8,Math.min(dw-width-8,Math.floor(dw * def.x / 100) - Math.floor(width/2))),
      top:Math.max(8,Math.min(dh-height-8,Math.floor(dh * def.y / 100) - 20)),
      width:Math.min(width,dw-16),
      height:Math.min(height,dh-16)
    };
  }

  function applyRect(win, rect) {
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;
    win.style.width = `${rect.width}px`;
    win.style.height = `${rect.height}px`;
  }

  function createWindow(id) {
    const def = windowDefs[id];
    const win = document.createElement('section');
    win.className = 'dd-window';
    win.dataset.windowId = id;
    win.innerHTML = `
      <header class="window-titlebar">
        <strong class="window-title">${esc(def.title)}</strong>
        <div class="window-controls">
          <button class="window-btn maximize-btn" type="button" aria-label="最大化または元に戻す">□</button>
          <button class="window-btn close-btn" type="button" aria-label="閉じる">×</button>
        </div>
      </header>
      <div class="window-body"></div>
      <div class="window-resize" aria-hidden="true"></div>`;
    applyRect(win, defaultRect(def));
    desktop.appendChild(win);
    windows.set(id, win);
    attachWindowBehavior(win, def);
    return win;
  }

  function attachWindowBehavior(win, def) {
    const bar = win.querySelector('.window-titlebar');
    const closeBtn = win.querySelector('.close-btn');
    const maxBtn = win.querySelector('.maximize-btn');
    const resize = win.querySelector('.window-resize');

    win.addEventListener('pointerdown', () => bringFront(win));
    closeBtn.addEventListener('click', event => {
      event.stopPropagation();
      win.hidden = true;
      updateMenuState();
    });
    maxBtn.addEventListener('click', event => {
      event.stopPropagation();
      toggleMaximize(win);
    });

    bar.addEventListener('dblclick', () => toggleMaximize(win));
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || win.classList.contains('maximized')) return;
      event.preventDefault();
      bringFront(win);
      const startX = event.clientX, startY = event.clientY;
      const startLeft = win.offsetLeft, startTop = win.offsetTop;
      bar.setPointerCapture(event.pointerId);
      const move = e => {
        const {w,h} = viewportSize();
        const left = Math.max(0, Math.min(w - 90, startLeft + e.clientX - startX));
        const top = Math.max(0, Math.min(h - 44, startTop + e.clientY - startY));
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      };
      const end = e => {
        bar.releasePointerCapture?.(e.pointerId);
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', end);
        bar.removeEventListener('pointercancel', end);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', end);
      bar.addEventListener('pointercancel', end);
    });

    resize.addEventListener('pointerdown', event => {
      if (win.classList.contains('maximized')) return;
      event.preventDefault();
      event.stopPropagation();
      bringFront(win);
      const startX = event.clientX, startY = event.clientY;
      const startW = win.offsetWidth, startH = win.offsetHeight;
      resize.setPointerCapture(event.pointerId);
      const move = e => {
        const {w,h} = viewportSize();
        const width = Math.max(def.minW, Math.min(w - win.offsetLeft, startW + e.clientX - startX));
        const height = Math.max(def.minH, Math.min(h - win.offsetTop, startH + e.clientY - startY));
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
      };
      const end = e => {
        resize.releasePointerCapture?.(e.pointerId);
        resize.removeEventListener('pointermove', move);
        resize.removeEventListener('pointerup', end);
        resize.removeEventListener('pointercancel', end);
      };
      resize.addEventListener('pointermove', move);
      resize.addEventListener('pointerup', end);
      resize.addEventListener('pointercancel', end);
    });
  }

  function toggleMaximize(win) {
    if (!win.classList.contains('maximized')) {
      win.dataset.restore = JSON.stringify({left:win.offsetLeft,top:win.offsetTop,width:win.offsetWidth,height:win.offsetHeight});
      win.classList.add('maximized');
      Object.assign(win.style,{left:'4px',top:'4px',width:'calc(100% - 8px)',height:'calc(100% - 8px)'});
    } else {
      win.classList.remove('maximized');
      try { applyRect(win, JSON.parse(win.dataset.restore || '{}')); } catch (_) { applyRect(win, defaultRect(windowDefs[win.dataset.windowId])); }
    }
    bringFront(win);
  }

  function openWindow(id) {
    let win = windows.get(id) || createWindow(id);
    win.hidden = false;
    renderWindow(id, win.querySelector('.window-body'));
    bringFront(win);
    updateMenuState();
  }

  function updateMenuState() {
    rail.querySelectorAll('[data-open-window]').forEach(btn => {
      const id = btn.dataset.openWindow;
      btn.classList.toggle('open', !!windows.get(id) && !windows.get(id).hidden);
    });
  }

  function abilityMod(score) { return Math.floor((Number(score || 10) - 10) / 2); }
  function fmtMod(v) { return v >= 0 ? `+${v}` : String(v); }

  function renderScene(body) {
    const background = game.current?.background || '';
    const locationName = game.current?.location || '未設定';
    body.classList.add('scene-body');
    body.innerHTML = `
      <div class="scene-canvas" id="sceneCanvas">
        <div class="scene-placeholder">${background ? '' : 'SCENE IMAGE'}</div>
        <div class="scene-location">${esc(locationName)}</div>
      </div>`;
    const canvas = body.querySelector('#sceneCanvas');
    canvas.style.backgroundImage = background ? `url("${encodeURI(String(background)).replace(/"/g,'%22')}")` : '';
  }

  function renderMap(body) {
    const image = game.current?.mapImage || game.world?.mapImage || game.mapImage || '';
    const locationName = game.current?.location || '未設定';
    body.innerHTML = `
      <div class="map-canvas" id="mapCanvas">
        <div class="map-placeholder">${image ? '' : '<span>MAP</span><small>地図画像はまだ未設定</small>'}</div>
        <div class="map-location"><span class="map-pin">●</span>${esc(locationName)}</div>
      </div>`;
    const map = body.querySelector('#mapCanvas');
    map.style.backgroundImage = image ? `url("${encodeURI(String(image)).replace(/"/g,'%22')}")` : '';
  }

  function renderPlayer(body) {
    const c = game.character || {};
    const a = c.abilities || {};
    const dex = abilityMod(a.dex);
    const ac = c.ac ?? c.armorClass ?? (10 + dex);
    const abilityRows = [['STR','str'],['DEX','dex'],['CON','con'],['INT','int'],['WIS','wis'],['CHA','cha']]
      .map(([label,key]) => `<div class="ability-tile"><small>${label}</small><strong>${Number(a[key] ?? 10)}</strong><span>${fmtMod(abilityMod(a[key]))}</span></div>`).join('');
    body.innerHTML = `
      <div class="player-head">
        <div><h2>${esc(c.name || '主人公')}</h2><p>${esc(c.classNameJa || c.className || '')} Lv.${esc(c.level || 1)} / ${esc(c.speciesJa || c.species || '')}</p></div>
        <div class="hp-box"><small>HP</small><strong>${esc(c.hp ?? '?')} / ${esc(c.maxHp ?? '?')}</strong></div>
      </div>
      <div class="stat-strip"><div><small>AC</small><strong>${esc(ac)}</strong></div><div><small>PB</small><strong>+${esc(c.proficiencyBonus ?? 2)}</strong></div><div><small>移動</small><strong>${esc(c.speed ?? 30)}ft</strong></div><div><small>XP</small><strong>${esc(c.xp ?? 0)}</strong></div></div>
      <div class="ability-list">${abilityRows}</div>
      <div class="data-block"><h3>技能習熟</h3><p>${(c.skills || []).map(esc).join(' / ') || 'なし'}</p></div>
      <div class="data-block"><h3>セーヴ習熟</h3><p>${(c.saveProficiencies || []).map(esc).join(' / ') || 'なし'}</p></div>
      <div class="data-block"><h3>背景・属性</h3><p>${esc(c.backgroundJa || c.background || '')} / ${esc(c.alignment || '')}</p></div>`;
  }

  function flattenChoices(value, prefix = '') {
    if (value == null) return [];
    if (Array.isArray(value)) return [`${prefix}${value.join(' / ')}`];
    if (typeof value !== 'object') return [`${prefix}${String(value)}`];
    return Object.entries(value).flatMap(([key,v]) => flattenChoices(v, `${prefix}${key}: `));
  }

  function renderSkills(body) {
    const c = game.character || {};
    const features = [...(c.classFeatures || []), ...(c.feats || [])];
    const classChoices = flattenChoices(c.classChoices || {});
    const originChoices = flattenChoices(c.originChoices || {});
    const originSpells = c.originSpells || {};
    const spells = Object.values(originSpells).flatMap(item => [
      ...(item?.cantrips || []).map(v => `Cantrip: ${v}`),
      ...(item?.level1 ? [`Lv1: ${item.level1}`] : [])
    ]);
    const list = (title, values) => `<section class="list-section"><h3>${title}</h3>${values.length ? `<ul>${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>` : '<p class="empty-text">なし</p>'}</section>`;
    body.innerHTML = [
      list('クラス能力・特技', features),
      list('クラス選択', classChoices),
      list('出自の選択', originChoices),
      list('出自の呪文', spells),
      list('道具習熟', c.toolProficiencies || []),
      list('言語', c.languages || [])
    ].join('');
  }

  function renderInventory(body) {
    const currency = game.currency || {};
    const items = game.inventory || [];
    const equipment = Array.isArray(game.equipment) ? game.equipment : [];
    body.innerHTML = `
      <div class="money-strip"><span>GP <strong>${esc(currency.gp || 0)}</strong></span><span>SP <strong>${esc(currency.sp || 0)}</strong></span><span>CP <strong>${esc(currency.cp || 0)}</strong></span></div>
      <section class="list-section"><h3>装備中</h3>${equipment.length ? `<ul>${equipment.map(item=>`<li>${esc(item.name || item)}</li>`).join('')}</ul>` : '<p class="empty-text">まだ装備情報はありません。</p>'}</section>
      <section class="list-section"><h3>所持品</h3>${items.length ? `<ul>${items.map(item=>`<li>${esc(item.name || item)}${item.quantity && item.quantity!==1?` ×${esc(item.quantity)}`:''}</li>`).join('')}</ul>` : '<p class="empty-text">所持品はありません。</p>'}</section>`;
  }

  function questStatus(q) {
    return q.status || q.state || (q.completed ? '完了' : '受注中');
  }

  function renderQuests(body) {
    const quests = game.quests || [];
    if (!quests.length) {
      body.innerHTML = '<div class="empty-panel"><strong>受注中のクエストはありません。</strong><span>冒険中に受けた依頼や目的がここに追加されます。</span></div>';
      return;
    }
    body.innerHTML = `<div class="quest-list">${quests.map(q => `
      <article class="quest-card">
        <div class="quest-top"><strong>${esc(q.title || q.name || '名称未設定')}</strong><span>${esc(questStatus(q))}</span></div>
        ${q.description ? `<p>${esc(q.description)}</p>` : ''}
        ${q.progress != null ? `<div class="quest-progress">進行：${esc(q.progress)}${q.maxProgress!=null?` / ${esc(q.maxProgress)}`:''}</div>` : ''}
      </article>`).join('')}</div>`;
  }

  function logText(entry) {
    if (typeof entry === 'string') return {text:entry};
    return {
      time:entry.time || entry.datetime || entry.date || '',
      place:entry.location || entry.place || '',
      text:entry.text || entry.summary || entry.event || entry.action || JSON.stringify(entry)
    };
  }

  function renderLog(body) {
    const logs = game.log || [];
    body.innerHTML = `
      <div class="window-note">ゲーム中の出来事を保存しておく欄です。GitHubへセーブした後、このログをAIに読ませて整理できます。</div>
      <div class="log-list">${logs.length ? logs.map((entry,i)=>{
        const l=logText(entry);
        return `<article class="log-entry"><div class="log-meta"><span>#${i+1}</span>${l.time?`<span>${esc(l.time)}</span>`:''}${l.place?`<span>${esc(l.place)}</span>`:''}</div><p>${esc(l.text)}</p></article>`;
      }).join('') : '<div class="empty-panel"><strong>ログはまだありません。</strong><span>冒険を始めると、出来事がここに蓄積されます。</span></div>'}</div>`;
  }

  function renderNote(body) {
    body.innerHTML = `
      <div class="window-note">自由に書けるノートです。ゲーム側では内容を書き換えません。GitHubへの保存は「セーブ」を押した時だけです。</div>
      <textarea id="freeNote" class="free-note" placeholder="気になったこと、NPCのこと、行きたい場所など…">${esc(game.note || '')}</textarea>`;
    body.querySelector('#freeNote').addEventListener('input', e => { game.note = e.target.value; });
  }

  function renderWindow(id, body) {
    body.className = 'window-body';
    if (id === 'scene') renderScene(body);
    else if (id === 'map') renderMap(body);
    else if (id === 'quest') renderQuests(body);
    else if (id === 'player') renderPlayer(body);
    else if (id === 'skill') renderSkills(body);
    else if (id === 'inventory') renderInventory(body);
    else if (id === 'log') renderLog(body);
    else if (id === 'note') renderNote(body);
  }

  function renderPortraits() {
    const c = game.character || {};
    const pImg = playerPortrait.querySelector('img');
    const pPlace = playerPortrait.querySelector('.portrait-placeholder');
    playerPortrait.querySelector('.portrait-name').textContent = c.name || 'PLAYER';
    if (c.portrait) {
      pImg.src = c.portrait; pImg.hidden = false; pPlace.hidden = true;
    } else {
      pImg.hidden = true; pPlace.hidden = false; pPlace.textContent = (c.name || '?').slice(0,1);
    }

    const npc = game.currentNpc || null;
    const nImg = npcPortrait.querySelector('img');
    const silhouette = npcPortrait.querySelector('.mob-silhouette');
    npcPortrait.querySelector('.portrait-name').textContent = npc?.name || 'NPC';
    if (npc?.portrait && !npc?.isMob) {
      nImg.src = npc.portrait; nImg.hidden = false; silhouette.hidden = true;
    } else {
      nImg.hidden = true; silhouette.hidden = false;
    }
  }

  function syncBeforeSave() {
    const note = $('freeNote');
    if (note) game.note = note.value;
  }

  async function doSave() {
    syncBeforeSave();
    const saveBtn = $('saveBtn');
    saveBtn.disabled = true;
    showToast('セーブしています…', 12000);
    try {
      game = await DDGithub.saveGame(game);
      writeLocalActive();
      showToast('GitHubにセーブしました。');
    } catch (error) {
      showToast(error.message || 'セーブに失敗しました。', 4200);
    } finally {
      saveBtn.disabled = false;
    }
  }

  function bindMenus() {
    rail.querySelectorAll('[data-open-window]').forEach(btn => btn.addEventListener('click', () => openWindow(btn.dataset.openWindow)));
    sceneLauncher.addEventListener('click', () => openWindow('scene'));
    mapLauncher.addEventListener('click', () => openWindow('map'));

    $('saveBtn').addEventListener('click', () => {
      if (!DDGithub.getToken()) {
        tokenModal.hidden = false;
        tokenInput.value = '';
        tokenInput.focus();
        return;
      }
      doSave();
    });
    $('loadBtn').addEventListener('click', () => location.href = 'DD_saves.html');
    $('backBtn').addEventListener('click', () => location.href = 'DD_top.html');

    connectSaveBtn.addEventListener('click', async () => {
      connectSaveBtn.disabled = true;
      try {
        DDGithub.setToken(tokenInput.value);
        await DDGithub.verifyConnection();
        tokenModal.hidden = true;
        await doSave();
      } catch (error) {
        DDGithub.clearToken();
        showToast(error.message || 'GitHub連携に失敗しました。', 4200);
      } finally {
        connectSaveBtn.disabled = false;
      }
    });
    tokenInput.addEventListener('keydown', event => { if (event.key === 'Enter') connectSaveBtn.click(); });
    cancelTokenBtn.addEventListener('click', () => tokenModal.hidden = true);
  }

  function fitWindowsAfterResize() {
    const {w,h} = viewportSize();
    windows.forEach(win => {
      if (win.hidden || win.classList.contains('maximized')) return;
      const left = Math.max(0, Math.min(win.offsetLeft, w - 90));
      const top = Math.max(0, Math.min(win.offsetTop, h - 44));
      const width = Math.min(win.offsetWidth, w - left);
      const height = Math.min(win.offsetHeight, h - top);
      Object.assign(win.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`});
    });
  }

  if (!readGame()) return;
  bindMenus();
  renderPortraits();
  openWindow('scene');
  openWindow('map');
  window.addEventListener('resize', fitWindowsAfterResize);
})();
