import { itemData, INVENTORY_SLOT_COUNT } from './items.js?v=20260910-inventory2';

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
  if (!normalized.rightHand && source.hands) normalized.rightHand = source.hands;
  return normalized;
}

export function canEquipToSlot(itemId, slot) {
  const data = itemData[itemId];
  if (!data?.equipSlot) return false;
  const allowed = Array.isArray(data.equipSlot) ? data.equipSlot : [data.equipSlot];
  if (allowed.includes(slot)) return true;
  return allowed.includes('hand') && (slot === 'rightHand' || slot === 'leftHand');
}

function usedInventorySlots(inventory) {
  return new Set((inventory || []).map(entry => Number(entry?.slot)).filter(slot => Number.isInteger(slot)));
}

function firstFreeInventorySlot(inventory) {
  const used = usedInventorySlots(inventory);
  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    if (!used.has(i)) return i;
  }
  return -1;
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
  const sourceSlot = Number(entry.slot);
  equipment[slot] = { id:entry.id, amount:1 };

  entry.amount -= 1;
  if (entry.amount <= 0) inventory.splice(inventoryIndex, 1);

  if (previous) {
    const targetInventorySlot = Number.isInteger(sourceSlot) ? sourceSlot : firstFreeInventorySlot(inventory);
    if (targetInventorySlot < 0) {
      equipment[slot] = previous;
      if (entry.amount <= 0) inventory.splice(inventoryIndex, 0, { id:entry.id, amount:1, slot:sourceSlot });
      else entry.amount += 1;
      return false;
    }
    inventory.push({ ...previous, slot:targetInventorySlot });
  }
  return true;
}

export function unequipItem(inventory, equipment, slot, targetSlotIndex = null) {
  const entry = equipment[slot];
  if (!entry) return false;

  const inventorySlot = Number.isInteger(targetSlotIndex) ? targetSlotIndex : firstFreeInventorySlot(inventory);
  if (inventorySlot < 0 || inventorySlot >= INVENTORY_SLOT_COUNT) return false;
  if ((inventory || []).some(value => Number(value?.slot) === inventorySlot)) return false;

  inventory.push({ ...entry, slot:inventorySlot });
  equipment[slot] = null;
  return true;
}
