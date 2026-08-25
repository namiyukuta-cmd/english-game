(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  let game = null;
  let activePage = 'main';
  let flipTimer = null;
  let toastTimer = null;

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
    game.current = game.current || {};
    game.world = game.world || {};
    game.time = game.time || {
      day: Number(game.current.day || 1),
      hour: legacyHour(game.current.time),
      minute: 0
    };
    game.inventory = Array.isArray(game.inventory) ? game.inventory : [];
    game.equipment = game.equipment || [];
    game.quests = game.quests || [];
    game.log = Array.isArray(game.log) ? game.log : [];
    if (typeof game.note !== 'string') game.note = game.notes?.freeText || '';
    return true;
  }

  function legacyHour(label) {
    const value = String(label || '');
    if (value.includes('夜')) return 21;
    if (value.includes('夕')) return 18;
    if (value.includes('昼')) return 12;
    if (value.includes('朝')) return 8;
    return 8;
  }

  function writeLocal() {
    localStorage.setItem('ddActiveGame', JSON.stringify(game));
  }

  function showToast(message, ms = 2200) {
    const toast = $('toast');
    clearTimeout(toastTimer);
    toast.textContent = message || '';
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
  }

  function formatGameDate() {
    const t = game.time || {};
    if (t.year != null && t.month != null) return `${t.year}年 ${t.month}月 ${t.day ?? 1}日`;
    if (t.month != null) return `${t.month}月 ${t.day ?? 1}日`;
    return `第${t.day ?? 1}日`;
  }

  function formatGameTime() {
    const t = game.time || {};
    return `${String(t.hour ?? 8).padStart(2,'0')}:${String(t.minute ?? 0).padStart(2,'0')}`;
  }

  function skyIcon() {
    const h = Number(game.time?.hour ?? 8);
    return h >= 6 && h < 18 ? '☀' : '☾';
  }

  function renderClock() {
    $('skyIcon').textContent = skyIcon();
    $('gameDate').textContent = formatGameDate();
    $('gameTime').textContent = formatGameTime();
  }

  function abilityMod(score) {
    return Math.floor((Number(score ?? 10) - 10) / 2);
  }

  function fmtMod(value) {
    return value >= 0 ? `+${value}` : String(value);
  }

  function renderPlayerCard() {
    const c = game.character || {};
    const portrait = $('miniPortrait');
    const initial = $('miniInitial');
    $('miniName').textContent = c.name || '主人公';
    $('miniLevel').textContent = `Lv.${c.level || 1}`;
    $('miniHp').textContent = `${c.hp ?? '?'} / ${c.maxHp ?? '?'}`;

    if (c.portrait) {
      portrait.src = c.portrait;
      portrait.hidden = false;
      initial.hidden = true;
    } else {
      portrait.hidden = true;
      initial.hidden = false;
      initial.textContent = (c.name || '?').slice(0, 1);
    }
  }

  function currentLocationLabel() {
    return game.location?.label || game.current?.location || '現在地未設定';
  }

  function currentDescription() {
    return game.current?.description
      || game.current?.text
      || game.current?.sceneText
      || game.world?.description
      || 'ここに現在地の説明文が表示されます。';
  }

  function currentSceneImage() {
    const mode = String(game.current?.mode || '').toLowerCase();
    if (mode === 'world') {
      return game.current?.mapImage || game.world?.mapImage || game.mapImage || game.current?.background || '';
    }
    return game.current?.background || game.current?.image || '';
  }

  function normalizeAction(action, index) {
    if (typeof action === 'string') return {id:`action-${index}`, label:action};
    return {
      id: action?.id || `action-${index}`,
      label: action?.label || action?.name || action?.title || '移動する',
      href: action?.href || '',
      target: action?.target || action?.locationId || action?.placeId || '',
      raw: action || {}
    };
  }

  function currentActions() {
    const source = game.current?.actions
      || game.current?.menu
      || game.current?.destinations
      || game.current?.places
      || [];
    return Array.isArray(source) ? source.map(normalizeAction) : [];
  }

  function renderMainPage() {
    const image = currentSceneImage();
    const actions = currentActions();
    const mode = String(game.current?.mode || 'world');

    return `
      <section class="main-page">
        <div class="scene-frame">
          <div id="sceneImage" class="scene-image">
            ${image ? '' : '<div class="image-placeholder">BACKGROUND / MAP</div>'}
            <div class="scene-caption">${esc(currentLocationLabel())}</div>
          </div>
        </div>
        <div class="destination-area">
          ${actions.length
            ? actions.map(action => `<button class="destination-btn" type="button" data-action-id="${esc(action.id)}">${esc(action.label)}</button>`).join('')
            : `<div class="destination-empty">${mode === 'world' ? '行き先データをここに表示します。' : 'この場所で行ける所をここに表示します。'}</div>`}
        </div>
        <div class="description-box">
          <div class="description-title">${esc(currentLocationLabel())}</div>
          <p>${esc(currentDescription())}</p>
        </div>
      </section>`;
  }

  function questArray() {
    if (Array.isArray(game.quests)) return game.quests;
    if (!game.quests || typeof game.quests !== 'object') return [];
    return ['active','completed','failed'].flatMap(key => {
      const list = Array.isArray(game.quests[key]) ? game.quests[key] : [];
      return list.map(q => ({...q, status:q.status || key}));
    });
  }

  function renderQuestPage() {
    const quests = questArray();
    return `
      <section class="text-page">
        <h2>クエスト</h2>
        ${quests.length ? `<div class="quest-list">${quests.map(q => `
          <article class="paper-card">
            <div class="card-head"><strong>${esc(q.title || q.name || '名称未設定')}</strong><span>${esc(q.status || q.state || '進行中')}</span></div>
            ${q.description ? `<p>${esc(q.description)}</p>` : ''}
            ${Array.isArray(q.objectives) ? `<ul>${q.objectives.map(o => `<li>${esc(typeof o === 'string' ? o : o.text || o.name || '')}</li>`).join('')}</ul>` : ''}
          </article>`).join('')}</div>` : '<div class="empty-page">受注中のクエストはありません。</div>'}
      </section>`;
  }

  function renderInventoryPage() {
    const currency = game.currency || {};
    const equipment = Array.isArray(game.equipment) ? game.equipment : Object.values(game.equipment || {}).filter(Boolean);
    return `
      <section class="text-page">
        <h2>所持品</h2>
        <div class="money-line">GP ${esc(currency.gp || 0)}　SP ${esc(currency.sp || 0)}　CP ${esc(currency.cp || 0)}</div>
        <h3>装備</h3>
        ${equipment.length ? `<div class="item-grid">${equipment.map(item => `<div class="item-tile">${esc(item?.name || item)}</div>`).join('')}</div>` : '<p class="muted">装備情報はありません。</p>'}
        <h3>バッグ</h3>
        ${game.inventory.length ? `<div class="item-grid">${game.inventory.map(item => `<div class="item-tile">${esc(item?.name || item)}${item?.quantity && item.quantity !== 1 ? ` ×${esc(item.quantity)}` : ''}</div>`).join('')}</div>` : '<p class="muted">所持品はありません。</p>'}
      </section>`;
  }

  function flatten(value, prefix = '') {
    if (value == null) return [];
    if (Array.isArray(value)) return value.flatMap(v => typeof v === 'object' ? flatten(v, prefix) : [`${prefix}${v}`]);
    if (typeof value !== 'object') return [`${prefix}${value}`];
    return Object.entries(value).flatMap(([key,v]) => flatten(v, `${prefix}${key}: `));
  }

  function renderSkillPage() {
    const c = game.character || {};
    const lines = [
      ...(c.classFeatures || []),
      ...(c.feats || []),
      ...flatten(c.classChoices || {}),
      ...flatten(c.originChoices || {}),
      ...flatten(c.originSpells || {})
    ];
    return `
      <section class="text-page">
        <h2>スキル</h2>
        ${lines.length ? `<div class="paper-list">${lines.map(line => `<div class="paper-row">${esc(line)}</div>`).join('')}</div>` : '<div class="empty-page">表示するスキル情報はまだありません。</div>'}
      </section>`;
  }

  function renderPlayerPage() {
    const c = game.character || {};
    const a = c.abilities || {};
    const stats = [['STR','str'],['DEX','dex'],['CON','con'],['INT','int'],['WIS','wis'],['CHA','cha']];
    const dex = abilityMod(a.dex);
    const ac = c.ac ?? c.armorClass ?? 10 + dex;
    return `
      <section class="text-page player-page">
        <h2>${esc(c.name || '主人公')}</h2>
        <p class="player-sub">${esc(c.classNameJa || c.className || '')} Lv.${esc(c.level || 1)}　${esc(c.speciesJa || c.species || '')}</p>
        <div class="status-line"><div>HP<strong>${esc(c.hp ?? '?')} / ${esc(c.maxHp ?? '?')}</strong></div><div>AC<strong>${esc(ac)}</strong></div><div>XP<strong>${esc(c.xp || 0)}</strong></div></div>
        <div class="ability-grid">${stats.map(([label,key]) => `<div><span>${label}</span><strong>${esc(a[key] ?? 10)}</strong><small>${esc(fmtMod(abilityMod(a[key])))}</small></div>`).join('')}</div>
        <h3>技能習熟</h3><p>${(c.skills || []).map(esc).join(' / ') || 'なし'}</p>
        <h3>言語</h3><p>${(c.languages || []).map(esc).join(' / ') || 'なし'}</p>
      </section>`;
  }

  function renderMemoPage() {
    return `
      <section class="text-page memo-page">
        <h2>メモ</h2>
        <p class="muted">自由に書けます。GitHubへ保存されるのは「セーブ」を押した時です。</p>
        <textarea id="memoText" class="memo-text" placeholder="気になったこと、行きたい場所、NPCのことなど…">${esc(game.note || '')}</textarea>
      </section>`;
  }

  function logText(entry) {
    if (typeof entry === 'string') return {text:entry,time:'',place:''};
    return {
      text: entry?.text || entry?.summary || entry?.event || entry?.action || JSON.stringify(entry),
      time: entry?.time || entry?.datetime || entry?.date || '',
      place: entry?.location || entry?.place || ''
    };
  }

  function renderLogPage() {
    return `
      <section class="text-page">
        <h2>ログ</h2>
        ${game.log.length ? `<div class="log-list">${game.log.map((entry,index) => {
          const row = logText(entry);
          return `<article class="paper-card"><div class="log-meta">#${index+1}${row.time ? `　${esc(row.time)}` : ''}${row.place ? `　${esc(row.place)}` : ''}</div><p>${esc(row.text)}</p></article>`;
        }).join('')}</div>` : '<div class="empty-page">ログはまだありません。</div>'}
      </section>`;
  }

  function pageHtml(page) {
    if (page === 'quest') return renderQuestPage();
    if (page === 'inventory') return renderInventoryPage();
    if (page === 'skill') return renderSkillPage();
    if (page === 'player') return renderPlayerPage();
    if (page === 'memo') return renderMemoPage();
    if (page === 'log') return renderLogPage();
    return renderMainPage();
  }

  function bindPageContent() {
    const memo = $('memoText');
    if (memo) {
      memo.addEventListener('input', event => {
        game.note = event.target.value;
        writeLocal();
      });
    }

    document.querySelectorAll('[data-action-id]').forEach(button => {
      button.addEventListener('click', () => {
        const action = currentActions().find(item => item.id === button.dataset.actionId);
        if (!action) return;
        if (action.href) {
          writeLocal();
          location.href = action.href;
          return;
        }
        const event = new CustomEvent('dd:main-action', {detail:{action:action.raw || action, game}});
        window.dispatchEvent(event);
        if (!event.defaultPrevented) showToast(`${action.label}：移動処理はこれから接続します。`);
      });
    });
  }

  function renderPage(page, animate = true) {
    const sheet = $('bookPage');
    const swap = () => {
      activePage = page;
      sheet.innerHTML = pageHtml(page);
      document.querySelectorAll('[data-page]').forEach(tab => tab.classList.toggle('active', tab.dataset.page === page));
      bindPageContent();
      sheet.classList.remove('turning');
    };

    clearTimeout(flipTimer);
    if (!animate) {
      swap();
      return;
    }
    sheet.classList.add('turning');
    flipTimer = setTimeout(swap, 135);
  }

  function syncMemo() {
    const memo = $('memoText');
    if (memo) game.note = memo.value;
    writeLocal();
  }

  async function saveGame() {
    syncMemo();
    if (!DDGithub.getToken()) {
      $('tokenModal').hidden = false;
      $('tokenInput').value = '';
      $('tokenInput').focus();
      return;
    }
    const saveButton = $('saveButton');
    saveButton.disabled = true;
    showToast('セーブ画面を開いています…', 6000);
    try {
      game = await DDGithub.saveGame(game);
      writeLocal();
      renderClock();
      renderPlayerCard();
      showToast('GitHubにセーブしました。');
    } catch (error) {
      if (!/キャンセル/.test(error?.message || '')) showToast(error?.message || 'セーブに失敗しました。', 4000);
    } finally {
      saveButton.disabled = false;
    }
  }

  function bindControls() {
    document.querySelectorAll('[data-page]').forEach(tab => tab.addEventListener('click', () => renderPage(tab.dataset.page)));
    $('topButton').addEventListener('click', () => { syncMemo(); location.href = 'DD_top.html'; });
    $('saveButton').addEventListener('click', saveGame);
    $('loadButton').addEventListener('click', () => { syncMemo(); location.href = 'DD_saves.html'; });
    $('logButton').addEventListener('click', () => renderPage('log'));

    $('cancelTokenButton').addEventListener('click', () => $('tokenModal').hidden = true);
    $('connectTokenButton').addEventListener('click', async () => {
      const button = $('connectTokenButton');
      button.disabled = true;
      try {
        DDGithub.setToken($('tokenInput').value);
        await DDGithub.verifyConnection();
        $('tokenModal').hidden = true;
        await saveGame();
      } catch (error) {
        DDGithub.clearToken();
        showToast(error?.message || 'GitHub連携に失敗しました。', 4000);
      } finally {
        button.disabled = false;
      }
    });
    $('tokenInput').addEventListener('keydown', event => { if (event.key === 'Enter') $('connectTokenButton').click(); });
  }

  function applyOptionalBackgrounds() {
    const shell = $('bookShell');
    const screen = $('app');
    const bookBg = game.ui?.bookBackground || '';
    const screenBg = game.ui?.screenBackground || '';
    if (bookBg) shell.style.setProperty('--book-image', `url("${encodeURI(String(bookBg)).replace(/"/g,'%22')}")`);
    if (screenBg) screen.style.setProperty('--screen-image', `url("${encodeURI(String(screenBg)).replace(/"/g,'%22')}")`);
  }

  function setGame(nextGame) {
    game = nextGame || game;
    writeLocal();
    renderClock();
    renderPlayerCard();
    renderPage(activePage, false);
  }

  if (!readGame()) return;
  applyOptionalBackgrounds();
  renderClock();
  renderPlayerCard();
  bindControls();
  renderPage('main', false);

  window.DDMain = {
    getGame: () => game,
    setGame,
    render: () => renderPage(activePage, false),
    openPage: page => renderPage(page),
    saveLocal: writeLocal
  };
})();
