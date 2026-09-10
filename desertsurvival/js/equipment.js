import { itemData } from './items.js';

export function createDefaultEquipment() {
  return {
    head: null,
    body: null,
    hands: null,
    feet: null,
    accessory: null
  };
}

export function equipItem(inventory, equipment, inventoryIndex) {
  const entry = inventory[inventoryIndex];
  if (!entry) return false;
  const data = itemData[entry.id];
  if (!data?.equipSlot) return false;

  const slot = data.equipSlot;
  if (!(slot in equipment)) return false;

  const previous = equipment[slot];
  equipment[slot] = { id:entry.id, amount:1 };
  entry.amount -= 1;
  if (entry.amount <= 0) inventory.splice(inventoryIndex, 1);
  if (previous) inventory.push(previous);
  return true;
}

export function unequipItem(inventory, equipment, slot) {
  const entry = equipment[slot];
  if (!entry) return false;
  inventory.push(entry);
  equipment[slot] = null;
  return true;
}
