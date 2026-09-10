import { getActiveGame, setActiveGame, createNewGameState } from './save.js';
import { itemData, normalizeInventory, INVENTORY_SLOT_COUNT } from './items.js';
import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_NAMES,
  normalizeEquipment,
  canEquipToSlot,
  equipItem,
  unequipItem
} from './equipment.js';

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

function currentEntry(selection = selected) {
  if (!selection) return null;
  if (selection.kind === 'inventory') return game.inventory[selection.index] || null;
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

function moveInventoryToInventory(from, to) {
  const source = game.inventory[from];
  if (!source) return false;
  const target = game.inventory[to];

  if (!target) {
    game.inventory[to] = source;
    game.inventory[from] = null;
    return true;
  }

  if (source.id === target.id) {
    const max = Math.max(1, Number(itemData[source.id]?.stackMax || 1));
    if (max > 1 && target.amount < max) {
      const moved = Math.min(max - Number(target.amount || 0), Number(source.amount || 0));
      target.amount += moved;
      source.amount -= moved;
      if (source.amount <= 0) game.inventory[from] = null;
      return moved > 0;
    }
  }

  game.inventory[from] = target;
  game.inventory[to] = source;
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

function clickInventory(index) {
  const entry = game.inventory[index];

  if (!selected) {
    if (!entry) return;
    selected = { kind:'inventory', index };
    render();
    return;
  }

  if (selected.kind === 'inventory' && selected.index === index) {
    selected = null;
    render();
    return;
  }

  let moved = false;
  if (selected.kind === 'inventory') {
    moved = moveInventoryToInventory(selected.index, index);
  } else if (selected.kind === 'equipment') {
    const target = game.inventory[index];
    if (!target) {
      moved = unequipItem(game.inventory, game.equipment, selected.slot, index);
    } else if (canEquipToSlot(target.id, selected.slot)) {
      const equipped = game.equipment[selected.slot];
      game.equipment[selected.slot] = target;
      game.inventory[index] = equipped;
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
    moved = equipItem(game.inventory, game.equipment, selected.index, slot);
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
  for (let index = 0; index < INVENTORY_SLOT_COUNT; index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'inventory-slot';
    if (selected?.kind === 'inventory' && selected.index === index) button.classList.add('selected');
    button.setAttribute('aria-label', game.inventory[index] ? `${itemData[game.inventory[index].id]?.name || game.inventory[index].id} ${game.inventory[index].amount || 1}` : `空きマス ${index + 1}`);
    slotContents(button, game.inventory[index]);
    button.addEventListener('click', () => clickInventory(index));
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
