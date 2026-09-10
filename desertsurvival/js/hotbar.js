import { getActiveGame } from './save.js';
import { itemData, normalizeInventory } from './items.js?v=20260910-itemuse1';
import { markpoints } from './markpoints.js?v=20260911-oasis1';

const hotbar = document.getElementById('fieldHotbar');
const useButton = document.getElementById('fieldUseButton');
const HOTBAR_SLOT_COUNT = 5;
let selectedSlot = 0;
let lastSignature = '';

function entryAtSlot(inventory, slot) {
  return inventory.find(entry => Number(entry?.slot) === slot) || null;
}

function nearbyWaterPoint(game) {
  const x = Number(game?.world?.x);
  const z = Number(game?.world?.z);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;

  let nearest = null;
  let nearestDistance = Infinity;
  for (const point of markpoints) {
    if (point.type !== 'water') continue;
    const px = Number(point.x);
    const pz = Number(point.z);
    if (!Number.isFinite(px) || !Number.isFinite(pz)) continue;
    const distance = Math.hypot(px - x, pz - z);
    const radius = Math.max(0, Number(point.interactionRadius || 3));
    if (distance <= radius && distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function updateUseButton(inventory, game) {
  if (!useButton) return;

  const waterPoint = nearbyWaterPoint(game);
  if (waterPoint && Number(game?.player?.water || 0) < 100) {
    useButton.hidden = false;
    useButton.dataset.action = 'drink-water';
    useButton.dataset.markpointId = waterPoint.id;
    useButton.innerHTML = '<span class="field-use-icon">💧</span><span class="field-use-label">飲む</span>';
    useButton.setAttribute('aria-label', `${waterPoint.name || '水場'}の水を飲む`);
    return;
  }

  delete useButton.dataset.markpointId;
  const entry = entryAtSlot(inventory, selectedSlot);
  const data = entry ? itemData[entry.id] : null;

  if (!data?.useType) {
    useButton.hidden = true;
    useButton.dataset.action = '';
    useButton.textContent = '';
    return;
  }

  useButton.hidden = false;
  useButton.dataset.action = 'item';
  useButton.innerHTML = `<span class="field-use-icon">${data.useIcon || '●'}</span><span class="field-use-label">${data.useLabel || '使う'}</span>`;
  useButton.setAttribute('aria-label', `${data.name || entry.id}を${data.useLabel || '使う'}`);
}

function render() {
  if (!hotbar) return;
  const game = getActiveGame();
  const inventory = normalizeInventory(game?.inventory || []);
  const waterPoint = nearbyWaterPoint(game);
  const waterSignature = waterPoint && Number(game?.player?.water || 0) < 100 ? `${waterPoint.id}:${Math.round(Number(game?.player?.water || 0) * 10)}` : '';
  const signature = JSON.stringify(inventory.filter(entry => Number(entry?.slot) < HOTBAR_SLOT_COUNT)) + `|${selectedSlot}|${waterSignature}`;
  if (signature === lastSignature) {
    updateUseButton(inventory, game);
    return;
  }
  lastSignature = signature;

  hotbar.innerHTML = '';
  for (let slot = 0; slot < HOTBAR_SLOT_COUNT; slot += 1) {
    const entry = entryAtSlot(inventory, slot);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotbar-slot';
    if (slot === selectedSlot) button.classList.add('selected');
    button.setAttribute('aria-label', entry ? `${itemData[entry.id]?.name || entry.id} ${entry.amount || 1}` : `クイックスロット ${slot + 1}`);

    if (entry) {
      const name = document.createElement('span');
      name.className = 'hotbar-item-name';
      name.textContent = itemData[entry.id]?.name || entry.id;
      button.appendChild(name);

      if (Number(entry.amount || 1) > 1) {
        const count = document.createElement('span');
        count.className = 'hotbar-count';
        count.textContent = String(entry.amount);
        button.appendChild(count);
      }
    } else {
      const empty = document.createElement('span');
      empty.className = 'hotbar-empty';
      empty.textContent = '·';
      button.appendChild(empty);
    }

    button.addEventListener('click', () => {
      selectedSlot = slot;
      lastSignature = '';
      render();
      window.dispatchEvent(new CustomEvent('desert:hotbar-selected', { detail:{ slot:selectedSlot } }));
    });

    hotbar.appendChild(button);
  }

  updateUseButton(inventory, game);
}

if (useButton) {
  useButton.addEventListener('click', () => {
    const game = getActiveGame();
    const waterPoint = nearbyWaterPoint(game);
    if (waterPoint && Number(game?.player?.water || 0) < 100) {
      window.dispatchEvent(new CustomEvent('desert:drink-water', {
        detail:{ markpointId:waterPoint.id }
      }));
      lastSignature = '';
      return;
    }

    const inventory = normalizeInventory(game?.inventory || []);
    const entry = entryAtSlot(inventory, selectedSlot);
    const data = entry ? itemData[entry.id] : null;
    if (!entry || !data?.useType) return;

    window.dispatchEvent(new CustomEvent('desert:use-hotbar-item', {
      detail:{ slot:selectedSlot, itemId:entry.id, useType:data.useType }
    }));
  });
}

window.addEventListener('desert:inventory-changed', () => {
  lastSignature = '';
  render();
});
window.addEventListener('desert:player-changed', () => {
  lastSignature = '';
  render();
});

render();
setInterval(render, 500);
