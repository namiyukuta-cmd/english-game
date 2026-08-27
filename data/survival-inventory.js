// 雪山サバイバルゲーム 共通インベントリ管理
// 新仕様：通常アイテムは「個数 + 重量」で管理し、衣類は装備として別管理する。
// 収納（タンス・棚・冷蔵庫など）は共通の数量データとして扱う。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_inventory_state_v1';
  const STATE_VERSION = 2;

  // 暫定の基礎積載量。後からゲームバランスに合わせて変更可能。
  const BASE_PLAYER_MAX_WEIGHT = 5.0;

  const EQUIPMENT_SLOTS = Object.freeze({
    head: '頭',
    neck: '首',
    clothes: '服',
    coat: 'コート',
    pants: 'ズボン',
    shoes: '靴',
    hands: '手'
  });

  const DEFAULT_STORAGES = Object.freeze({
    wardrobe: {
      id: 'wardrobe',
      name: '洋服箪笥',
      items: {
        winter_coat_old_01: 1,
        wool_sweater_01: 1,
        winter_gloves_01: 1,
        knit_cap_01: 1,
        backpack_old_01: 1
      }
    },
    fridge: {
      id: 'fridge',
      name: '冷蔵庫',
      items: {}
    },
    foodShelf: {
      id: 'foodShelf',
      name: '食料棚',
      items: {}
    },
    atticStorage: {
      id: 'atticStorage',
      name: '屋根裏収納',
      items: {}
    },
    basementStorage: {
      id: 'basementStorage',
      name: '地下収納',
      items: {}
    },
    shedStorage: {
      id: 'shedStorage',
      name: '物置',
      items: {}
    }
  });

  const listeners = new Set();
  let selected = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeQty(value) {
    const qty = Math.floor(Number(value) || 0);
    return Math.max(0, qty);
  }

  function normalizeWeight(value) {
    const weight = Number(value);
    if (!Number.isFinite(weight) || weight < 0) return 0;
    return weight;
  }

  function normalizeItemMap(raw) {
    const result = {};
    if (!raw || typeof raw !== 'object') return result;

    Object.entries(raw).forEach(([itemId, qty]) => {
      const normalized = normalizeQty(qty);
      if (normalized > 0) result[String(itemId)] = normalized;
    });

    return result;
  }

  function makeDefaultEquipment() {
    const equipment = {};
    Object.keys(EQUIPMENT_SLOTS).forEach(slotId => {
      equipment[slotId] = null;
    });
    return equipment;
  }

  function makeDefaultStorages() {
    const storages = {};
    Object.values(DEFAULT_STORAGES).forEach(def => {
      storages[def.id] = {
        id: def.id,
        name: def.name,
        items: normalizeItemMap(def.items)
      };
    });
    return storages;
  }

  function makeDefaultState() {
    return {
      version: STATE_VERSION,
      player: {
        baseMaxWeight: BASE_PLAYER_MAX_WEIGHT,
        bonusMaxWeight: 0,
        items: {},
        equipment: makeDefaultEquipment()
      },
      storages: makeDefaultStorages()
    };
  }

  function addToItemMap(map, itemId, qty) {
    const id = String(itemId || '');
    const amount = normalizeQty(qty);
    if (!id || amount <= 0) return false;
    map[id] = normalizeQty(map[id]) + amount;
    return true;
  }

  function removeFromItemMap(map, itemId, qty) {
    const id = String(itemId || '');
    const amount = normalizeQty(qty);
    const current = normalizeQty(map[id]);
    if (!id || amount <= 0 || current < amount) return false;

    const next = current - amount;
    if (next > 0) map[id] = next;
    else delete map[id];
    return true;
  }

  function slotsToItemMap(slots) {
    const map = {};
    if (!Array.isArray(slots)) return map;

    slots.forEach(slot => {
      if (!slot || !slot.itemId) return;
      addToItemMap(map, slot.itemId, slot.qty || 1);
    });

    return map;
  }

  function migrateLegacyState(raw) {
    const next = makeDefaultState();
    if (!raw || typeof raw !== 'object') return next;

    const containers = raw.containers && typeof raw.containers === 'object'
      ? raw.containers
      : {};

    if (containers.player) {
      next.player.items = slotsToItemMap(containers.player.slots);
    }

    Object.entries(containers).forEach(([id, container]) => {
      if (id === 'player' || !container || typeof container !== 'object') return;

      if (!next.storages[id]) {
        next.storages[id] = {
          id,
          name: String(container.name || id),
          items: {}
        };
      }

      next.storages[id].name = String(container.name || next.storages[id].name || id);
      next.storages[id].items = slotsToItemMap(container.slots);
    });

    return next;
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== 'object') return makeDefaultState();

    if (Number(raw.version) !== STATE_VERSION || !raw.player || !raw.storages) {
      return migrateLegacyState(raw);
    }

    const next = makeDefaultState();

    next.player.baseMaxWeight = normalizeWeight(raw.player.baseMaxWeight);
    if (next.player.baseMaxWeight <= 0) {
      next.player.baseMaxWeight = BASE_PLAYER_MAX_WEIGHT;
    }

    next.player.bonusMaxWeight = normalizeWeight(raw.player.bonusMaxWeight);
    next.player.items = normalizeItemMap(raw.player.items);

    const incomingEquipment = raw.player.equipment && typeof raw.player.equipment === 'object'
      ? raw.player.equipment
      : {};

    Object.keys(EQUIPMENT_SLOTS).forEach(slotId => {
      const itemId = incomingEquipment[slotId];
      next.player.equipment[slotId] = itemId ? String(itemId) : null;
    });

    Object.entries(raw.storages).forEach(([id, storage]) => {
      if (!storage || typeof storage !== 'object') return;

      if (!next.storages[id]) {
        next.storages[id] = {
          id,
          name: String(storage.name || id),
          items: {}
        };
      }

      next.storages[id].name = String(storage.name || next.storages[id].name || id);
      next.storages[id].items = normalizeItemMap(storage.items);
    });

    return next;
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : makeDefaultState();
    } catch (error) {
      console.warn('[survival-inventory] 保存データを読み込めませんでした。', error);
      return makeDefaultState();
    }
  }

  let state = readState();

  function emit() {
    const snapshot = getState();
    const selection = getSelection();

    listeners.forEach(listener => {
      try {
        listener(snapshot, selection);
      } catch (error) {
        console.error('[survival-inventory] listener error', error);
      }
    });
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[survival-inventory] 保存できませんでした。', error);
    }
    emit();
  }

  function getState() {
    return clone(state);
  }

  function getItemData(itemId) {
    const id = String(itemId || '');
    if (!id) return null;

    const source = window.SURVIVAL_ITEMS;
    if (!source) return null;

    try {
      if (typeof source.get === 'function') {
        const item = source.get(id);
        if (item) return item;
      }

      if (typeof source.getItem === 'function') {
        const item = source.getItem(id);
        if (item) return item;
      }

      if (Array.isArray(source)) {
        return source.find(item => item && String(item.id) === id) || null;
      }

      if (Array.isArray(source.items)) {
        return source.items.find(item => item && String(item.id) === id) || null;
      }

      if (source.byId && source.byId[id]) {
        return source.byId[id];
      }

      if (source[id] && typeof source[id] === 'object') {
        return source[id];
      }
    } catch (error) {
      console.warn('[survival-inventory] アイテムデータ取得に失敗しました。', error);
    }

    return null;
  }

  function getItemWeight(itemId) {
    const item = getItemData(itemId);
    return item ? normalizeWeight(item.weight) : 0;
  }

  function getPlayerWeight() {
    return Object.entries(state.player.items).reduce((total, entry) => {
      const itemId = entry[0];
      const qty = entry[1];
      return total + getItemWeight(itemId) * qty;
    }, 0);
  }

  function getPlayerMaxWeight() {
    return normalizeWeight(state.player.baseMaxWeight) + normalizeWeight(state.player.bonusMaxWeight);
  }

  function getPlayerRemainingWeight() {
    return Math.max(0, getPlayerMaxWeight() - getPlayerWeight());
  }

  function canCarry(itemId, qty) {
    const amount = normalizeQty(qty || 1);
    if (amount <= 0) return { ok: false, reason: 'invalid_quantity' };

    const addedWeight = getItemWeight(itemId) * amount;
    const currentWeight = getPlayerWeight();
    const maxWeight = getPlayerMaxWeight();

    if (currentWeight + addedWeight > maxWeight + 1e-9) {
      return {
        ok: false,
        reason: 'weight_over',
        currentWeight,
        addedWeight,
        maxWeight
      };
    }

    return {
      ok: true,
      currentWeight,
      addedWeight,
      maxWeight,
      nextWeight: currentWeight + addedWeight
    };
  }

  function getPlayerItems() {
    return clone(state.player.items);
  }

  function getEquipment() {
    return clone(state.player.equipment);
  }

  function getStorage(storageId) {
    const storage = state.storages[String(storageId)];
    return storage ? clone(storage) : null;
  }

  const LEGACY_CAPACITIES = Object.freeze({
    player: 5,
    wardrobe: 8,
    fridge: 12,
    foodShelf: 12,
    atticStorage: 12,
    basementStorage: 12,
    shedStorage: 16
  });

  function makeLegacySlots(itemMap, minimumCapacity) {
    const slots = [];

    Object.entries(itemMap || {}).forEach(([itemId, qty]) => {
      const amount = normalizeQty(qty);
      for (let i = 0; i < amount; i += 1) {
        slots.push({ itemId, qty: 1 });
      }
    });

    const capacity = Math.max(normalizeQty(minimumCapacity), slots.length);
    while (slots.length < capacity) slots.push(null);

    return { capacity, slots };
  }

  function getContainer(containerId) {
    const id = String(containerId || '');

    if (id === 'player') {
      const legacy = makeLegacySlots(state.player.items, LEGACY_CAPACITIES.player);
      return {
        id: 'player',
        name: '自分のインベントリ',
        items: clone(state.player.items),
        currentWeight: getPlayerWeight(),
        maxWeight: getPlayerMaxWeight(),
        // 旧HTMLが新HTMLへ切り替わるまでの互換表示用。
        capacity: legacy.capacity,
        slots: legacy.slots
      };
    }

    const storage = getStorage(id);
    if (!storage) return null;

    const legacy = makeLegacySlots(storage.items, LEGACY_CAPACITIES[id] || 0);
    return Object.assign(storage, {
      // 旧HTMLが新HTMLへ切り替わるまでの互換表示用。
      capacity: legacy.capacity,
      slots: legacy.slots
    });
  }

  function getSlot(containerId, slotIndex) {
    const container = getContainer(containerId);
    const index = Number(slotIndex);
    if (!container || !Number.isInteger(index) || index < 0 || index >= container.slots.length) return null;
    return container.slots[index] ? clone(container.slots[index]) : null;
  }

  function ensureContainer(containerId, options) {
    const id = String(containerId || '');
    if (!id || id === 'player') return getContainer(id);

    if (!state.storages[id]) {
      const opts = options || {};
      state.storages[id] = {
        id,
        name: String(opts.name || id),
        items: normalizeItemMap(opts.items)
      };
      save();
    }

    return getStorage(id);
  }

  function getItemQuantity(containerId, itemId) {
    const id = String(containerId || '');
    const item = String(itemId || '');
    if (!item) return 0;

    if (id === 'player') return normalizeQty(state.player.items[item]);

    const storage = state.storages[id];
    return storage ? normalizeQty(storage.items[item]) : 0;
  }

  function addItem(containerId, itemId, qty) {
    const id = String(containerId || '');
    const item = String(itemId || '');
    const amount = normalizeQty(qty || 1);

    if (!item || amount <= 0) return { ok: false, reason: 'invalid_item' };

    if (id === 'player') {
      const carry = canCarry(item, amount);
      if (!carry.ok) return carry;

      addToItemMap(state.player.items, item, amount);
      save();

      return {
        ok: true,
        containerId: 'player',
        itemId: item,
        qty: amount,
        currentWeight: getPlayerWeight(),
        maxWeight: getPlayerMaxWeight()
      };
    }

    const storage = state.storages[id];
    if (!storage) return { ok: false, reason: 'container_not_found' };

    addToItemMap(storage.items, item, amount);
    save();

    return {
      ok: true,
      containerId: id,
      itemId: item,
      qty: amount
    };
  }

  function removeItem(containerId, itemId, qty) {
    const id = String(containerId || '');
    const item = String(itemId || '');
    const amount = normalizeQty(qty || 1);

    if (!item || amount <= 0) return { ok: false, reason: 'invalid_item' };

    if (id === 'player') {
      if (!removeFromItemMap(state.player.items, item, amount)) {
        return { ok: false, reason: 'not_enough' };
      }
      save();
      return { ok: true, containerId: 'player', itemId: item, qty: amount };
    }

    const storage = state.storages[id];
    if (!storage) return { ok: false, reason: 'container_not_found' };

    if (!removeFromItemMap(storage.items, item, amount)) {
      return { ok: false, reason: 'not_enough' };
    }

    save();
    return { ok: true, containerId: id, itemId: item, qty: amount };
  }

  function moveItem(sourceContainerId, targetContainerId, itemId, qty) {
    const sourceId = String(sourceContainerId || '');
    const targetId = String(targetContainerId || '');
    const item = String(itemId || '');
    const amount = normalizeQty(qty || 1);

    if (!sourceId || !targetId || !item || amount <= 0) {
      return { ok: false, reason: 'invalid_move' };
    }

    if (sourceId === targetId) return { ok: true, moved: 0 };

    if (getItemQuantity(sourceId, item) < amount) {
      return { ok: false, reason: 'not_enough' };
    }

    if (targetId === 'player') {
      const carry = canCarry(item, amount);
      if (!carry.ok) return carry;
    } else if (!state.storages[targetId]) {
      return { ok: false, reason: 'container_not_found' };
    }

    if (sourceId === 'player') {
      removeFromItemMap(state.player.items, item, amount);
    } else {
      const source = state.storages[sourceId];
      if (!source) return { ok: false, reason: 'container_not_found' };
      removeFromItemMap(source.items, item, amount);
    }

    if (targetId === 'player') {
      addToItemMap(state.player.items, item, amount);
    } else {
      addToItemMap(state.storages[targetId].items, item, amount);
    }

    selected = null;
    save();

    return {
      ok: true,
      itemId: item,
      qty: amount,
      sourceContainerId: sourceId,
      targetContainerId: targetId
    };
  }

  function isEquipmentSlot(slotId) {
    return Object.prototype.hasOwnProperty.call(EQUIPMENT_SLOTS, String(slotId || ''));
  }

  function equipFromStorage(storageId, itemId, slotId) {
    const storage = state.storages[String(storageId || '')];
    const item = String(itemId || '');
    const slot = String(slotId || '');

    if (!storage) return { ok: false, reason: 'container_not_found' };
    if (!item || getItemQuantity(storage.id, item) < 1) return { ok: false, reason: 'not_enough' };
    if (!isEquipmentSlot(slot)) return { ok: false, reason: 'invalid_equipment_slot' };

    removeFromItemMap(storage.items, item, 1);

    const previousItemId = state.player.equipment[slot];
    if (previousItemId) addToItemMap(storage.items, previousItemId, 1);

    state.player.equipment[slot] = item;
    selected = null;
    save();

    return {
      ok: true,
      slotId: slot,
      itemId: item,
      previousItemId: previousItemId || null,
      storageId: storage.id
    };
  }

  function unequipToStorage(slotId, storageId) {
    const slot = String(slotId || '');
    const storage = state.storages[String(storageId || '')];

    if (!isEquipmentSlot(slot)) return { ok: false, reason: 'invalid_equipment_slot' };
    if (!storage) return { ok: false, reason: 'container_not_found' };

    const itemId = state.player.equipment[slot];
    if (!itemId) return { ok: false, reason: 'equipment_empty' };

    state.player.equipment[slot] = null;
    addToItemMap(storage.items, itemId, 1);
    selected = null;
    save();

    return {
      ok: true,
      slotId: slot,
      itemId,
      storageId: storage.id
    };
  }

  function setPlayerBaseMaxWeight(weight) {
    const value = normalizeWeight(weight);
    if (value <= 0) return { ok: false, reason: 'invalid_weight' };

    if (getPlayerWeight() > value + state.player.bonusMaxWeight + 1e-9) {
      return { ok: false, reason: 'current_weight_over_new_limit' };
    }

    state.player.baseMaxWeight = value;
    save();
    return { ok: true, maxWeight: getPlayerMaxWeight() };
  }

  function setPlayerBonusWeight(weight) {
    const value = normalizeWeight(weight);

    if (getPlayerWeight() > state.player.baseMaxWeight + value + 1e-9) {
      return { ok: false, reason: 'current_weight_over_new_limit' };
    }

    state.player.bonusMaxWeight = value;
    save();
    return { ok: true, maxWeight: getPlayerMaxWeight() };
  }

  // 旧コード互換。旧「追加スロット」の値を、そのまま追加kgとして扱う。
  // 新コードでは setPlayerBonusWeight() を使用する。
  function setPlayerBonusCapacity(value) {
    return setPlayerBonusWeight(value);
  }

  // 新UI用：itemIdで選択する。
  function selectItem(containerId, itemId) {
    const id = String(containerId || '');
    const item = String(itemId || '');

    if (!item || getItemQuantity(id, item) <= 0) {
      selected = null;
      emit();
      return { ok: false, reason: 'item_not_found' };
    }

    selected = { containerId: id, itemId: item };
    emit();
    return { ok: true, selection: getSelection() };
  }

  // 旧UI互換：slotIndexからitemIdへ変換して選択する。
  function select(containerId, slotIndex) {
    const slot = getSlot(containerId, slotIndex);
    if (!slot) {
      selected = null;
      emit();
      return { ok: false, reason: 'empty_slot' };
    }
    return selectItem(containerId, slot.itemId);
  }

  // 旧UI互換：移動先slotIndexは新仕様では使用しない。
  function move(sourceContainerId, sourceSlotIndex, targetContainerId, targetSlotIndex) {
    void targetSlotIndex;
    const slot = getSlot(sourceContainerId, sourceSlotIndex);
    if (!slot) return { ok: false, reason: 'empty_source' };
    return moveItem(sourceContainerId, targetContainerId, slot.itemId, 1);
  }

  function getSelection() {
    return selected ? clone(selected) : null;
  }

  function clearSelection() {
    selected = null;
    emit();
  }

  function moveSelectedTo(targetContainerId, qty) {
    if (!selected) return { ok: false, reason: 'nothing_selected' };
    return moveItem(selected.containerId, targetContainerId, selected.itemId, qty || 1);
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function reset() {
    state = makeDefaultState();
    selected = null;
    save();
  }

  window.SURVIVAL_INVENTORY = Object.freeze({
    storageKey: STORAGE_KEY,
    stateVersion: STATE_VERSION,
    basePlayerMaxWeight: BASE_PLAYER_MAX_WEIGHT,
    equipmentSlots: EQUIPMENT_SLOTS,

    getState,
    getContainer,
    getSlot,
    getStorage,
    ensureContainer,
    getPlayerItems,
    getEquipment,
    getItemQuantity,
    getItemWeight,
    getPlayerWeight,
    getPlayerMaxWeight,
    getPlayerRemainingWeight,
    canCarry,

    addItem,
    removeItem,
    moveItem,

    equipFromStorage,
    unequipToStorage,

    setPlayerBaseMaxWeight,
    setPlayerBonusWeight,
    setPlayerBonusCapacity,

    selectItem,
    select,
    move,
    getSelection,
    clearSelection,
    moveSelectedTo,

    subscribe,
    reset
  });
})();
