export const INVENTORY_SLOT_COUNT = 36;

export const ITEM_TYPES = Object.freeze({
  MATERIAL: 'material',
  FOOD: 'food',
  PLACEABLE: 'placeable'
});

export const itemData = Object.freeze({
  stone: { id:'stone', name:'石', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.3, description:'砂漠や礫地で拾える石。' },
  dry_branch: { id:'dry_branch', name:'枯れ枝', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.2, description:'乾燥した低木などから落ちた枯れ枝。' },
  grass: { id:'grass', name:'草', type:ITEM_TYPES.MATERIAL, stackMax:99, weight:0.05, description:'砂漠にまばらに生える草。' },
  raw_meat: { id:'raw_meat', name:'生肉', type:ITEM_TYPES.FOOD, stackMax:99, weight:0.3, description:'動物から得た生肉。加熱前。' },
  campfire: { id:'campfire', name:'焚き火', type:ITEM_TYPES.PLACEABLE, stackMax:1, weight:1.5, description:'地面に設置して使う焚き火。' }
});

export function getItemData(itemId) {
  return itemData[itemId] || null;
}

export function normalizeInventory(inventory) {
  const source = Array.isArray(inventory) ? inventory : [];
  const packed = source
    .filter(entry => entry && entry.id && Number(entry.amount || 0) > 0)
    .map(entry => ({ id:entry.id, amount:Math.max(1, Math.floor(Number(entry.amount || 1))) }));

  const slots = Array(INVENTORY_SLOT_COUNT).fill(null);
  for (let i = 0; i < Math.min(packed.length, INVENTORY_SLOT_COUNT); i += 1) {
    slots[i] = packed[i];
  }
  return slots;
}

export function createDefaultInventory() {
  return Array(INVENTORY_SLOT_COUNT).fill(null);
}

export function addItem(inventory, itemId, amount = 1) {
  const data = getItemData(itemId);
  if (!data) throw new Error(`不明なアイテム: ${itemId}`);

  if (!Array.isArray(inventory)) return inventory;
  while (inventory.length < INVENTORY_SLOT_COUNT) inventory.push(null);
  if (inventory.length > INVENTORY_SLOT_COUNT) inventory.length = INVENTORY_SLOT_COUNT;

  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  const max = Math.max(1, Number(data.stackMax) || 1);

  if (max > 1) {
    for (const slot of inventory) {
      if (!slot || slot.id !== itemId || Number(slot.amount || 0) >= max) continue;
      const add = Math.min(max - Number(slot.amount || 0), remaining);
      slot.amount = Number(slot.amount || 0) + add;
      remaining -= add;
      if (remaining <= 0) return inventory;
    }
  }

  for (let i = 0; i < inventory.length && remaining > 0; i += 1) {
    if (inventory[i]) continue;
    const add = Math.min(max, remaining);
    inventory[i] = { id:itemId, amount:add };
    remaining -= add;
  }

  return inventory;
}

export function countItem(inventory, itemId) {
  return (Array.isArray(inventory) ? inventory : []).reduce((total, slot) => {
    return total + (slot?.id === itemId ? Number(slot.amount || 0) : 0);
  }, 0);
}

export function removeItem(inventory, itemId, amount = 1) {
  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  if (countItem(inventory, itemId) < remaining) return false;

  for (let i = 0; i < inventory.length && remaining > 0; i += 1) {
    const slot = inventory[i];
    if (!slot || slot.id !== itemId) continue;
    const take = Math.min(Number(slot.amount || 0), remaining);
    slot.amount -= take;
    remaining -= take;
    if (slot.amount <= 0) inventory[i] = null;
  }
  return true;
}
