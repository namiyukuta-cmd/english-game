// 雪山サバイバルゲーム イベントデータ
// 初回イベントや会話イベントはここで管理する。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_game_completed_events_v1';
  const EVENT_STATE_KEY = 'survival_event_state_v1';
  const EVENT_RESUME_KEY = 'survival_event_resume_v1';

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
      // 「中に入る」直後は通常画面の立ち絵を出さず、まずここを再生する。
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
          type: 'returnToGame'
        }
      ],

      // 導入カット終了後、survival game.html に戻ってから会話へ入る。
      steps: [
        {
          type: 'startDialogue'
        }
      ],

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
      for (const key of Object.keys(data)) {
        delete data[key];
      }
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

  // survival game.html と survival_event.html の受け渡し。
  // survival game.html 本体を大きく書き換えず、初回入室だけ専用イベント画面へ分離する。
  window.addEventListener('DOMContentLoaded', function () {
    const pageName = decodeURIComponent(location.pathname.split('/').pop() || '');
    if (pageName !== 'survival game.html') return;

    if (typeof window.enterCabin === 'function') {
      window.enterCabin = function () {
        try {
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
        location.href = 'survival_event.html?event=cabin_grant_first_meeting';
      };
    }

    const resumeEventId = sessionStorage.getItem(EVENT_RESUME_KEY);
    if (resumeEventId !== 'cabin_grant_first_meeting') return;
    sessionStorage.removeItem(EVENT_RESUME_KEY);

    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(EVENT_STATE_KEY) || 'null');
    } catch (error) {
      saved = null;
    }

    try {
      if (saved) {
        if (Number.isFinite(Number(saved.gameSeconds))) gameSeconds = Number(saved.gameSeconds);
        if (Number.isFinite(Number(saved.bodyTemperature))) bodyTemperature = Number(saved.bodyTemperature);
        if (Number.isFinite(Number(saved.hunger))) hunger = Number(saved.hunger);
        if (Number.isFinite(Number(saved.stamina))) stamina = Number(saved.stamina);
        if (typeof inventory !== 'undefined' && saved.inventory && typeof saved.inventory === 'object') {
          for (const key of Object.keys(inventory)) delete inventory[key];
          Object.assign(inventory, saved.inventory);
        }
        if (typeof pickedItems !== 'undefined' && Array.isArray(saved.pickedItems)) {
          pickedItems.clear();
          for (const id of saved.pickedItems) pickedItems.add(id);
        }
      }

      currentScene = 'cabinInside';
      metSurvivor = true;
      cabinExplorationUnlocked = false;
      eventActive = true;
      activeEventId = 'cabin_grant_first_meeting';
      eventSteps = [];
      eventStepIndex = 0;

      if (typeof hideMessage === 'function') hideMessage();
      if (typeof renderClock === 'function') renderClock();
      if (typeof renderMeters === 'function') renderMeters();
      if (typeof renderInventory === 'function') renderInventory();
      if (typeof renderMenuUnlocks === 'function') renderMenuUnlocks();
      if (typeof renderScene === 'function') renderScene();
      if (typeof showGrantCharacter === 'function') showGrantCharacter(ASSETS.grantNormal);
      if (typeof renderDirections === 'function') renderDirections();

      // 戻った直後は、ぼかした室内背景＋中央のグラント立ち絵。
      // その状態のまま既存の二択会話へ続ける。
      setTimeout(function () {
        if (typeof startEventDialogue === 'function') startEventDialogue();
      }, 0);
    } catch (error) {
      console.error('[survival-events] event resume failed.', error);
      sessionStorage.removeItem(EVENT_STATE_KEY);
    }
  });
})();
