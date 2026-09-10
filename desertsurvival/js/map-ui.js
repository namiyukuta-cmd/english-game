import { drawWorldMap } from './map.js?v=20260910-worldmap1';
import { getActiveGame } from './save.js';
import { markpoints } from './markpoints.js';

const miniMapBtn = document.getElementById('miniMapBtn');
const worldMapCanvas = document.getElementById('worldMapCanvas');
const mapOverlay = document.getElementById('mapOverlay');

function redrawFullMap() {
  const game = getActiveGame();
  if (!game?.world || !worldMapCanvas || mapOverlay?.hidden) return;
  drawWorldMap(worldMapCanvas, game.world, markpoints);
}

if (miniMapBtn) {
  miniMapBtn.addEventListener('click', () => {
    requestAnimationFrame(() => requestAnimationFrame(redrawFullMap));
  });
}

window.addEventListener('resize', redrawFullMap);
