// 作れる物。材料・必要数・完成品をここへ追加していく。
export const recipes = [];

export function canCraft(recipe, inventory) {
  if (!recipe?.materials) return false;
  return Object.entries(recipe.materials).every(([itemId, amount]) => {
    const owned = inventory
      .filter(item => item.id === itemId)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return owned >= amount;
  });
}
