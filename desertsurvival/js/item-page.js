import { getActiveGame, setActiveGame, createNewGameState } from './save.js';
import { itemData } from './items.js';
import { equipItem, unequipItem } from './equipment.js';

const content = document.getElementById('itemContent');
let game = getActiveGame() || createNewGameState();
game.inventory = Array.isArray(game.inventory) ? game.inventory : [];

game.equipment = game.equipment || {
  head:null,
  body:null,
  hands:null,
  feet:null,
  accessory:null
};

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

function makeItemRow(entry, index) {
  const data = itemData[entry.id] || {};
  const row = document.createElement('div');
  row.className = 'item-row';

  const text = document.createElement('div');
  text.className = 'item-row-copy';
  const name = document.createElement('strong');
  name.textContent = itemName(entry.id);
  const meta = document.createElement('small');
  meta.textContent = `×${entry.amount || 1} / ${data.stackMax || 1}`;
  text.append(name, meta);
  row.appendChild(text);

  if (data.equipSlot) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '装備';
    button.addEventListener('click', () => {
      equipItem(game.inventory, game.equipment, index);
      setActiveGame(game);
      render();
    });
    row.appendChild(button);
  }

  return row;
}

function render() {
  content.innerHTML = `
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

  if (!game.inventory.length) {
    inventoryList.innerHTML = '<div class="empty">所持品なし</div>';
  } else {
    game.inventory.forEach((entry, index) => {
      inventoryList.appendChild(makeItemRow(entry, index));
    });
  }

  for (const [slot, entry] of Object.entries(game.equipment)) {
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
        render();
      });
      row.appendChild(button);
    }

    equipmentList.appendChild(row);
  }
}

window.addEventListener('pagehide', () => setActiveGame(game));
render();
