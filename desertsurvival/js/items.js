// 主人公の所持品。
// アイテム種類は、内容が決まったものだけここへ追加する。
export const itemData = Object.freeze({});

export function createDefaultInventory() {
  return [];
}

export function addItem(inventory, itemId, amount = 1) {
  const data = itemData[itemId];
  if (!data) throw new Error(`不明なアイテム: ${itemId}`);
  const qty = Math.max(1, Math.floor(Number(amount) || 1));
  const stack = inventory.find(item => item.id === itemId && data.stackMax > 1);
  if (stack) stack.amount += qty;
  else inventory.push({ id:itemId, amount:qty });
  return inventory;
}

export function removeItem(inventory, itemId, amount = 1) {
  const qty = Math.max(1, Math.floor(Number(amount) || 1));
  const index = inventory.findIndex(item => item.id === itemId);
  if (index < 0) return false;
  inventory[index].amount -= qty;
  if (inventory[index].amount <= 0) inventory.splice(index, 1);
  return true;
}
