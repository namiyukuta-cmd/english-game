export const INVENTORY_SLOT_COUNT = 30;

export const ITEM_TYPES = Object.freeze({
  MATERIAL: 'material',
  FOOD: 'food',
  PLACEABLE: 'placeable'
});

export const itemData = Object.freeze({
  stone: { id:'stone', name:'石', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.3, description:'砂漠や礫地で拾える石。' },
  dry_branch: { id:'dry_branch', name:'枯れ枝', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.2, description:'乾燥した低木などから落ちた枯れ枝。' },
  grass: { id:'grass', name:'草', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.05, description:'砂漠にまばらに生える草。' },
  raw_meat: {
    id:'raw_meat',
    name:'生肉',
    type:ITEM_TYPES.FOOD,
    stackMax:99,
    weight:0.3,
    description:'動物から得た生肉。加熱前。',
    useType:'eat',
    useLabel:'食べる',
    useIcon:'🍖',
    foodRestore:12
  },
  campfire: {
    id:'campfire',
    name:'焚き火',
    type:ITEM_TYPES.PLACEABLE,
    stackMax:1,
    weight:1.5,
    description:'地面に設置して使う焚き火。',
    useType:'place',
    useLabel:'設置',
    useIcon:'🔥'
  }
});

export function getItemData(itemId) {
  return itemData[itemId] || null;
}

function firstFreeSlot(inventory) {
  const used = new Set(
    (Array.isArray(inventory) ? inventory : [])
      .map(entry => Number(entry?.slot))
      .filter(slot => Number.isInteger(slot) && slot >= 0 && slot < INVENTORY_SLOT_COUNT)
  );
  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    if (!used.has(i)) return i;
  }
  return -1;
}

export function normalizeInventory(inventory) {
  const source = (Array.isArray(inventory) ? inventory : [])
    .filter(entry => entry && entry.id && Number(entry.amount || 0) > 0)
    .slice(0, INVENTORY_SLOT_COUNT)
    .map(entry => ({
      id:entry.id,
      amount:Math.max(1, Math.floor(Number(entry.amount || 1))),
      ...(Number.isInteger(Number(entry.slot)) ? { slot:Number(entry.slot) } : {})
    }));

  const used = new Set();
  for (const entry of source) {
    const slot = Number(entry.slot);
    if (!Number.isInteger(slot) || slot < 0 || slot >= INVENTORY_SLOT_COUNT || used.has(slot)) {
      delete entry.slot;
      continue;
    }
    used.add(slot);
  }

  for (const entry of source) {
    if (Number.isInteger(entry.slot)) continue;
    for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
      if (used.has(i)) continue;
      entry.slot = i;
      used.add(i);
      break;
    }
  }

  return source;
}

export function createDefaultInventory() {
  return [];
}

export function addItem(inventory, itemId, amount = 1) {
  const data = getItemData(itemId);
  if (!data) throw new Error(`不明なアイテム: ${itemId}`);
  if (!Array.isArray(inventory)) return inventory;

  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  const max = Math.max(1, Number(data.stackMax) || 1);

  if (max > 1) {
    for (const entry of inventory) {
      if (!entry || entry.id !== itemId || Number(entry.amount || 0) >= max) continue;
      const add = Math.min(max - Number(entry.amount || 0), remaining);
      entry.amount = Number(entry.amount || 0) + add;
      remaining -= add;
      if (remaining <= 0) return inventory;
    }
  }

  while (remaining > 0 && inventory.length < INVENTORY_SLOT_COUNT) {
    const slot = firstFreeSlot(inventory);
    if (slot < 0) break;
    const add = Math.min(max, remaining);
    inventory.push({ id:itemId, amount:add, slot });
    remaining -= add;
  }

  return inventory;
}

export function countItem(inventory, itemId) {
  return (Array.isArray(inventory) ? inventory : []).reduce((total, entry) => {
    return total + (entry?.id === itemId ? Number(entry.amount || 0) : 0);
  }, 0);
}

export function removeItem(inventory, itemId, amount = 1) {
  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  if (countItem(inventory, itemId) < remaining) return false;

  for (let i = 0; i < inventory.length && remaining > 0;) {
    const entry = inventory[i];
    if (!entry || entry.id !== itemId) {
      i += 1;
      continue;
    }
    const take = Math.min(Number(entry.amount || 0), remaining);
    entry.amount -= take;
    remaining -= take;
    if (entry.amount <= 0) inventory.splice(i, 1);
    else i += 1;
  }
  return true;
}
