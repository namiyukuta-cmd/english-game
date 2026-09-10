import { itemData } from './items.js';

export const EQUIPMENT_SLOTS = Object.freeze([
  'head',
  'body',
  'rightHand',
  'leftHand',
  'feet',
  'accessory'
]);

export const EQUIPMENT_SLOT_NAMES = Object.freeze({
  head:'頭',
  body:'体',
  rightHand:'右手',
  leftHand:'左手',
  feet:'足',
  accessory:'装飾'
});

export function createDefaultEquipment() {
  return {
    head:null,
    body:null,
    rightHand:null,
    leftHand:null,
    feet:null,
    accessory:null
  };
}

export function normalizeEquipment(equipment) {
  const source = equipment && typeof equipment === 'object' ? equipment : {};
  const normalized = createDefaultEquipment();

  for (const slot of EQUIPMENT_SLOTS) {
    if (source[slot]) normalized[slot] = source[slot];
  }

  // 旧セーブの hands は右手へ移す。
  if (!normalized.rightHand && source.hands) normalized.rightHand = source.hands;
  return normalized;
}

export function canEquipToSlot(itemId, slot) {
  const data = itemData[itemId];
  if (!data?.equipSlot) return false;
  const allowed = Array.isArray(data.equipSlot) ? data.equipSlot : [data.equipSlot];
  if (allowed.includes(slot)) return true;
  if (allowed.includes('hand') && (slot === 'rightHand' || slot === 'leftHand')) return true;
  return false;
}

export function equipItem(inventory, equipment, inventoryIndex, targetSlot = null) {
  const entry = inventory[inventoryIndex];
  if (!entry) return false;
  const data = itemData[entry.id];
  if (!data?.equipSlot) return false;

  let slot = targetSlot;
  if (!slot) {
    const allowed = Array.isArray(data.equipSlot) ? data.equipSlot : [data.equipSlot];
    slot = allowed[0] === 'hand' ? 'rightHand' : allowed[0];
  }
  if (!(slot in equipment) || !canEquipToSlot(entry.id, slot)) return false;

  const previous = equipment[slot];
  equipment[slot] = { id:entry.id, amount:1 };
  entry.amount -= 1;
  if (entry.amount <= 0) inventory[inventoryIndex] = null;
  if (previous) inventory[inventoryIndex] = previous;
  return true;
}

export function unequipItem(inventory, equipment, slot, targetIndex = null) {
  const entry = equipment[slot];
  if (!entry) return false;

  let index = Number.isInteger(targetIndex) ? targetIndex : inventory.findIndex(value => !value);
  if (index < 0 || index >= inventory.length || inventory[index]) return false;

  inventory[index] = entry;
  equipment[slot] = null;
  return true;
}
