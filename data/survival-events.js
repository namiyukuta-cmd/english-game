// 雪山サバイバルゲーム イベントデータ
// 初回イベントや会話イベントはここで管理する。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_game_completed_events_v1';

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

      // 現在のイベントランナーで使用している導入部分。
      // 会話分岐は下の dialogue に保持し、HTML側から接続する。
      steps: [
        {
          type: 'background',
          image: ASSETS.cabinInterior
        },
        {
          type: 'eventImage',
          image: ASSETS.grantCabinEyesClosed,
          text: '……人がいる。'
        },
        {
          type: 'eventImage',
          image: ASSETS.grantCabinEyesOpen,
          speaker: '？？？',
          text: '誰だ？'
        },
        {
          type: 'returnToScene',
          background: ASSETS.cabinInterior
        },
        {
          type: 'showCharacter',
          characterId: 'grant_mercer',
          image: ASSETS.grantNormal,
          position: 'center',
          tappable: true
        },
        {
          type: 'setFlag',
          flag: 'metSurvivor',
          value: true
        },
        {
          type: 'completeEvent'
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
    getDialogueNode,
    shouldRun,
    isCompleted,
    markCompleted,
    resetCompleted
  });
})();
