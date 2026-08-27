// 雪山サバイバルゲーム インベントリ画面UI
// survival_インベントリ.html の表示・操作を担当する。
// 必ず先に survival-items.js と survival-inventory.js を読み込む。

(function () {
  'use strict';

  const STORAGE_PLAYER_MODE = Object.freeze({
    wardrobe: 'equipment',
    fridge: 'item',
    foodShelf: 'item',
    atticStorage: 'item',
    basementStorage: 'item',
    shedStorage: 'item'
  });

  const EQUIPMENT_SLOT_LABELS = Object.freeze({
    head: '頭',
    neck: '首',
    clothes: '服',
    coat: 'コート',
    pants: 'ズボン',
    shoes: '靴',
    hands: '手'
  });

  let inventory = null;
  let storageId = 'wardrobe';
  let playerMode = 'equipment';

  let selectedStorageItemId = null;
  let selectedPlayerItemId = null;
  let selectedEquipmentSlotId = null;

  let els = null;
  let unsubscribe = null;

  function $(id) {
    return document.getElementById(id);
  }

  function getItem(itemId) {
    if (typeof window.getSurvivalItem === 'function') {
      return window.getSurvivalItem(itemId);
    }

    if (window.SURVIVAL_ITEMS_BY_ID && window.SURVIVAL_ITEMS_BY_ID[itemId]) {
      return window.SURVIVAL_ITEMS_BY_ID[itemId];
    }

    if (Array.isArray(window.SURVIVAL_ITEMS)) {
      return window.SURVIVAL_ITEMS.find(item => item && item.id === itemId) || null;
    }

    return null;
  }

  function getItemName(itemId) {
    const item = getItem(itemId);
    return item ? item.name : itemId;
  }

  function isEquipment(itemId) {
    const item = getItem(itemId);
    return !!item && item.inventoryType === 'equipment';
  }

  function formatWeight(value) {
    const number = Number(value) || 0;
    return number.toFixed(2);
  }

  function setMessage(text, isError) {
    if (!els || !els.message) return;
    els.message.textContent = text || '';
    els.message.classList.toggle('error', !!isError);
  }

  function clearSelection() {
    selectedStorageItemId = null;
    selectedPlayerItemId = null;
    selectedEquipmentSlotId = null;
  }

  function resolveStorage() {
    const params = new URLSearchParams(location.search);
    const requested = params.get('storage') || 'wardrobe';

    const storage = inventory.getStorage(requested);
    storageId = storage ? requested : 'wardrobe';

    playerMode = STORAGE_PLAYER_MODE[storageId] || 'item';
  }

  function createEmptyMessage(text) {
    const div = document.createElement('div');
    div.className = 'empty-message';
    div.textContent = text;
    return div;
  }

  function createItemButton(itemId, qty, selected, side) {
    const item = getItem(itemId);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item-row';

    if (selected) button.classList.add('selected');

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item ? item.name : itemId;

    const info = document.createElement('span');
    info.className = 'item-info';

    const qtyEl = document.createElement('span');
    qtyEl.className = 'item-qty';
    qtyEl.textContent = `×${qty}`;
    info.appendChild(qtyEl);

    if (!item || item.inventoryType !== 'equipment') {
      const unitWeight = item ? Number(item.weight) || 0 : 0;
      const weight = document.createElement('span');
      weight.className = 'item-weight';
      weight.textContent = `${formatWeight(unitWeight * qty)}kg`;
      info.appendChild(weight);
    }

    button.appendChild(name);
    button.appendChild(info);

    button.addEventListener('click', function () {
      clearSelection();

      if (side === 'storage') {
        selectedStorageItemId = itemId;
      } else {
        selectedPlayerItemId = itemId;
      }

      setMessage(`${getItemName(itemId)}を選択しました。`);
      render();
    });

    return button;
  }

  function renderStorage() {
    const storage = inventory.getStorage(storageId);

    if (!storage) {
      els.storageTitle.textContent = '収納';
      els.storageSub.textContent = '-';
      els.storageList.replaceChildren(createEmptyMessage('収納データがありません。'));
      return;
    }

    els.storageTitle.textContent = storage.name || '収納';

    const entries = Object.entries(storage.items || {})
      .filter(entry => Number(entry[1]) > 0);

    els.storageSub.textContent = `${entries.length}種類`;
    els.storageList.replaceChildren();

    if (!entries.length) {
      els.storageList.appendChild(createEmptyMessage('何も入っていません。'));
      return;
    }

    entries.forEach(function (entry) {
      const itemId = entry[0];
      const qty = Number(entry[1]) || 0;
      els.storageList.appendChild(
        createItemButton(
          itemId,
          qty,
          selectedStorageItemId === itemId,
          'storage'
        )
      );
    });
  }

  function renderPlayerItems() {
    const items = inventory.getPlayerItems();
    const entries = Object.entries(items || {})
      .filter(entry => Number(entry[1]) > 0);

    const currentWeight = inventory.getPlayerWeight();
    const maxWeight = inventory.getPlayerMaxWeight();

    els.playerTitle.textContent = 'アイテム';
    els.playerSub.textContent = `${formatWeight(currentWeight)} / ${formatWeight(maxWeight)} kg`;
    els.playerList.replaceChildren();

    if (!entries.length) {
      els.playerList.appendChild(createEmptyMessage('何も持っていません。'));
      return;
    }

    entries.forEach(function (entry) {
      const itemId = entry[0];
      const qty = Number(entry[1]) || 0;
      els.playerList.appendChild(
        createItemButton(
          itemId,
          qty,
          selectedPlayerItemId === itemId,
          'player'
        )
      );
    });
  }

  function renderEquipment() {
    const equipment = inventory.getEquipment();
    const slotIds = Object.keys(EQUIPMENT_SLOT_LABELS);
    const equippedCount = slotIds.filter(slotId => !!equipment[slotId]).length;

    els.playerTitle.textContent = '装備';
    els.playerSub.textContent = `着用中 ${equippedCount} / ${slotIds.length}`;
    els.playerList.replaceChildren();

    slotIds.forEach(function (slotId) {
      const itemId = equipment[slotId];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'equipment-row';

      if (selectedEquipmentSlotId === slotId) {
        button.classList.add('selected');
      }

      const slotName = document.createElement('span');
      slotName.className = 'equipment-slot-name';
      slotName.textContent = EQUIPMENT_SLOT_LABELS[slotId];

      const itemName = document.createElement('span');
      itemName.className = 'equipment-item-name';

      if (itemId) {
        itemName.textContent = getItemName(itemId);
      } else {
        itemName.textContent = 'なし';
        itemName.classList.add('equipment-empty');
      }

      button.appendChild(slotName);
      button.appendChild(itemName);

      button.addEventListener('click', function () {
        clearSelection();

        if (!itemId) {
          setMessage('この装備欄は空いています。');
          render();
          return;
        }

        selectedEquipmentSlotId = slotId;
        setMessage(`${getItemName(itemId)}を選択しました。`);
        render();
      });

      els.playerList.appendChild(button);
    });
  }

  function renderButtons() {
    els.takeButton.disabled = true;
    els.returnButton.disabled = true;

    if (selectedStorageItemId) {
      if (isEquipment(selectedStorageItemId)) {
        els.takeButton.textContent = '装備する';
        els.takeButton.disabled = false;
      } else {
        els.takeButton.textContent = '受け取る';
        els.takeButton.disabled = false;
      }
    } else {
      els.takeButton.textContent = playerMode === 'equipment' ? '装備する' : '受け取る';
    }

    if (playerMode === 'equipment') {
      els.returnButton.textContent = '装備を外す';
      els.returnButton.disabled = !selectedEquipmentSlotId;
    } else {
      els.returnButton.textContent = '収納へ戻す';
      els.returnButton.disabled = !selectedPlayerItemId;
    }
  }

  function render() {
    renderStorage();

    if (playerMode === 'equipment') {
      renderEquipment();
    } else {
      renderPlayerItems();
    }

    renderButtons();
  }

  function takeSelectedStorageItem() {
    if (!selectedStorageItemId) return;

    const itemId = selectedStorageItemId;
    const item = getItem(itemId);

    if (!item) {
      setMessage('アイテムデータが見つかりません。', true);
      return;
    }

    let result;

    if (item.inventoryType === 'equipment') {
      if (!item.equipSlot) {
        setMessage('この装備品には装備部位が設定されていません。', true);
        return;
      }

      result = inventory.equipFromStorage(storageId, itemId, item.equipSlot);

      if (result.ok) {
        clearSelection();
        setMessage(`${item.name}を装備しました。`);
        render();
        return;
      }
    } else {
      result = inventory.moveItem(storageId, 'player', itemId, 1);

      if (result.ok) {
        clearSelection();
        setMessage(`${item.name}を受け取りました。`);
        render();
        return;
      }
    }

    if (result && result.reason === 'weight_over') {
      setMessage('重量オーバーです。これ以上持てません。', true);
    } else if (result && result.reason === 'not_enough') {
      setMessage('そのアイテムは収納にありません。', true);
    } else {
      setMessage('移動できませんでした。', true);
    }
  }

  function returnSelectedPlayerItem() {
    if (playerMode === 'equipment') {
      if (!selectedEquipmentSlotId) return;

      const equipment = inventory.getEquipment();
      const itemId = equipment[selectedEquipmentSlotId];
      const result = inventory.unequipToStorage(selectedEquipmentSlotId, storageId);

      if (result.ok) {
        clearSelection();
        setMessage(`${getItemName(itemId)}を収納へ戻しました。`);
        render();
      } else {
        setMessage('装備を外せませんでした。', true);
      }

      return;
    }

    if (!selectedPlayerItemId) return;

    const itemId = selectedPlayerItemId;
    const result = inventory.moveItem('player', storageId, itemId, 1);

    if (result.ok) {
      clearSelection();
      setMessage(`${getItemName(itemId)}を収納へ戻しました。`);
      render();
    } else {
      setMessage('収納へ戻せませんでした。', true);
    }
  }

  function bindEvents() {
    els.takeButton.addEventListener('click', takeSelectedStorageItem);
    els.returnButton.addEventListener('click', returnSelectedPlayerItem);

    if (els.backButton) {
      els.backButton.addEventListener('click', function () {
        if (history.length > 1) {
          history.back();
        } else {
          location.href = 'survival_room.html';
        }
      });
    }
  }

  function collectElements() {
    return {
      storageTitle: $('storageTitle'),
      storageSub: $('storageSub'),
      storageList: $('storageList'),
      playerTitle: $('playerTitle'),
      playerSub: $('playerSub'),
      playerList: $('playerList'),
      takeButton: $('takeButton'),
      returnButton: $('returnButton'),
      message: $('message'),
      backButton: $('backButton')
    };
  }

  function hasRequiredElements(value) {
    return !!(
      value.storageTitle &&
      value.storageSub &&
      value.storageList &&
      value.playerTitle &&
      value.playerSub &&
      value.playerList &&
      value.takeButton &&
      value.returnButton &&
      value.message
    );
  }

  function init() {
    inventory = window.SURVIVAL_INVENTORY;

    if (!inventory) {
      console.error('[survival-inventory-ui] survival-inventory.js が読み込まれていません。');
      return;
    }

    els = collectElements();

    if (!hasRequiredElements(els)) {
      console.error('[survival-inventory-ui] HTML側の必要な要素が見つかりません。');
      return;
    }

    resolveStorage();
    bindEvents();

    if (typeof inventory.subscribe === 'function') {
      unsubscribe = inventory.subscribe(function () {
        render();
      });
    }

    setMessage('移動するものを選んでください。');
    render();
  }

  window.addEventListener('pagehide', function () {
    if (typeof unsubscribe === 'function') unsubscribe();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
