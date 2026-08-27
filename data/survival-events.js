// 雪山サバイバルゲーム イベントデータ
// 初回イベントや会話イベントはここで管理する。

(function () {
  'use strict';

  // survival_event.html → survival_room.html の新構成用。
  // 旧構成のテスト完了状態は引き継がない。
  const STORAGE_KEY = 'survival_game_completed_events_v3';
  const EVENT_STATE_KEY = 'survival_event_state_v1';

  const ASSETS = Object.freeze({
    cabinInterior: 'assets/survival/cabin_interior_01.png',
    grantCabinEyesClosed: 'assets/survival/grant_mercer_cabin_eyes_closed.webp',
    grantCabinEyesOpen: 'assets/survival/grant_mercer_cabin_eyes_open.webp',
    grantNormal: 'assets/survival/grant_normal.png'
  });

  const EVENTS = Object.freeze({
    cabin_grant_first_meeting: {
      id: 'cabin_grant_first_meeting',
      name: '山小屋・グラント初遭遇',
      once: true,
      trigger: {
        type: 'enterScene',
        sceneId: 'cabinInside'
      },
      lockMovement: true,
      pauseGameTime: true,

      // survival_event.html で再生する導入カット。
      eventPageSteps: [
        {
          type: 'eventImage',
          image: ASSETS.grantCabinEyesClosed,
          text: '誰だ？'
        },
        {
          type: 'eventImage',
          image: ASSETS.grantCabinEyesOpen,
          text: '…。'
        },
        {
          type: 'returnToRoom'
        }
      ],

      // survival_room.html で、ぼかした室内背景＋グラント立ち絵の上に再生する会話。
      dialogue: {
        startNode: 'choice_identity',

        nodes: {
          choice_identity: {
            type: 'choice',
            choices: [
              {
                id: 'choice_name',
                label: '私は◯◯◯◯',
                next: 'crash_explain'
              },
              {
                id: 'choice_who',
                label: '貴方は？',
                next: 'answer_first'
              }
            ]
          },

          answer_first: {
            type: 'dialogue',
            speaker: 'グラント',
            text: '先に答えろ。',
            next: 'choice_identity'
          },

          crash_explain: {
            type: 'dialogue',
            speaker: '主人公',
            text: '飛行機が墜落して……。',
            next: 'grant_you_too'
          },

          grant_you_too: {
            type: 'dialogue',
            speaker: 'グラント',
            text: '……君も？',
            next: 'grant_relax'
          },

          grant_relax: {
            type: 'narration',
            text: 'グラントが、ようやく少し警戒を解く。',
            next: 'player_you_too'
          },

          player_you_too: {
            type: 'dialogue',
            speaker: '主人公',
            text: '君も？',
            next: 'grant_plane'
          },

          grant_plane: {
            type: 'dialogue',
            speaker: 'グラント',
            text: '俺も搭乗していた。',
            next: 'injury'
          },

          injury: {
            type: 'narration',
            text: '怪我が痛そうだ。',
            next: 'request'
          },

          request: {
            type: 'dialogue',
            speaker: 'グラント',
            text: '悪いが、この小屋の中を探してきてくれないか。',
            next: 'unlock_exploration'
          },

          unlock_exploration: {
            type: 'setFlag',
            flag: 'cabinExplorationUnlocked',
            value: true,
            next: 'complete'
          },

          complete: {
            type: 'completeEvent'
          }
        }
      }
    }
  });

  function readCompletedEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('[survival-events] completed event data could not be read.', error);
      return {};
    }
  }

  function writeCompletedEvents(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[survival-events] completed event data could not be saved.', error);
    }
  }

  function getEvent(eventId) {
    return EVENTS[eventId] || null;
  }

  function getEventPageSteps(eventId) {
    const event = getEvent(eventId);
    if (!event || !Array.isArray(event.eventPageSteps)) return [];
    return event.eventPageSteps;
  }

  function getDialogueNode(eventId, nodeId) {
    const event = getEvent(eventId);
    if (!event || !event.dialogue || !event.dialogue.nodes) return null;
    return event.dialogue.nodes[nodeId] || null;
  }

  function isCompleted(eventId) {
    return Boolean(readCompletedEvents()[eventId]);
  }

  function shouldRun(eventId) {
    const event = getEvent(eventId);
    if (!event) return false;
    if (!event.once) return true;
    return !isCompleted(eventId);
  }

  function markCompleted(eventId) {
    const data = readCompletedEvents();
    data[eventId] = true;
    writeCompletedEvents(data);
  }

  function resetCompleted(eventId) {
    const data = readCompletedEvents();

    if (eventId) {
      delete data[eventId];
    } else {
      for (const key of Object.keys(data)) delete data[key];
    }

    writeCompletedEvents(data);
  }

  window.SURVIVAL_EVENTS = Object.freeze({
    assets: ASSETS,
    events: EVENTS,
    getEvent,
    getEventPageSteps,
    getDialogueNode,
    shouldRun,
    isCompleted,
    markCompleted,
    resetCompleted
  });

  // survival game.html の外フィールドで拾った物も、共通インベントリへ入れる。
  // 操作は従来どおり「物をタップ」だけ。空きスロットは自動選択する。
  function syncLegacyInventoryFromCommon() {
    if (!window.SURVIVAL_INVENTORY || typeof inventory === 'undefined') return;
    const player = SURVIVAL_INVENTORY.getContainer('player');
    if (!player) return;

    for (const key of Object.keys(inventory)) delete inventory[key];
    for (const slot of player.slots) {
      if (!slot || !slot.itemId) continue;
      inventory[slot.itemId] = (inventory[slot.itemId] || 0) + (Number(slot.qty) || 1);
    }
  }

  function installOutdoorInventoryBridge() {
    if (!window.SURVIVAL_INVENTORY) return;

    window.pickItem = function (item) {
      if (typeof isPaused === 'function' && isPaused()) return;
      const def = typeof window.getSurvivalItem === 'function' ? window.getSurvivalItem(item.itemId) : null;
      if (!def) return;

      const result = SURVIVAL_INVENTORY.addItem('player', item.itemId, 1);
      if (!result.ok) {
        if (result.reason === 'container_full' && typeof showMessages === 'function') {
          showMessages(['これ以上持てません。']);
        }
        return;
      }

      if (typeof pickedItems !== 'undefined') pickedItems.add(item.id);
      syncLegacyInventoryFromCommon();
      if (typeof renderSceneItems === 'function') renderSceneItems();
      if (typeof renderInventory === 'function') renderInventory();
      if (typeof showMessages === 'function') showMessages([def.name + 'を拾いました。']);
    };

    window.renderInventory = function () {
      const list = document.getElementById('inventoryList');
      if (!list) return;
      const player = SURVIVAL_INVENTORY.getContainer('player');
      const counts = {};

      if (player) {
        for (const slot of player.slots) {
          if (!slot || !slot.itemId) continue;
          counts[slot.itemId] = (counts[slot.itemId] || 0) + (Number(slot.qty) || 1);
        }
      }

      const rows = [];
      for (const [id, count] of Object.entries(counts)) {
        const def = typeof window.getSurvivalItem === 'function' ? window.getSurvivalItem(id) : null;
        rows.push('<div class="item-row"><span class="item-name">' + (def ? def.name : id) + '</span><span class="item-count">× ' + count + '</span></div>');
      }
      list.innerHTML = rows.length ? rows.join('') : '<div class="empty-message">まだ何も持っていません。</div>';
    };

    syncLegacyInventoryFromCommon();
    if (typeof renderInventory === 'function') renderInventory();
  }

  function loadCommonInventoryForOutdoor() {
    if (window.SURVIVAL_INVENTORY) {
      installOutdoorInventoryBridge();
      return;
    }

    const existing = document.querySelector('script[src="data/survival-inventory.js"]');
    if (existing) {
      existing.addEventListener('load', installOutdoorInventoryBridge, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'data/survival-inventory.js';
    script.addEventListener('load', installOutdoorInventoryBridge, { once: true });
    script.addEventListener('error', function () {
      console.error('[survival-events] survival-inventory.js could not be loaded.');
    }, { once: true });
    document.head.appendChild(script);
  }

  // survival game.html の「中に入る」だけを専用画面へ振り分ける。
  // 初回：survival_event.html → survival_room.html
  // 初回イベント完了後：survival_room.html へ直接入る。
  window.addEventListener('DOMContentLoaded', function () {
    const pageName = decodeURIComponent(location.pathname.split('/').pop() || '');
    if (pageName !== 'survival game.html') return;

    loadCommonInventoryForOutdoor();

    if (typeof window.enterCabin !== 'function') return;

    window.enterCabin = function () {
      try {
        syncLegacyInventoryFromCommon();
        const state = {
          gameSeconds: typeof gameSeconds !== 'undefined' ? gameSeconds : 8 * 60 * 60,
          bodyTemperature: typeof bodyTemperature !== 'undefined' ? bodyTemperature : 36.7,
          hunger: typeof hunger !== 'undefined' ? hunger : 100,
          stamina: typeof stamina !== 'undefined' ? stamina : 100,
          currentScene: 'cabinInside',
          inventory: typeof inventory !== 'undefined' ? Object.assign({}, inventory) : {},
          pickedItems: typeof pickedItems !== 'undefined' ? Array.from(pickedItems) : []
        };
        sessionStorage.setItem(EVENT_STATE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('[survival-events] event state could not be saved.', error);
      }

      if (isCompleted('cabin_grant_first_meeting')) {
        location.href = 'survival_room.html';
      } else {
        location.href = 'survival_event.html?event=cabin_grant_first_meeting';
      }
    };
  });
})();
