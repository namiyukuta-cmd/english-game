// 雪山サバイバルゲーム イベントデータ
// 初回イベントや会話イベントはここで管理する。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_game_completed_events_v1';

  const ASSETS = Object.freeze({
    cabinInterior: 'assets/survival/cabin_interior_01.png',
    grantCabinEyesClosed: 'assets/survival/grant_mercer_cabin_eyes_closed.jpg',
    grantCabinEyesOpen: 'assets/survival/grant_mercer_cabin_eyes_open.jpg',
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
      ]
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
    shouldRun,
    isCompleted,
    markCompleted,
    resetCompleted
  });
})();
