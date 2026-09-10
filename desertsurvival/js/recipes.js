import { addItem, countItem, removeItem } from './items.js';

// クラフトレシピ。
// materials は消費する材料。
// station は必要な設備。null はどこでも作れる。
export const recipes = Object.freeze([
  {
    id: 'campfire',
    name: '焚き火',
    result: { itemId: 'campfire', amount: 1 },
    materials: {
      dry_branch: 4,
      stone: 2
    },
    station: null
  }
]);

export function getRecipeById(recipeId) {
  return recipes.find(recipe => recipe.id === recipeId) || null;
}

export function canCraft(recipe, inventory, availableStation = null) {
  if (!recipe?.materials || !recipe?.result?.itemId) return false;

  if (recipe.station && recipe.station !== availableStation) return false;

  return Object.entries(recipe.materials).every(([itemId, amount]) => {
    return countItem(inventory, itemId) >= Number(amount || 0);
  });
}

export function craftRecipe(recipe, inventory, availableStation = null) {
  if (!canCraft(recipe, inventory, availableStation)) return false;

  for (const [itemId, amount] of Object.entries(recipe.materials)) {
    removeItem(inventory, itemId, amount);
  }

  addItem(inventory, recipe.result.itemId, recipe.result.amount || 1);
  return true;
}
