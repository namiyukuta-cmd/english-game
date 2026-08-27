// 雪山サバイバルゲーム 共通インベントリ管理
// 収納とプレイヤー所持品のスロット移動を共通化する。
// 操作方式：アイテムをタップ → 移動先スロットをタップ。

(function () {
  'use strict';

  const STORAGE_KEY = 'survival_inventory_state_v1';
  const BASE_PLAYER_CAPACITY = 5;

  const DEFAULT_CONTAINERS = Object.freeze({
    player: {
      id: 'player',
      name: '自分のインベントリ',
      capacity: BASE_PLAYER_CAPACITY,
      slots: []
    },
    wardrobe: {
      id: 'wardrobe',
      name: '洋服箪笥',
      capacity: 8,
      slots: [
        { itemId: 'winter_coat_old_01', qty: 1 },
        { itemId: 'wool_sweater_01', qty: 1 },
        { itemId: 'winter_gloves_01', qty: 1 },
        { itemId: 'knit_cap_01', qty: 1 },
        { itemId: 'backpack_old_01', qty: 1 }
      ]
    },
    fridge: {
      id: 'fridge',
      name: '冷蔵庫',
      capacity: 12,
      slots: []
    },
    foodShelf: {
      id: 'foodShelf',
      name: '食料棚',
      capacity: 12,
      slots: []
    },
    atticStorage: {
      id: 'atticStorage',
      name: '屋根裏収納',
      capacity: 12,
      slots: []
    },
    basementStorage: {
      id: 'basementStorage',
      name: '地下収納',
      capacity: 12,
      slots: []
    },
    shedStorage: {
      id: 'shedStorage',
      name: '物置',
      capacity: 16,
      slots: []
    }
  });

  let selected = null;
  const listeners = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function emptySlots(capacity) {
    return Array.from({ length: Math.max(0, Number(capacity) || 0) }, () => null);
  }

  function normalizeSlot(slot) {
    if (!slot || !slot.itemId) return null;
    return {
      itemId: String(slot.itemId),
      qty: Math.max(1, Math.floor(Number(slot.qty) || 1))
    };
  }

  function makeContainer(def) {
    const capacity = Math.max(0, Math.floor(Number(def.capacity) || 0));
    const slots = emptySlots(capacity);
    (def.slots || []).slice(0, capacity).forEach((slot, index) => {
      slots[index] = normalizeSlot(slot);
    });
    return {
      id: String(def.id),
      name: String(def.name || def.id),
      capacity,
      slots
    };
  }

  function makeDefaultState() {
    const containers = {};
    Object.values(DEFAULT_CONTAINERS).forEach(def => {
      containers[def.id] = makeContainer(def);
    });
    return {
      version: 1,
      playerBaseCapacity: BASE_PLAYER_CAPACITY,
      playerBonusCapacity: 0,
      containers
    };
  }

  function normalizeState(raw) {
    const base = makeDefaultState();
    if (!raw || typeof raw !== 'object') return base;

    const bonus = Math.max(0, Math.floor(Number(raw.playerBonusCapacity) || 0));
    base.playerBonusCapacity = bonus;

    if (raw.containers && typeof raw.containers === 'object') {
      Object.keys(raw.containers).forEach(id => {
        const incoming = raw.containers[id];
        if (!incoming || typeof incoming !== 'object') return;

        const fallback = base.containers[id] || {
          id,
          name: incoming.name || id,
          capacity: incoming.capacity || 0,
          slots: []
        };

        const capacity = id === 'player'
          ? BASE_PLAYER_CAPACITY + bonus
          : Math.max(0, Math.floor(Number(incoming.capacity || fallback.capacity) || 0));

        const merged = {
          id,
          name: String(incoming.name || fallback.name || id),
          capacity,
          slots: emptySlots(capacity)
        };

        const sourceSlots = Array.isArray(incoming.slots) ? incoming.slots : fallback.slots;
        sourceSlots.slice(0, capacity).forEach((slot, index) => {
          merged.slots[index] = normalizeSlot(slot);
        });
        base.containers[id] = merged;
      });
    }

    const player = base.containers.player;
    player.capacity = BASE_PLAYER_CAPACITY + bonus;
    if (player.slots.length < player.capacity) {
      while (player.slots.length < player.capacity) player.slots.push(null);
    } else if (player.slots.length > player.capacity) {
      player.slots.length = player.capacity;
    }

    return base;
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

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[survival-inventory] 保存できませんでした。', error);
    }
    emit();
  }

  function emit() {
    const snapshot = getState();
    listeners.forEach(listener => {
      try { listener(snapshot, getSelection()); }
      catch (error) { console.error('[survival-inventory] listener error', error); }
    });
  }

  function getState() {
    return clone(state);
  }

  function getContainer(containerId) {
    const container = state.containers[containerId];
    return container ? clone(container) : null;
  }

  function getSlot(containerId, slotIndex) {
    const container = state.containers[containerId];
    const index = Number(slotIndex);
    if (!container || !Number.isInteger(index) || index < 0 || index >= container.capacity) return null;
    return container.slots[index] ? clone(container.slots[index]) : null;
  }

  function ensureContainer(containerId, options) {
    const id = String(containerId);
    if (state.containers[id]) return getContainer(id);
    const opts = options || {};
    state.containers[id] = makeContainer({
      id,
      name: opts.name || id,
      capacity: opts.capacity || 0,
      slots: opts.slots || []
    });
    save();
    return getContainer(id);
  }

  function select(containerId, slotIndex) {
    const container = state.containers[containerId];
    const index = Number(slotIndex);
    if (!container || !Number.isInteger(index) || index < 0 || index >= container.capacity) {
      selected = null;
      emit();
      return { ok: false, reason: 'invalid_slot' };
    }
    if (!container.slots[index]) {
      selected = null;
      emit();
      return { ok: false, reason: 'empty_slot' };
    }
    selected = { containerId, slotIndex: index };
    emit();
    return { ok: true, selection: getSelection() };
  }

  function getSelection() {
    return selected ? { containerId: selected.containerId, slotIndex: selected.slotIndex } : null;
  }

  function clearSelection() {
    selected = null;
    emit();
  }

  function move(sourceContainerId, sourceSlotIndex, targetContainerId, targetSlotIndex) {
    const source = state.containers[sourceContainerId];
    const target = state.containers[targetContainerId];
    const s = Number(sourceSlotIndex);
    const t = Number(targetSlotIndex);

    if (!source || !target) return { ok: false, reason: 'container_not_found' };
    if (!Number.isInteger(s) || s < 0 || s >= source.capacity) return { ok: false, reason: 'invalid_source' };
    if (!Number.isInteger(t) || t < 0 || t >= target.capacity) return { ok: false, reason: 'invalid_target' };
    if (!source.slots[s]) return { ok: false, reason: 'empty_source' };
    if (target.slots[t]) return { ok: false, reason: 'target_occupied' };

    target.slots[t] = source.slots[s];
    source.slots[s] = null;
    selected = null;
    save();
    return { ok: true };
  }

  function moveSelectedTo(targetContainerId, targetSlotIndex) {
    if (!selected) return { ok: false, reason: 'nothing_selected' };
    return move(selected.containerId, selected.slotIndex, targetContainerId, targetSlotIndex);
  }

  function setPlayerBonusCapacity(bonusSlots) {
    const bonus = Math.max(0, Math.floor(Number(bonusSlots) || 0));
    const player = state.containers.player;
    const newCapacity = BASE_PLAYER_CAPACITY + bonus;

    if (newCapacity < player.capacity) {
      for (let i = newCapacity; i < player.capacity; i++) {
        if (player.slots[i]) return { ok: false, reason: 'slots_not_empty' };
      }
    }

    state.playerBonusCapacity = bonus;
    player.capacity = newCapacity;
    while (player.slots.length < newCapacity) player.slots.push(null);
    if (player.slots.length > newCapacity) player.slots.length = newCapacity;
    save();
    return { ok: true, capacity: newCapacity };
  }

  function addItem(containerId, itemId, qty) {
    const container = state.containers[containerId];
    if (!container) return { ok: false, reason: 'container_not_found' };
    const emptyIndex = container.slots.findIndex(slot => slot === null);
    if (emptyIndex < 0) return { ok: false, reason: 'container_full' };
    container.slots[emptyIndex] = normalizeSlot({ itemId, qty });
    save();
    return { ok: true, slotIndex: emptyIndex };
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    return function unsubscribe() { listeners.delete(listener); };
  }

  function reset() {
    state = makeDefaultState();
    selected = null;
    save();
  }

  window.SURVIVAL_INVENTORY = Object.freeze({
    storageKey: STORAGE_KEY,
    basePlayerCapacity: BASE_PLAYER_CAPACITY,
    getState,
    getContainer,
    getSlot,
    ensureContainer,
    select,
    getSelection,
    clearSelection,
    move,
    moveSelectedTo,
    setPlayerBonusCapacity,
    addItem,
    subscribe,
    reset
  });
})();
