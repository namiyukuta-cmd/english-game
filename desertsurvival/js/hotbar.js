import { getActiveGame } from './save.js';
import { itemData, normalizeInventory } from './items.js?v=20260910-itemuse1';

const hotbar = document.getElementById('fieldHotbar');
const useButton = document.getElementById('fieldUseButton');
let selectedSlot = 0;
let lastSignature = '';

function entryAtSlot(inventory, slot) {
  return inventory.find(entry => Number(entry?.slot) === slot) || null;
}

function updateUseButton(inventory) {
  if (!useButton) return;
  const entry = entryAtSlot(inventory, selectedSlot);
  const data = entry ? itemData[entry.id] : null;

  if (!data?.useType) {
    useButton.hidden = true;
    useButton.textContent = '';
    return;
  }

  useButton.hidden = false;
  useButton.innerHTML = `<span class="field-use-icon">${data.useIcon || '●'}</span><span class="field-use-label">${data.useLabel || '使う'}</span>`;
  useButton.setAttribute('aria-label', `${data.name || entry.id}を${data.useLabel || '使う'}`);
}

function render() {
  if (!hotbar) return;
  const game = getActiveGame();
  const inventory = normalizeInventory(game?.inventory || []);
  const signature = JSON.stringify(inventory.filter(entry => Number(entry?.slot) < 6)) + `|${selectedSlot}`;
  if (signature === lastSignature) {
    updateUseButton(inventory);
    return;
  }
  lastSignature = signature;

  hotbar.innerHTML = '';
  for (let slot = 0; slot < 6; slot += 1) {
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

  updateUseButton(inventory);
}

if (useButton) {
  useButton.addEventListener('click', () => {
    const game = getActiveGame();
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

render();
setInterval(render, 500);
