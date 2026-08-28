// 雪山サバイバルゲーム 山小屋画面UI
// survival_room.html の表示・初回会話・間取り図操作を担当する。

(function () {
  'use strict';

  const EVENT_ID = 'cabin_grant_first_meeting';
  const EVENT_STATE_KEY = 'survival_event_state_v1';
  const ROOM_FLAGS_KEY = 'survival_room_flags_v1';
  const FIRST_FLOORPLAN_IMAGE = 'assets/survival/survival_room01.png';
  const BASEMENT_FLOORPLAN_IMAGE = 'assets/survival/survival_room02.png';

  const $ = id => document.getElementById(id);

  let messageOpen = false;
  let messagePages = [];
  let messageIndex = 0;
  let finalMessageAction = null;
  let currentFloor = 'first';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readSavedState() {
    try {
      return JSON.parse(sessionStorage.getItem(EVENT_STATE_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function setFillLevel(id, percent) {
    const rect = $(id);
    if (!rect) return;
    const value = clamp(Number(percent) || 0, 0, 100);
    const height = 24 * value / 100;
    rect.setAttribute('y', String(24 - height));
    rect.setAttribute('height', String(height));
  }

  function normalColor(value) {
    if (value <= 20) return '#c62828';
    if (value <= 40) return '#d6a000';
    return '#151515';
  }

  function temperatureColor(value) {
    if (value < 33) return '#c62828';
    if (value < 35) return '#d6a000';
    return '#151515';
  }

  function renderStatus() {
    const state = readSavedState() || {};
    const total = Math.floor(Number(state.gameSeconds) || 8 * 60 * 60);
    const day = Math.floor(total / 86400) + 1;
    const time = total % 86400;
    const hour = Math.floor(time / 3600);
    const minute = Math.floor((time % 3600) / 60);
    const second = time % 60;

    const bodyTemperature = Number.isFinite(Number(state.bodyTemperature))
      ? Number(state.bodyTemperature)
      : 36.7;
    const hunger = Number.isFinite(Number(state.hunger)) ? Number(state.hunger) : 100;
    const stamina = Number.isFinite(Number(state.stamina)) ? Number(state.stamina) : 100;

    if ($('day')) $('day').textContent = 'Day.' + day;
    if ($('clock')) {
      $('clock').textContent =
        String(hour).padStart(2, '0') + ':' +
        String(minute).padStart(2, '0') + ':' +
        String(second).padStart(2, '0');
    }
    if ($('placeName')) $('placeName').textContent = '山小屋・1階';
    if ($('roomTemperature')) $('roomTemperature').textContent = '18℃';
    if ($('weather')) $('weather').textContent = '雪';

    if ($('tempValue')) $('tempValue').textContent = '体温 ' + bodyTemperature.toFixed(1) + '℃';
    if ($('hungerValue')) $('hungerValue').textContent = Math.round(hunger);
    if ($('staminaValue')) $('staminaValue').textContent = Math.round(stamina);

    const tempPercent = clamp(((bodyTemperature - 28) / (36.8 - 28)) * 100, 0, 100);
    setFillLevel('tempClipRect', tempPercent);
    setFillLevel('hungerClipRect', hunger);
    setFillLevel('staminaClipRect', stamina);

    if ($('tempFill')) $('tempFill').style.fill = temperatureColor(bodyTemperature);
    if ($('hungerFill')) $('hungerFill').style.fill = normalColor(hunger);
    if ($('staminaFill')) $('staminaFill').style.fill = normalColor(stamina);
  }

  function getPageChoices(page) {
    if (!page || typeof page !== 'object') return [];
    return Array.isArray(page.choices) ? page.choices : [];
  }

  function renderMessage() {
    const messageText = $('messageText');
    const messageProgress = $('messageProgress');
    const messageChoices = $('messageChoices');
    if (!messageText || !messageProgress || !messageChoices) return;

    messageChoices.innerHTML = '';

    if (!messagePages.length) {
      messageText.textContent = '';
      messageProgress.textContent = '';
      messageChoices.classList.add('hidden');
      return;
    }

    const page = messagePages[messageIndex];
    messageText.textContent = typeof page === 'string' ? page : (page.text || '');
    messageProgress.textContent = (messageIndex + 1) + ' / ' + messagePages.length;

    const choices = getPageChoices(page);
    if (!choices.length) {
      messageChoices.classList.add('hidden');
      return;
    }

    choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'message-choice';
      button.textContent = choice.label;
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (!messageOpen) return;
        hideMessage();
        choice.action();
      });
      messageChoices.appendChild(button);
    });

    messageChoices.classList.remove('hidden');
  }

  function setMessageOpen(open) {
    const panel = $('messagePanel');
    const toggle = $('messageToggle');
    if (!panel || !toggle) return;

    messageOpen = open;
    panel.classList.toggle('closed', !open);
    toggle.textContent = open ? '◀' : '▶';
  }

  function showMessages(pages, options = {}) {
    const panel = $('messagePanel');
    if (!panel) return;

    panel.classList.remove('hidden');
    messagePages = Array.isArray(pages) ? pages.slice() : [String(pages)];
    messageIndex = 0;
    finalMessageAction = options.finalAction || null;
    renderMessage();
    setMessageOpen(true);
  }

  function hideMessage() {
    setMessageOpen(false);
  }

  function advanceMessage() {
    if (!messagePages.length) {
      hideMessage();
      return;
    }

    const page = messagePages[messageIndex];
    if (getPageChoices(page).length) return;

    const isLast = messageIndex >= messagePages.length - 1;
    if (!isLast) {
      messageIndex += 1;
      renderMessage();
      return;
    }

    if (finalMessageAction) {
      const action = finalMessageAction;
      finalMessageAction = null;
      hideMessage();
      action();
      return;
    }

    hideMessage();
  }

  function saveFlag(flag, value) {
    let data = {};
    try {
      data = JSON.parse(sessionStorage.getItem(ROOM_FLAGS_KEY) || '{}') || {};
    } catch (error) {
      data = {};
    }
    data[flag] = value;
    sessionStorage.setItem(ROOM_FLAGS_KEY, JSON.stringify(data));
  }

  function ensureHotspotGlowStyle() {
    if (document.getElementById('survivalHotspotGlowStyle')) return;

    const style = document.createElement('style');
    style.id = 'survivalHotspotGlowStyle';
    style.textContent = `
      .room-hotspot.tap-glow {
        background: rgba(255, 226, 92, .12) !important;
        box-shadow:
          inset 0 0 0 2px rgba(255, 214, 64, .78),
          0 0 10px rgba(255, 210, 56, .72),
          0 0 20px rgba(255, 210, 56, .35);
        animation: survivalHotspotPulse 1.15s ease-in-out infinite alternate;
      }

      .room-hotspot.tap-glow:active {
        background: rgba(255, 224, 92, .28) !important;
        box-shadow:
          inset 0 0 0 3px rgba(255, 196, 20, .95),
          0 0 14px rgba(255, 196, 20, .95),
          0 0 26px rgba(255, 196, 20, .55);
      }

      @keyframes survivalHotspotPulse {
        from {
          opacity: .72;
          filter: brightness(1);
        }
        to {
          opacity: 1;
          filter: brightness(1.16);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setHotspotsForFloor(floor) {
    const roomHotspots = $('roomHotspots');
    if (!roomHotspots) return;

    roomHotspots.style.display = '';

    roomHotspots.querySelectorAll('.room-hotspot').forEach(button => {
      const action = button.dataset.roomAction;
      const visible = floor === 'first' || action === 'basement';
      button.style.display = visible ? '' : 'none';
      button.classList.toggle('tap-glow', visible);

      if (action === 'basement') {
        button.setAttribute(
          'aria-label',
          floor === 'basement' ? '1階へ上がる' : '地下へ降りる'
        );
      }
    });
  }

  function showEventMode() {
    currentFloor = 'first';

    const floorplanLayer = $('floorplanLayer');
    const messagePanel = $('messagePanel');
    const roomBackground = $('roomBackground');
    const grantCharacter = $('grantCharacter');
    const grantCharacterImage = $('grantCharacterImage');

    if (floorplanLayer) floorplanLayer.classList.remove('visible');
    if (messagePanel) messagePanel.classList.remove('hidden');
    setHotspotsForFloor('first');

    if (roomBackground && window.SURVIVAL_EVENTS) {
      roomBackground.style.backgroundImage = `url("${SURVIVAL_EVENTS.assets.cabinInterior}")`;
      roomBackground.style.opacity = '1';
    }

    if (grantCharacterImage && window.SURVIVAL_EVENTS) {
      grantCharacterImage.src = SURVIVAL_EVENTS.assets.grantNormal;
    }
    if (grantCharacter) grantCharacter.classList.add('visible');
  }

  function showFloorplan() {
    currentFloor = 'first';

    const floorplanLayer = $('floorplanLayer');
    const floorplanImage = $('floorplanImage');
    const messagePanel = $('messagePanel');
    const grantCharacter = $('grantCharacter');
    const roomBackground = $('roomBackground');

    hideMessage();
    if (messagePanel) messagePanel.classList.add('hidden');
    if (grantCharacter) grantCharacter.classList.remove('visible');
    if (roomBackground) roomBackground.style.opacity = '0';
    if ($('placeName')) $('placeName').textContent = '山小屋・1階';
    setHotspotsForFloor('first');

    if (floorplanImage) {
      floorplanImage.src = FIRST_FLOORPLAN_IMAGE;
    }
    if (floorplanLayer) floorplanLayer.classList.add('visible');
  }

  function showBasement() {
    currentFloor = 'basement';

    const floorplanLayer = $('floorplanLayer');
    const floorplanImage = $('floorplanImage');
    const messagePanel = $('messagePanel');
    const grantCharacter = $('grantCharacter');
    const roomBackground = $('roomBackground');

    hideMessage();
    if (messagePanel) messagePanel.classList.add('hidden');
    if (grantCharacter) grantCharacter.classList.remove('visible');
    if (roomBackground) roomBackground.style.opacity = '0';
    if ($('placeName')) $('placeName').textContent = '山小屋・地下';

    // 地下では階段のタップ領域だけ残し、同じ階段を押すと1階へ戻る。
    setHotspotsForFloor('basement');

    if (floorplanImage) {
      floorplanImage.src = BASEMENT_FLOORPLAN_IMAGE;
    }
    if (floorplanLayer) floorplanLayer.classList.add('visible');
  }

  function runDialogueNode(nodeId) {
    if (!window.SURVIVAL_EVENTS) {
      showFloorplan();
      return;
    }

    const node = SURVIVAL_EVENTS.getDialogueNode(EVENT_ID, nodeId);
    if (!node) {
      showFloorplan();
      return;
    }

    switch (node.type) {
      case 'choice':
        showMessages([
          {
            text: '',
            choices: (node.choices || []).map(choice => ({
              label: choice.label,
              action: () => runDialogueNode(choice.next)
            }))
          }
        ]);
        break;

      case 'dialogue':
        showMessages([
          node.speaker ? node.speaker + '\n「' + node.text + '」' : node.text
        ], {
          finalAction: () => runDialogueNode(node.next)
        });
        break;

      case 'narration':
        showMessages([node.text], {
          finalAction: () => runDialogueNode(node.next)
        });
        break;

      case 'setFlag':
        saveFlag(node.flag, node.value);
        if (node.next) runDialogueNode(node.next);
        else showFloorplan();
        break;

      case 'completeEvent':
        SURVIVAL_EVENTS.markCompleted(EVENT_ID);
        showFloorplan();
        break;

      default:
        if (node.next) runDialogueNode(node.next);
        else showFloorplan();
        break;
    }
  }

  function showRoomMessage(text) {
    showMessages([text], {
      finalAction: () => {
        const panel = $('messagePanel');
        if (panel) panel.classList.add('hidden');
      }
    });
  }

  function openInventory(storageId) {
    location.href = 'survival-inventory.html?storage=' + encodeURIComponent(storageId);
  }

  function bindRoomHotspots() {
    document.querySelectorAll('.room-hotspot').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.roomAction;

        switch (action) {
          case 'wardrobe':
            openInventory('wardrobe');
            break;

          case 'fridge':
            openInventory('fridge');
            break;

          case 'bed':
            showRoomMessage('ベッドがあります。');
            break;

          case 'kitchen':
            showRoomMessage('台所があります。');
            break;

          case 'stove':
            showRoomMessage('薪ストーブです。火が燃えています。');
            break;

          case 'attic':
            showRoomMessage('天井収納へ上がるための、はしごがあります。');
            break;

          case 'basement':
            if (currentFloor === 'basement') showFloorplan();
            else showBasement();
            break;

          case 'entry':
            showRoomMessage('玄関土間です。');
            break;
        }
      });
    });
  }

  function bindMessageEvents() {
    const panel = $('messagePanel');
    const toggle = $('messageToggle');

    if (panel) {
      panel.addEventListener('click', event => {
        if (!messageOpen || event.target.closest('button')) return;
        advanceMessage();
      });
    }

    if (toggle) {
      toggle.addEventListener('click', event => {
        event.stopPropagation();
        if (messageOpen) hideMessage();
        else if (messagePages.length) setMessageOpen(true);
      });
    }
  }

  function bindBackButton() {
    const button = $('backButton');
    if (!button) return;

    button.addEventListener('click', () => {
      location.href = 'survival%20game_TOP.html';
    });
  }

  function startRoom() {
    ensureHotspotGlowStyle();
    renderStatus();
    bindBackButton();
    bindMessageEvents();
    bindRoomHotspots();

    if (!window.SURVIVAL_EVENTS) {
      console.error('[survival-room-ui] survival-events.js が読み込まれていません。');
      showFloorplan();
      return;
    }

    if (SURVIVAL_EVENTS.isCompleted(EVENT_ID)) {
      showFloorplan();
      return;
    }

    showEventMode();
    const event = SURVIVAL_EVENTS.getEvent(EVENT_ID);
    const startNode = event && event.dialogue ? event.dialogue.startNode : null;
    setTimeout(() => runDialogueNode(startNode), 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRoom, { once: true });
  } else {
    startRoom();
  }
})();