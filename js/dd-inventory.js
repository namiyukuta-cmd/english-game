window.DDInventory = (() => {
  'use strict';

  const ACTIVE_KEY = 'ddActiveGame';
  const FORMAT_VERSION = 1;
  const LEGACY_PREFIX = 'legacy__';
  let uidCounter = 0;

  function normalizeName(value) {
    return String(value ?? '')
      .normalize('NFKC')
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function positiveQuantity(value, fallback = 1) {
    const quantity = Math.floor(Number(value));
    return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
  }

  function parseLegacyName(value) {
    const text = String(value ?? '').trim();
    const match = /\s*(?:×|x|\*)\s*(\d+)\s*$/i.exec(text);
    return {
      name: match ? text.slice(0, match.index).trim() : text,
      quantity: match ? positiveQuantity(match[1]) : 1
    };
  }

  function legacyItemId(name) {
    return `${LEGACY_PREFIX}${encodeURIComponent(String(name || 'Unknown Item').trim() || 'Unknown Item')}`;
  }

  function legacyNameFromId(itemId) {
    if (!String(itemId || '').startsWith(LEGACY_PREFIX)) return '';
    try {
      return decodeURIComponent(String(itemId).slice(LEGACY_PREFIX.length));
    } catch (_) {
      return String(itemId).slice(LEGACY_PREFIX.length) || 'Unknown Item';
    }
  }

  function resolveItemId(value, allowLegacy = true) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (window.DD_ITEMS?.[raw] || raw.startsWith(LEGACY_PREFIX)) return raw;
    const parsed = parseLegacyName(raw);
    const found = window.DD_ITEM_ALIASES?.[normalizeName(parsed.name)] || '';
    if (found) return found;
    return allowLegacy ? legacyItemId(parsed.name) : '';
  }

  function itemData(itemId) {
    const data = window.DD_ITEMS?.[itemId];
    if (data) return data;
    const legacyName = legacyNameFromId(itemId);
    if (!legacyName) return null;
    return {
      id: itemId,
      name: legacyName,
      ja: '',
      type: 'gear',
      weight: 0,
      legacy: true
    };
  }

  function createUid() {
    if (window.crypto?.randomUUID) return `item-${window.crypto.randomUUID()}`;
    uidCounter += 1;
    return `item-${Date.now()}-${uidCounter}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function normalizeOwned(raw, index = 0) {
    const source = typeof raw === 'string' ? { name: raw } : (raw || {});
    const parsed = parseLegacyName(source.name || source.itemId || 'Unknown Item');
    const directId = String(source.itemId || '');
    const itemId = directId && (window.DD_ITEMS?.[directId] || directId.startsWith(LEGACY_PREFIX))
      ? directId
      : resolveItemId(parsed.name || directId);
    const explicitQuantity = source.quantity == null ? 0 : positiveQuantity(source.quantity);
    const quantity = explicitQuantity || parsed.quantity || 1;
    const oldUid = String(source.uid || source.id || '');
    return {
      owned: {
        uid: oldUid || createUid(),
        itemId,
        quantity
      },
      oldUid: oldUid || `legacy-index-${index}`
    };
  }

  function normalizeInventory(rawInventory) {
    const inventory = [];
    const byItemId = new Map();
    const uidMap = new Map();
    const usedUids = new Set();

    (Array.isArray(rawInventory) ? rawInventory : []).forEach((raw, index) => {
      const normalized = normalizeOwned(raw, index);
      const owned = normalized.owned;
      const existing = byItemId.get(owned.itemId);
      if (existing) {
        existing.quantity += owned.quantity;
        uidMap.set(normalized.oldUid, existing.uid);
        uidMap.set(owned.uid, existing.uid);
        return;
      }
      if (usedUids.has(owned.uid)) owned.uid = createUid();
      usedUids.add(owned.uid);
      inventory.push(owned);
      byItemId.set(owned.itemId, owned);
      uidMap.set(normalized.oldUid, owned.uid);
      uidMap.set(owned.uid, owned.uid);
    });

    return { inventory, uidMap };
  }

  function equipmentSlot(item) {
    if (!item) return 'other';
    if (item.type === 'armor') return item.id === 'shield' ? 'offHand' : 'armor';
    if (item.type === 'weapon') return 'mainHand';
    return 'other';
  }

  function normalizeEquipment(rawEquipment, inventory, uidMap) {
    let entries = [];
    if (Array.isArray(rawEquipment)) {
      entries = rawEquipment.map(value => ({ value, fallbackSlot: '' }));
    } else if (rawEquipment && typeof rawEquipment === 'object') {
      entries = Object.entries(rawEquipment).map(([slot, value]) => ({ value, fallbackSlot: slot }));
    }

    const bySlot = new Map();
    entries.forEach(({ value, fallbackSlot }) => {
      const source = typeof value === 'string' ? { name: value } : (value || {});
      let uid = uidMap.get(String(source.uid || source.id || '')) || String(source.uid || '');
      let owned = inventory.find(item => item.uid === uid);
      const resolvedItemId = resolveItemId(source.itemId || source.name || (typeof value === 'string' ? value : ''));
      if (!owned && resolvedItemId) owned = inventory.find(item => item.itemId === resolvedItemId);
      if (!owned && resolvedItemId) {
        owned = { uid: createUid(), itemId: resolvedItemId, quantity: 1 };
        inventory.push(owned);
      }
      if (!owned) return;
      uid = owned.uid;
      const slot = String(source.slot || fallbackSlot || equipmentSlot(itemData(owned.itemId)));
      bySlot.set(slot, { uid, itemId: owned.itemId, slot });
    });
    return [...bySlot.values()];
  }

  function normalizeGame(input) {
    const game = input && typeof input === 'object' ? input : {};
    const normalized = normalizeInventory(game.inventory);
    game.inventory = normalized.inventory;
    game.equipment = normalizeEquipment(game.equipment, game.inventory, normalized.uidMap);
    game.currency = game.currency && typeof game.currency === 'object' ? game.currency : {};
    for (const key of ['gp', 'sp', 'cp']) {
      const amount = Number(game.currency[key]);
      game.currency[key] = Number.isFinite(amount) ? amount : 0;
    }
    game.meta = game.meta && typeof game.meta === 'object' ? game.meta : {};
    game.meta.inventoryFormat = FORMAT_VERSION;
    return game;
  }

  function getGame() {
    const raw = localStorage.getItem(ACTIVE_KEY);
    let game;
    try {
      game = raw ? JSON.parse(raw) : {};
    } catch (_) {
      game = {};
    }
    const before = raw || '';
    normalizeGame(game);
    const after = JSON.stringify(game);
    if (raw && before !== after) localStorage.setItem(ACTIVE_KEY, after);
    return game;
  }

  function saveGame(game) {
    const normalized = normalizeGame(game);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function createItems(values) {
    return normalizeInventory(Array.isArray(values) ? values : []).inventory;
  }

  function find(itemId) {
    const game = getGame();
    const resolved = resolveItemId(itemId);
    return game.inventory.find(item => item.itemId === resolved);
  }

  function add(itemId, quantity = 1) {
    const game = getGame();
    const resolved = resolveItemId(itemId);
    const amount = positiveQuantity(quantity, 0);
    if (!resolved || !amount) return game;
    const existing = game.inventory.find(item => item.itemId === resolved);
    if (existing) {
      existing.quantity = positiveQuantity(existing.quantity) + amount;
    } else {
      game.inventory.push({ uid: createUid(), itemId: resolved, quantity: amount });
    }
    return saveGame(game);
  }

  function remove(itemId, quantity = 1) {
    const game = getGame();
    const resolved = resolveItemId(itemId);
    const amount = positiveQuantity(quantity, 0);
    const item = game.inventory.find(value => value.itemId === resolved);
    if (!item || !amount) return game;
    item.quantity = positiveQuantity(item.quantity) - amount;
    if (item.quantity <= 0) {
      game.inventory = game.inventory.filter(value => value.uid !== item.uid);
      game.equipment = game.equipment.filter(value => value.uid !== item.uid);
    }
    return saveGame(game);
  }

  function equip(uid, slot = '') {
    const game = getGame();
    const item = game.inventory.find(value => value.uid === uid);
    if (!item) return game;
    const selectedSlot = slot || equipmentSlot(itemData(item.itemId));
    game.equipment = game.equipment.filter(value => value.slot !== selectedSlot && value.uid !== uid);
    game.equipment.push({ uid: item.uid, itemId: item.itemId, slot: selectedSlot });
    return saveGame(game);
  }

  function unequip(uid) {
    const game = getGame();
    game.equipment = game.equipment.filter(item => item.uid !== uid);
    return saveGame(game);
  }

  function consume(itemId, quantity = 1) {
    return remove(itemId, quantity);
  }

  function totalWeight(inputGame = null) {
    const game = inputGame ? normalizeGame(inputGame) : getGame();
    return game.inventory.reduce((total, owned) => {
      const data = itemData(owned.itemId);
      if (!data) return total;
      return total + Number(data.weight || 0) * positiveQuantity(owned.quantity);
    }, 0);
  }

  return {
    getGame,
    saveGame,
    normalizeGame,
    createItems,
    add,
    remove,
    consume,
    equip,
    unequip,
    find,
    totalWeight,
    itemData,
    resolveItemId,
    equipmentSlot
  };
})();
