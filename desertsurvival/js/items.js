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

export function createDefaultInventory() {
  return [];
}

export function addItem(inventory, itemId, amount = 1) {
  const data = getItemData(itemId);
  if (!data) throw new Error(`不明なアイテム: ${itemId}`);
  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  const max = Math.max(1, Number(data.stackMax) || 1);

  if (max > 1) {
    for (const slot of inventory) {
      if (slot.id !== itemId || slot.amount >= max) continue;
      const add = Math.min(max - slot.amount, remaining);
      slot.amount += add;
      remaining -= add;
      if (remaining <= 0) return inventory;
    }
  }

  while (remaining > 0) {
    const add = Math.min(max, remaining);
    inventory.push({ id:itemId, amount:add });
    remaining -= add;
  }
  return inventory;
}

export function countItem(inventory, itemId) {
  return inventory.reduce((total, slot) => total + (slot.id === itemId ? Number(slot.amount || 0) : 0), 0);
}

export function removeItem(inventory, itemId, amount = 1) {
  let remaining = Math.max(1, Math.floor(Number(amount) || 1));
  if (countItem(inventory, itemId) < remaining) return false;

  for (let i = 0; i < inventory.length && remaining > 0;) {
    const slot = inventory[i];
    if (slot.id !== itemId) { i += 1; continue; }
    const take = Math.min(slot.amount, remaining);
    slot.amount -= take;
    remaining -= take;
    if (slot.amount <= 0) inventory.splice(i, 1);
    else i += 1;
  }
  return true;
}
