const COLS = 16;
const ROWS = 11;
const INVENTORY_SLOTS = 15;

const field = document.getElementById('field');
const status = document.getElementById('status');
const inventoryGrid = document.getElementById('inventoryGrid');
const selectedItemLabel = document.getElementById('selectedItemLabel');
const deleteTool = document.getElementById('deleteTool');
const topMenuToggle = document.getElementById('topMenuToggle');
const topQuickMenu = document.getElementById('topQuickMenu');

const allItems = Array.isArray(window.HOUSEBUILDING_2D_ITEMS)
  ? window.HOUSEBUILDING_2D_ITEMS
  : [];

const items = allItems.filter(item => item.category === '建設' && item.unlocked !== false);

const cells = [];
const cellMap = new Map();
const occupancy = new Map();
const placements = new Map();

let selectedItem = items.find(item => Number(item.owned || 0) > 0) || null;
let mode = selectedItem ? 'place' : 'delete';
let nextPlacementId = 1;

function cellKey(x, y) {
  return `${x},${y}`;
}

function createGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let x = 0; x < COLS; x++) {
      const y = ROWS - 1 - row;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.setAttribute('aria-label', `X ${x} Y ${y}`);
      field.appendChild(cell);
      cells.push(cell);
      cellMap.set(cellKey(x, y), cell);
    }
  }
}

function getFootprint(item, x, y) {
  const result = [];
  for (let dy = 0; dy < item.height; dy++) {
    for (let dx = 0; dx < item.width; dx++) {
      result.push({ x: x + dx, y: y + dy });
    }
  }
  return result;
}

function isInsideField(item, x, y) {
  return x >= 0 && y >= 0 && x + item.width <= COLS && y + item.height <= ROWS;
}

function canPlace(item, x, y) {
  if (!isInsideField(item, x, y)) return false;
  return getFootprint(item, x, y).every(pos => !occupancy.has(cellKey(pos.x, pos.y)));
}

function clearTarget() {
  cells.forEach(cell => cell.classList.remove('target'));
}

function showTarget(x, y) {
  clearTarget();
  if (mode === 'delete') {
    const cell = cellMap.get(cellKey(x, y));
    if (cell) cell.classList.add('target');
    status.textContent = `削除 X:${x} / Y:${y}`;
    return;
  }
  if (!selectedItem) return;
  getFootprint(selectedItem, x, y).forEach(pos => {
    const cell = cellMap.get(cellKey(pos.x, pos.y));
    if (cell) cell.classList.add('target');
  });
  status.textContent = `${selectedItem.name} X:${x} / Y:${y}`;
}

function renderPlacement(placement) {
  const { item, x, y } = placement;
  const visual = document.createElement('div');
  visual.className = 'placed-item';
  if (item.id === 'item_000') visual.classList.add('block-visual');
  visual.dataset.itemId = item.id;
  visual.textContent = item.icon;
  visual.title = item.name;
  visual.style.left = `${(x / COLS) * 100}%`;
  visual.style.bottom = `${(y / ROWS) * 100}%`;
  visual.style.width = `${(item.width / COLS) * 100}%`;
  visual.style.height = `${(item.height / ROWS) * 100}%`;
  field.appendChild(visual);
  placement.element = visual;
}

function openPurchase(item) {
  clearTarget();
  if (!item.purchasable) {
    status.textContent = `${item.name}は購入できません`;
    return;
  }
  const purchase = window.HOUSEBUILDING_PURCHASE;
  if (!purchase?.open) {
    status.textContent = '購入画面を読み込めませんでした';
    return;
  }
  purchase.open(item, purchasedItem => {
    selectedItem = purchasedItem;
    mode = 'place';
    deleteTool.classList.remove('active');
    createInventory();
    selectedItemLabel.textContent = `${purchasedItem.name} ${purchasedItem.owned}個`;
    status.textContent = `${purchasedItem.name}を購入しました`;
  });
}

function placeSelectedItem(x, y) {
  if (!selectedItem) return;
  if (Number(selectedItem.owned || 0) <= 0) {
    openPurchase(selectedItem);
    return;
  }
  if (!canPlace(selectedItem, x, y)) {
    status.textContent = 'そこには置けません';
    return;
  }

  const placedItem = selectedItem;
  const id = `placed_${nextPlacementId++}`;
  const footprint = getFootprint(placedItem, x, y);
  const placement = { id, item: placedItem, x, y, footprint, element: null };

  footprint.forEach(pos => {
    const key = cellKey(pos.x, pos.y);
    occupancy.set(key, id);
    cellMap.get(key)?.classList.add('occupied');
  });

  placements.set(id, placement);
  renderPlacement(placement);
  placedItem.owned = Math.max(0, Number(placedItem.owned || 0) - 1);

  if (placedItem.owned <= 0) {
    selectedItem = null;
    selectedItemLabel.textContent = `${placedItem.name} 0個`;
    status.textContent = `${placedItem.name}は0個になりました`;
  }

  createInventory();
}

function deleteAt(x, y) {
  const id = occupancy.get(cellKey(x, y));
  if (!id) {
    status.textContent = 'ここには何もありません';
    return;
  }
  const placement = placements.get(id);
  if (!placement) return;

  placement.footprint.forEach(pos => {
    const key = cellKey(pos.x, pos.y);
    occupancy.delete(key);
    cellMap.get(key)?.classList.remove('occupied');
  });

  placement.element?.remove();
  placements.delete(id);
  placement.item.owned = Number(placement.item.owned || 0) + 1;
  createInventory();
}

function actOnCell(cell) {
  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);
  showTarget(x, y);
  if (mode === 'delete') deleteAt(x, y);
  else placeSelectedItem(x, y);
}

function createInventory() {
  inventoryGrid.innerHTML = '';

  for (let index = 0; index < INVENTORY_SLOTS; index++) {
    const item = items[index] || null;
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'inventory-slot';

    if (!item) {
      slot.classList.add('empty');
      slot.disabled = true;
      inventoryGrid.appendChild(slot);
      continue;
    }

    const owned = Number(item.owned || 0);
    slot.dataset.itemId = item.id;
    if (owned <= 0) slot.classList.add('zero-stock');
    if (selectedItem?.id === item.id && owned > 0 && mode === 'place') slot.classList.add('selected');

    const icon = document.createElement('span');
    icon.className = 'inventory-icon';
    icon.textContent = item.icon;

    const name = document.createElement('span');
    name.className = 'inventory-name';
    name.textContent = item.name;

    const size = document.createElement('span');
    size.className = 'inventory-size';
    size.textContent = `${item.height}×${item.width}`;

    const itemCount = document.createElement('span');
    itemCount.className = 'inventory-count';
    itemCount.textContent = String(owned);

    slot.append(icon, name, size, itemCount);
    slot.addEventListener('click', () => {
      if (Number(item.owned || 0) <= 0) openPurchase(item);
      else selectInventoryItem(item, slot);
    });
    inventoryGrid.appendChild(slot);
  }

  if (selectedItem && Number(selectedItem.owned || 0) > 0 && mode === 'place') {
    selectedItemLabel.textContent = `${selectedItem.name} ${selectedItem.owned}個`;
  } else if (mode !== 'delete') {
    selectedItemLabel.textContent = '未選択';
  }
}

function selectInventoryItem(item, slot) {
  if (Number(item.owned || 0) <= 0) {
    openPurchase(item);
    return;
  }
  selectedItem = item;
  mode = 'place';
  inventoryGrid.querySelectorAll('.inventory-slot').forEach(el => el.classList.remove('selected'));
  slot.classList.add('selected');
  deleteTool.classList.remove('active');
  selectedItemLabel.textContent = `${item.name} ${item.owned}個`;
  status.textContent = `${item.name}を置くマスをタップ`;
  clearTarget();
}

function bindGridEvents() {
  cells.forEach(cell => {
    cell.addEventListener('pointerdown', () => showTarget(Number(cell.dataset.x), Number(cell.dataset.y)));
    cell.addEventListener('click', () => actOnCell(cell));
  });
}

function bindDeleteTool() {
  deleteTool.addEventListener('click', () => {
    mode = 'delete';
    selectedItem = null;
    inventoryGrid.querySelectorAll('.inventory-slot').forEach(el => el.classList.remove('selected'));
    deleteTool.classList.add('active');
    selectedItemLabel.textContent = '削除モード';
    status.textContent = '消すアイテムをタップ';
    clearTarget();
  });
}

function closeTopQuickMenu() {
  if (!topQuickMenu || !topMenuToggle) return;
  topQuickMenu.hidden = true;
  topMenuToggle.setAttribute('aria-expanded', 'false');
}

function bindTopQuickMenu() {
  if (!topQuickMenu || !topMenuToggle) return;
  topMenuToggle.addEventListener('click', event => {
    event.stopPropagation();
    const willOpen = topQuickMenu.hidden;
    topQuickMenu.hidden = !willOpen;
    topMenuToggle.setAttribute('aria-expanded', String(willOpen));
  });
  topQuickMenu.addEventListener('click', event => event.stopPropagation());
  document.getElementById('quickTop')?.addEventListener('click', () => location.href = './housebuilding_index.html');
  document.getElementById('quickLog')?.addEventListener('click', () => { status.textContent = 'LOG'; closeTopQuickMenu(); });
  document.getElementById('quickRoad')?.addEventListener('click', () => { status.textContent = 'ROAD'; closeTopQuickMenu(); });
  document.getElementById('quickSave')?.addEventListener('click', () => { status.textContent = 'SAVE'; closeTopQuickMenu(); });
  document.addEventListener('click', closeTopQuickMenu);
}

function bindNavigation() {
  document.getElementById('back').addEventListener('click', () => {
    location.href = './housebuilding_選択.html';
  });
}

createGrid();
createInventory();
bindGridEvents();
bindDeleteTool();
bindTopQuickMenu();
bindNavigation();
