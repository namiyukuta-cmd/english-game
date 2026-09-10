import { getActiveGame, setActiveGame, createNewGameState } from './save.js';
import { itemData } from './items.js';
import { equipItem, unequipItem } from './equipment.js';
import { recipes, canCraft } from './recipes.js';

const backToFieldBtn = document.getElementById('backToFieldBtn');
const menuTabs = document.getElementById('menuTabs');
const menuContent = document.getElementById('menuContent');
let game = getActiveGame() || createNewGameState();
let activeTab = 'inventory';

const slotNames = {
  head:'頭',
  body:'体',
  hands:'手',
  feet:'足',
  accessory:'装飾'
};

function itemName(id) {
  return itemData[id]?.name || id;
}

function renderInventory() {
  menuContent.innerHTML = `
    <div class="inventory-columns">
      <section class="inventory-box">
        <h2>所持品</h2>
        <div id="inventoryList"></div>
      </section>
      <section class="inventory-box">
        <h2>装備</h2>
        <div id="equipmentList"></div>
      </section>
    </div>
  `;

  const inventoryList = document.getElementById('inventoryList');
  const equipmentList = document.getElementById('equipmentList');

  if (!game.inventory?.length) {
    inventoryList.innerHTML = '<div class="empty">所持品なし</div>';
  } else {
    game.inventory.forEach((entry, index) => {
      const data = itemData[entry.id] || {};
      const row = document.createElement('div');
      row.className = 'item-row';
      const text = document.createElement('span');
      text.textContent = `${itemName(entry.id)}${entry.amount > 1 ? ` ×${entry.amount}` : ''}`;
      row.appendChild(text);
      if (data.equipSlot) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '装備';
        button.addEventListener('click', () => {
          equipItem(game.inventory, game.equipment, index);
          setActiveGame(game);
          renderInventory();
        });
        row.appendChild(button);
      }
      inventoryList.appendChild(row);
    });
  }

  Object.entries(game.equipment || {}).forEach(([slot, entry]) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    const text = document.createElement('span');
    text.textContent = `${slotNames[slot] || slot}：${entry ? itemName(entry.id) : 'なし'}`;
    row.appendChild(text);
    if (entry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '外す';
      button.addEventListener('click', () => {
        unequipItem(game.inventory, game.equipment, slot);
        setActiveGame(game);
        renderInventory();
      });
      row.appendChild(button);
    }
    equipmentList.appendChild(row);
  });
}

function renderCraft() {
  menuContent.innerHTML = '<section class="inventory-box"><h2>作れる物</h2><div id="recipeList"></div></section>';
  const list = document.getElementById('recipeList');
  if (!recipes.length) {
    list.innerHTML = '<div class="empty">レシピはまだ登録されていません。</div>';
    return;
  }
  recipes.forEach(recipe => {
    const row = document.createElement('div');
    row.className = 'item-row';
    const text = document.createElement('span');
    text.textContent = recipe.name || recipe.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '作る';
    button.disabled = !canCraft(recipe, game.inventory || []);
    row.append(text, button);
    list.appendChild(row);
  });
}

function render() {
  menuTabs.querySelectorAll('[data-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === activeTab);
  });
  if (activeTab === 'craft') renderCraft();
  else renderInventory();
}

menuTabs.addEventListener('click', event => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  activeTab = button.dataset.tab;
  render();
});

backToFieldBtn.addEventListener('click', () => {
  setActiveGame(game);
  location.href = './desertsurvival_field.html';
});

window.addEventListener('pagehide', () => setActiveGame(game));
render();
