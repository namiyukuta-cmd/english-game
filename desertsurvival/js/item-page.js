import { getActiveGame, setActiveGame, createNewGameState } from './save.js';
import { itemData, normalizeInventory, INVENTORY_SLOT_COUNT } from './items.js?v=20260910-inventory2';
import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_NAMES,
  normalizeEquipment,
  canEquipToSlot,
  equipItem,
  unequipItem
} from './equipment.js?v=20260910-inventory2';

const description = document.getElementById('itemDescription');
const equipmentGrid = document.getElementById('equipmentGrid');
const inventoryGrid = document.getElementById('inventoryGrid');

let game = getActiveGame() || createNewGameState();
game.inventory = normalizeInventory(game.inventory);
game.equipment = normalizeEquipment(game.equipment);

let selected = null;

const TYPE_NAMES = {
  material:'素材',
  food:'食料',
  placeable:'設置物'
};

function inventoryIndexAtSlot(slot) {
  return game.inventory.findIndex(entry => Number(entry?.slot) === Number(slot));
}

function inventoryEntryAtSlot(slot) {
  const index = inventoryIndexAtSlot(slot);
  return index >= 0 ? game.inventory[index] : null;
}

function currentEntry(selection = selected) {
  if (!selection) return null;
  if (selection.kind === 'inventory') return inventoryEntryAtSlot(selection.slot);
  if (selection.kind === 'equipment') return game.equipment[selection.slot] || null;
  return null;
}

function renderDescription() {
  const entry = currentEntry();
  if (!entry) {
    description.className = 'inventory-description empty-description';
    description.innerHTML = '<h2>アイテム</h2><p>マスをタップすると、ここに説明が表示されます。</p>';
    return;
  }

  const data = itemData[entry.id] || {};
  const typeName = TYPE_NAMES[data.type] || data.type || 'アイテム';
  const max = Math.max(1, Number(data.stackMax || 1));
  description.className = 'inventory-description';
  description.innerHTML = `
    <h2>${data.name || entry.id}</h2>
    <div class="item-meta">${typeName}　${Number(entry.amount || 1)} / ${max}</div>
    <p>${data.description || '説明はまだありません。'}</p>
  `;
}

function slotContents(button, entry, label = '') {
  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'slot-label';
    labelEl.textContent = label;
    button.appendChild(labelEl);
  }

  if (!entry) {
    const empty = document.createElement('span');
    empty.className = 'slot-empty-mark';
    empty.textContent = '·';
    button.appendChild(empty);
    return;
  }

  const data = itemData[entry.id] || {};
  const name = document.createElement('span');
  name.className = 'slot-item-name';
  name.textContent = data.name || entry.id;
  button.appendChild(name);

  if (Number(entry.amount || 1) > 1) {
    const count = document.createElement('span');
    count.className = 'slot-count';
    count.textContent = String(entry.amount);
    button.appendChild(count);
  }
}

function saveAndRender() {
  setActiveGame(game);
  render();
}

function moveInventoryToInventory(fromSlot, toSlot) {
  const sourceIndex = inventoryIndexAtSlot(fromSlot);
  if (sourceIndex < 0) return false;
  const source = game.inventory[sourceIndex];
  const targetIndex = inventoryIndexAtSlot(toSlot);

  if (targetIndex < 0) {
    source.slot = toSlot;
    return true;
  }

  const target = game.inventory[targetIndex];
  if (source.id === target.id) {
    const max = Math.max(1, Number(itemData[source.id]?.stackMax || 1));
    if (max > 1 && Number(target.amount || 0) < max) {
      const moved = Math.min(max - Number(target.amount || 0), Number(source.amount || 0));
      target.amount = Number(target.amount || 0) + moved;
      source.amount = Number(source.amount || 0) - moved;
      if (source.amount <= 0) game.inventory.splice(sourceIndex, 1);
      return moved > 0;
    }
  }

  const sourceSlot = source.slot;
  source.slot = target.slot;
  target.slot = sourceSlot;
  return true;
}

function moveEquipmentToEquipment(fromSlot, toSlot) {
  const source = game.equipment[fromSlot];
  if (!source || !canEquipToSlot(source.id, toSlot)) return false;
  const target = game.equipment[toSlot];
  if (target && !canEquipToSlot(target.id, fromSlot)) return false;
  game.equipment[toSlot] = source;
  game.equipment[fromSlot] = target || null;
  return true;
}

function clickInventory(slot) {
  const entry = inventoryEntryAtSlot(slot);

  if (!selected) {
    if (!entry) return;
    selected = { kind:'inventory', slot };
    render();
    return;
  }

  if (selected.kind === 'inventory' && selected.slot === slot) {
    selected = null;
    render();
    return;
  }

  let moved = false;
  if (selected.kind === 'inventory') {
    moved = moveInventoryToInventory(selected.slot, slot);
  } else if (selected.kind === 'equipment') {
    const target = inventoryEntryAtSlot(slot);
    if (!target) {
      moved = unequipItem(game.inventory, game.equipment, selected.slot, slot);
    } else if (canEquipToSlot(target.id, selected.slot)) {
      const equipped = game.equipment[selected.slot];
      game.equipment[selected.slot] = { id:target.id, amount:1 };
      target.id = equipped.id;
      target.amount = equipped.amount || 1;
      moved = true;
    }
  }

  if (moved) {
    selected = null;
    saveAndRender();
  }
}

function clickEquipment(slot) {
  const entry = game.equipment[slot];

  if (!selected) {
    if (!entry) return;
    selected = { kind:'equipment', slot };
    render();
    return;
  }

  if (selected.kind === 'equipment' && selected.slot === slot) {
    selected = null;
    render();
    return;
  }

  let moved = false;
  if (selected.kind === 'inventory') {
    const sourceIndex = inventoryIndexAtSlot(selected.slot);
    if (sourceIndex >= 0) moved = equipItem(game.inventory, game.equipment, sourceIndex, slot);
  } else if (selected.kind === 'equipment') {
    moved = moveEquipmentToEquipment(selected.slot, slot);
  }

  if (moved) {
    selected = null;
    saveAndRender();
  }
}

function renderEquipment() {
  equipmentGrid.innerHTML = '';
  for (const slot of EQUIPMENT_SLOTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'equipment-slot';
    if (selected?.kind === 'equipment' && selected.slot === slot) button.classList.add('selected');
    button.setAttribute('aria-label', `${EQUIPMENT_SLOT_NAMES[slot]} 装備`);
    slotContents(button, game.equipment[slot], EQUIPMENT_SLOT_NAMES[slot]);
    button.addEventListener('click', () => clickEquipment(slot));
    equipmentGrid.appendChild(button);
  }
}

function renderInventory() {
  inventoryGrid.innerHTML = '';
  for (let slot = 0; slot < INVENTORY_SLOT_COUNT; slot += 1) {
    const entry = inventoryEntryAtSlot(slot);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'inventory-slot';
    if (selected?.kind === 'inventory' && selected.slot === slot) button.classList.add('selected');
    button.setAttribute('aria-label', entry ? `${itemData[entry.id]?.name || entry.id} ${entry.amount || 1}` : `空きマス ${slot + 1}`);
    slotContents(button, entry);
    button.addEventListener('click', () => clickInventory(slot));
    inventoryGrid.appendChild(button);
  }
}

function render() {
  renderDescription();
  renderEquipment();
  renderInventory();
}

window.addEventListener('pagehide', () => setActiveGame(game));
setActiveGame(game);
render();
