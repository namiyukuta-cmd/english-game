import { getActiveGame } from './save.js?v=20260910-stateprotect1';

const game = getActiveGame();

if (!game) {
  location.replace('./desertsurvival_index.html');
} else {
  await import('./field3d.js?v=20260911-oasis1');
  await import('./field-ui.js?v=20260910-fieldlayout1');
  await import('./map-ui.js?v=20260910-worldmap1');
  await import('./hotbar.js?v=20260910-inventorylayout1');
}
