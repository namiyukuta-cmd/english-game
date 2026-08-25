(() => {
  'use strict';

  const ROOT = 'dd-saves';
  const ACTIVE_KEY = 'ddActiveGame';
  const SCHEMA_VERSION = 3;

  const clone = value => JSON.parse(JSON.stringify(value));

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureCharacterId(game) {
    game.character = game.character || {};
    if (!game.character.id) {
      game.character.id = `character-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    return DDGithub.safeId(game.character.id);
  }

  function locationLabel(game) {
    return game.location?.label
      || game.location?.placeName
      || game.current?.location
      || game.current?.place
      || '未設定';
  }

  function normalizeGame(input) {
    const game = clone(input || {});
    ensureCharacterId(game);

    game.meta = game.meta || {};
    game.meta.saveFormat = SCHEMA_VERSION;

    game.character = game.character || {};
    if (!Array.isArray(game.character.status)) game.character.status = [];

    game.time = game.time || {day: 1, hour: 8, minute: 0};
    if (game.time.day == null) game.time.day = 1;
    if (game.time.hour == null) game.time.hour = 8;
    if (game.time.minute == null) game.time.minute = 0;

    game.current = game.current || {};
    if (!game.current.mode) game.current.mode = 'world';
    if (game.current.traveling == null) game.current.traveling = false;
    if (game.current.dungeon === undefined) game.current.dungeon = null;
    if (game.current.combat === undefined) game.current.combat = null;

    game.location = game.location || {
      worldId: game.current.worldId || 'world_01',
      regionId: game.current.regionId || null,
      settlementId: game.current.settlementId || null,
      placeId: game.current.placeId || null,
      label: game.current.location || '未設定'
    };
    if (!game.location.label) game.location.label = game.current.location || '未設定';
    if (!game.current.location) game.current.location = game.location.label;

    game.currency = game.currency || {gp: 0, sp: 0, cp: 0};
    if (!Array.isArray(game.inventory)) game.inventory = [];
    if (!game.equipment) game.equipment = [];

    if (!game.quests) game.quests = [];
    if (!game.npcs) game.npcs = {};
    if (!game.npcState) game.npcState = {};

    if (!Array.isArray(game.log)) game.log = [];
    if (typeof game.note !== 'string') game.note = game.notes?.freeText || '';

    game.world = game.world || {};
    game.worldState = game.worldState || {flags: {}, events: {}, places: {}};
    game.worldState.flags = game.worldState.flags || {};
    game.worldState.events = game.worldState.events || {};
    game.worldState.places = game.worldState.places || {};

    delete game.__github;
    delete game.__save;
    return game;
  }

  function characterIdFromGame(game) {
    const copy = game;
    return ensureCharacterId(copy);
  }

  function characterRoot(characterId) {
    return `${ROOT}/${DDGithub.safeId(characterId)}`;
  }

  function profilePath(characterId) {
    return `${characterRoot(characterId)}/profile.json`;
  }

  function saveDir(characterId) {
    return `${characterRoot(characterId)}/saves`;
  }

  function savePath(characterId, filename) {
    return `${saveDir(characterId)}/${filename}`;
  }

  function formatFilename(number) {
    return `save_${String(number).padStart(4, '0')}.json`;
  }

  function saveNumber(filename) {
    const match = /^save_(\d+)\.json$/i.exec(filename || '');
    return match ? Number(match[1]) : 0;
  }

  function snapshotMeta(game, info = {}) {
    return {
      characterId: characterIdFromGame(game),
      filename: info.filename || '',
      label: String(info.label || '').trim(),
      createdAt: info.createdAt || nowIso(),
      updatedAt: nowIso(),
      gameTime: clone(game.time || {}),
      location: locationLabel(game)
    };
  }

  async function writeProfile(game) {
    const characterId = characterIdFromGame(game);
    let old = null;
    try {
      old = (await DDGithub.readJsonPath(profilePath(characterId))).data;
    } catch (_) {}

    const c = game.character || {};
    const profile = {
      schemaVersion: 1,
      characterId,
      createdAt: old?.createdAt || game.meta?.createdAt || nowIso(),
      updatedAt: nowIso(),
      name: c.name || '主人公',
      level: c.level || 1,
      className: c.className || '',
      classNameJa: c.classNameJa || '',
      species: c.species || '',
      speciesJa: c.speciesJa || '',
      portrait: c.portrait || '',
      latestLocation: locationLabel(game),
      latestGameTime: clone(game.time || {})
    };
    await DDGithub.writeJsonPath(profilePath(characterId), profile, `Update DD character profile: ${profile.name}`);
    return profile;
  }

  async function listCharacters() {
    const items = await DDGithub.listPath(ROOT);
    const dirs = items.filter(item => item.type === 'dir');
    const results = await Promise.all(dirs.map(async dir => {
      try {
        const file = await DDGithub.readJsonPath(`${dir.path}/profile.json`);
        return {id: dir.name, path: dir.path, profile: file.data};
      } catch (_) {
        return null;
      }
    }));
    return results
      .filter(Boolean)
      .sort((a, b) => String(b.profile?.updatedAt || '').localeCompare(String(a.profile?.updatedAt || '')));
  }

  async function listSnapshots(characterId) {
    const items = await DDGithub.listPath(saveDir(characterId));
    const files = items.filter(item => item.type === 'file' && /^save_\d+\.json$/i.test(item.name));
    const results = await Promise.all(files.map(async file => {
      try {
        const loaded = await DDGithub.readJsonPath(file.path);
        const game = loaded.data;
        const info = game.saveInfo || {};
        return {
          filename: file.name,
          path: file.path,
          sha: loaded.sha,
          label: info.label || '',
          createdAt: info.createdAt || game.meta?.createdAt || '',
          updatedAt: info.updatedAt || game.meta?.updatedAt || '',
          gameTime: info.gameTime || game.time || {},
          location: info.location || locationLabel(game),
          level: game.character?.level || 1,
          game
        };
      } catch (_) {
        return null;
      }
    }));
    return results
      .filter(Boolean)
      .sort((a, b) => saveNumber(b.filename) - saveNumber(a.filename));
  }

  async function createSnapshot(inputGame, label = '') {
    const game = normalizeGame(inputGame);
    const characterId = characterIdFromGame(game);
    const files = await DDGithub.listPath(saveDir(characterId));
    const max = files.reduce((value, file) => Math.max(value, saveNumber(file.name)), 0);
    const filename = formatFilename(max + 1);
    const info = snapshotMeta(game, {filename, label});
    game.saveInfo = info;
    game.meta.updatedAt = info.updatedAt;

    const result = await DDGithub.writeJsonPath(
      savePath(characterId, filename),
      game,
      `Create DD save: ${game.character?.name || characterId} ${filename}`
    );
    await writeProfile(game);

    game.__save = {characterId, filename, path: savePath(characterId, filename), sha: result.sha};
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(game));
    return game;
  }

  async function overwriteSnapshot(inputGame, filename, label = '') {
    const game = normalizeGame(inputGame);
    const characterId = characterIdFromGame(game);
    const path = savePath(characterId, filename);
    let oldInfo = {};
    try {
      oldInfo = (await DDGithub.readJsonPath(path)).data?.saveInfo || {};
    } catch (_) {}

    const info = snapshotMeta(game, {
      filename,
      label: String(label || '').trim() || oldInfo.label || '',
      createdAt: oldInfo.createdAt || nowIso()
    });
    game.saveInfo = info;
    game.meta.updatedAt = info.updatedAt;

    const result = await DDGithub.writeJsonPath(
      path,
      game,
      `Overwrite DD save: ${game.character?.name || characterId} ${filename}`
    );
    await writeProfile(game);

    game.__save = {characterId, filename, path, sha: result.sha};
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(game));
    return game;
  }

  async function loadSnapshot(characterId, filename) {
    const path = savePath(characterId, filename);
    const loaded = await DDGithub.readJsonPath(path);
    const game = normalizeGame(loaded.data);
    game.saveInfo = loaded.data.saveInfo || game.saveInfo || {};
    game.__save = {characterId, filename, path, sha: loaded.sha};
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(game));
    return game;
  }

  async function deleteSnapshot(characterId, filename) {
    return DDGithub.deletePath(
      savePath(characterId, filename),
      `Delete DD save: ${characterId} ${filename}`
    );
  }

  function fmtDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ja-JP', {dateStyle:'short', timeStyle:'short'}).format(date);
  }

  function fmtGameTime(time = {}) {
    const parts = [];
    if (time.year != null) parts.push(`${time.year}年`);
    if (time.month != null) parts.push(`${time.month}月`);
    if (time.day != null) parts.push(`${time.day}日`);
    if (time.hour != null) parts.push(`${String(time.hour).padStart(2,'0')}:${String(time.minute ?? 0).padStart(2,'0')}`);
    return parts.join(' ') || '日時未設定';
  }

  function injectDialogStyle() {
    if (document.getElementById('ddSaveDialogStyle')) return;
    const style = document.createElement('style');
    style.id = 'ddSaveDialogStyle';
    style.textContent = `
      .dd-save-overlay{position:fixed;z-index:10000;inset:0;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px}
      .dd-save-dialog{width:min(620px,100%);max-height:88dvh;overflow:auto;border:1px solid #806c50;background:#211d17;color:#f1e8da;padding:18px;box-shadow:0 18px 42px rgba(0,0,0,.55);font-family:Georgia,"Yu Mincho",serif}
      .dd-save-dialog h2{font-size:22px;margin:0 0 8px}.dd-save-dialog p{font-size:17px;line-height:1.55;color:#c4b49e;margin:7px 0}
      .dd-save-label{display:block;margin:14px 0 6px;font-size:17px}.dd-save-input{width:100%;min-height:48px;border:1px solid #6b5c47;background:#15120f;color:#f1e8da;padding:10px 12px;font-size:17px}
      .dd-save-new{width:100%;min-height:52px;margin-top:12px;border:1px solid #8c7352;background:#594831;color:#fff0db;font-size:17px;font-weight:700}
      .dd-save-existing{display:grid;gap:9px;margin-top:16px}.dd-save-row{border:1px solid #514636;background:#191611;padding:11px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
      .dd-save-row strong{display:block;font-size:17px}.dd-save-row span{display:block;margin-top:4px;color:#b8a78f;font-size:14px;line-height:1.45}.dd-save-overwrite{min-height:46px;border:1px solid #725f46;background:#332a20;color:#f1e8da;padding:8px 12px;font-size:16px;font-weight:700}
      .dd-save-cancel{width:100%;min-height:46px;margin-top:14px;border:1px solid #594c3b;background:transparent;color:#d7c7b0;font-size:17px}.dd-save-empty{padding:15px;border:1px dashed #594c3b;color:#a7957d;font-size:16px;text-align:center}
      @media(max-width:560px){.dd-save-dialog{padding:14px}.dd-save-row{grid-template-columns:1fr}.dd-save-overwrite{width:100%}}
    `;
    document.head.appendChild(style);
  }

  async function openSaveDialog(inputGame) {
    if (!DDGithub.getToken()) throw new Error('GitHubへ保存するにはトークンが必要です。');
    injectDialogStyle();

    const workingGame = normalizeGame(inputGame);
    const characterId = characterIdFromGame(workingGame);
    const snapshots = await listSnapshots(characterId);

    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.className = 'dd-save-overlay';
      const currentName = workingGame.character?.name || '主人公';
      overlay.innerHTML = `
        <section class="dd-save-dialog" role="dialog" aria-modal="true" aria-label="セーブ">
          <h2>セーブ</h2>
          <p>${currentName} の冒険世界に保存します。</p>
          <label class="dd-save-label" for="ddSaveLabel">セーブ名（任意）</label>
          <input id="ddSaveLabel" class="dd-save-input" maxlength="80" placeholder="例：洞窟に入る前">
          <button class="dd-save-new" type="button">新しいセーブを作る</button>
          <div class="dd-save-existing"></div>
          <button class="dd-save-cancel" type="button">キャンセル</button>
        </section>`;
      document.body.appendChild(overlay);

      const input = overlay.querySelector('#ddSaveLabel');
      const list = overlay.querySelector('.dd-save-existing');
      const finish = value => { overlay.remove(); resolve(value); };
      const cancel = () => { overlay.remove(); reject(new Error('セーブをキャンセルしました。')); };

      if (!snapshots.length) {
        list.innerHTML = '<div class="dd-save-empty">このキャラクターの既存セーブはありません。</div>';
      } else {
        snapshots.forEach(snapshot => {
          const row = document.createElement('div');
          row.className = 'dd-save-row';
          const title = snapshot.label || snapshot.filename.replace(/\.json$/i, '');
          const details = [fmtGameTime(snapshot.gameTime), snapshot.location, fmtDate(snapshot.updatedAt)].filter(Boolean).join(' / ');
          row.innerHTML = '<div><strong></strong><span></span></div><button class="dd-save-overwrite" type="button">上書き</button>';
          row.querySelector('strong').textContent = title;
          row.querySelector('span').textContent = details;
          row.querySelector('button').addEventListener('click', async () => {
            if (!confirm(`「${title}」に現在の状態を上書きしますか？`)) return;
            const buttons = overlay.querySelectorAll('button');
            buttons.forEach(button => button.disabled = true);
            try {
              const saved = await overwriteSnapshot(workingGame, snapshot.filename, input.value);
              finish(saved);
            } catch (error) {
              buttons.forEach(button => button.disabled = false);
              alert(error.message || '上書きに失敗しました。');
            }
          });
          list.appendChild(row);
        });
      }

      overlay.querySelector('.dd-save-new').addEventListener('click', async () => {
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(button => button.disabled = true);
        try {
          const saved = await createSnapshot(workingGame, input.value);
          finish(saved);
        } catch (error) {
          buttons.forEach(button => button.disabled = false);
          alert(error.message || '新規セーブに失敗しました。');
        }
      });

      overlay.querySelector('.dd-save-cancel').addEventListener('click', cancel);
      overlay.addEventListener('click', event => { if (event.target === overlay) cancel(); });
    });
  }

  window.DDSave = {
    SCHEMA_VERSION,
    normalizeGame,
    listCharacters,
    listSnapshots,
    createSnapshot,
    overwriteSnapshot,
    loadSnapshot,
    deleteSnapshot,
    openSaveDialog,
    fmtDate,
    fmtGameTime,
    locationLabel
  };
})();