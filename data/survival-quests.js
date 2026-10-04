// 雪山サバイバルゲーム クエスト管理
// 会話イベントとは分離し、依頼の状態だけを保存する。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_quests_v1';

  const QUESTS = Object.freeze({
    grant_first_aid: Object.freeze({
      id: 'grant_first_aid',
      title: 'グラントの治療',
      objective: '小屋の中で、薬や包帯など治療に使えそうな物を探す。'
    })
  });

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('[survival-quests] クエスト保存データを読み込めませんでした。', error);
      return {};
    }
  }

  let state = readState();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[survival-quests] クエストを保存できませんでした。', error);
    }
  }

  function getDefinition(id) {
    return QUESTS[String(id || '')] || null;
  }

  function getStatus(id) {
    const key = String(id || '');
    return state[key] || 'inactive';
  }

  function get(id) {
    const def = getDefinition(id);
    if (!def) return null;
    return Object.assign({}, def, { status: getStatus(def.id) });
  }

  function activate(id) {
    const def = getDefinition(id);
    if (!def) return false;
    if (getStatus(def.id) === 'completed') return true;
    state[def.id] = 'active';
    save();
    return true;
  }

  function ensureActive(id) {
    const def = getDefinition(id);
    if (!def) return false;
    if (getStatus(def.id) === 'inactive') {
      state[def.id] = 'active';
      save();
    }
    return true;
  }

  function complete(id) {
    const def = getDefinition(id);
    if (!def) return false;
    state[def.id] = 'completed';
    save();
    return true;
  }

  function isActive(id) {
    return getStatus(id) === 'active';
  }

  function getActive() {
    return Object.keys(QUESTS)
      .filter(id => isActive(id))
      .map(id => get(id));
  }

  function reset() {
    state = {};
    save();
  }

  window.SURVIVAL_QUESTS = Object.freeze({
    storageKey: STORAGE_KEY,
    quests: QUESTS,
    get,
    getStatus,
    getActive,
    activate,
    ensureActive,
    complete,
    isActive,
    reset
  });
})();
