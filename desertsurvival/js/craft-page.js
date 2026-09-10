import { getActiveGame, setActiveGame } from './save.js?v=20260910-stateprotect1';
import { itemData, normalizeInventory } from './items.js?v=20260910-itemuse1';
import { recipes, canCraft, craftRecipe } from './recipes.js';

const content = document.getElementById('craftContent');
let game = getActiveGame();
if (!game) {
  location.replace('./desertsurvival_index.html');
  throw new Error('Desert Survival の進行中データがありません。');
}
game.inventory = normalizeInventory(game.inventory);

function itemName(id) {
  return itemData[id]?.name || id;
}

function ownedAmount(itemId) {
  return game.inventory
    .filter(entry => entry && entry.id === itemId)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

function render() {
  content.innerHTML = '';

  if (!recipes.length) {
    content.innerHTML = '<div class="empty">作れる物はまだありません。</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'craft-list';

  for (const recipe of recipes) {
    const card = document.createElement('article');
    card.className = 'craft-card';

    const title = document.createElement('h2');
    title.textContent = recipe.name || recipe.id;
    card.appendChild(title);

    const materials = document.createElement('div');
    materials.className = 'craft-materials';

    for (const [itemId, amount] of Object.entries(recipe.materials || {})) {
      const row = document.createElement('div');
      const owned = ownedAmount(itemId);
      row.className = owned >= amount ? 'craft-material enough' : 'craft-material missing';
      row.innerHTML = `<span>${itemName(itemId)} ×${amount}</span><small>${owned} / ${amount}</small>`;
      materials.appendChild(row);
    }

    card.appendChild(materials);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'craft-make-btn';
    button.textContent = '作る';
    button.disabled = !canCraft(recipe, game.inventory, null);
    button.addEventListener('click', () => {
      if (!craftRecipe(recipe, game.inventory, null)) return;
      setActiveGame(game);
      render();
    });
    card.appendChild(button);

    list.appendChild(card);
  }

  content.appendChild(list);
}

window.addEventListener('pagehide', () => setActiveGame(game));
setActiveGame(game);
render();
