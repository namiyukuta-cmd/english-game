import { getActiveGame, setActiveGame } from './save.js';
import { drawWorldMap } from './map.js';
import { markpoints } from './markpoints.js';
import { WORLD } from './world.js';

const game = getActiveGame();

if (!game) {
  location.replace('./desertsurvival_index.html');
} else {
  const canvas = document.getElementById('travelMapCanvas');
  const nameEl = document.getElementById('destinationName');
  const distanceEl = document.getElementById('destinationDistance');
  const startBtn = document.getElementById('travelStartBtn');

  let selected = null;

  function selectablePoints() {
    const discovered = new Set(
      Array.isArray(game.world?.discoveredMarkpoints)
        ? game.world.discoveredMarkpoints
        : []
    );

    return markpoints.filter(point =>
      discovered.has(point.id) || point.startingArea === true
    );
  }

  function mapMetrics() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const pad = Math.max(18, Math.min(30, width * .055));
    const mapW = Math.max(1, width - pad * 2);
    const mapH = Math.max(1, height - pad * 2);
    return {
      rect,
      width,
      height,
      pad,
      mapW,
      mapH,
      toX:x => pad + (Number(x || 0) / WORLD.width) * mapW,
      toY:z => pad + (Number(z || 0) / WORLD.height) * mapH
    };
  }

  function nearestPoint(clientX, clientY) {
    const metrics = mapMetrics();
    const x = clientX - metrics.rect.left;
    const y = clientY - metrics.rect.top;

    let best = null;
    let bestDistance = Infinity;

    for (const point of selectablePoints()) {
      const px = metrics.toX(point.x);
      const py = metrics.toY(point.z);
      const distance = Math.hypot(x - px, y - py);
      if (distance < bestDistance) {
        best = point;
        bestDistance = distance;
      }
    }

    return bestDistance <= 34 ? best : null;
  }

  function distanceTo(point) {
    return Math.hypot(
      Number(point.x) - Number(game.world.x || 0),
      Number(point.z) - Number(game.world.z || 0)
    );
  }

  function renderSelection() {
    drawWorldMap(canvas, game.world, markpoints);

    if (!selected) {
      nameEl.textContent = '地点を選択';
      distanceEl.textContent = '地図上の地点をタップしてください。';
      startBtn.disabled = true;
      return;
    }

    const distance = distanceTo(selected);
    nameEl.textContent = selected.name || selected.id;
    distanceEl.textContent = `現在地から約 ${Math.round(distance)}`;
    startBtn.disabled = distance < 1;

    const metrics = mapMetrics();
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.beginPath();
    ctx.arc(
      metrics.toX(selected.x),
      metrics.toY(selected.z),
      Math.max(10, metrics.width * .026),
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = '#fff8e7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  canvas.addEventListener('click', event => {
    selected = nearestPoint(event.clientX, event.clientY);
    renderSelection();
  });

  startBtn.addEventListener('click', () => {
    if (!selected) return;

    game.world.autoTravelTarget = {
      id:selected.id,
      name:selected.name || selected.id,
      x:Number(selected.x),
      z:Number(selected.z),
      stopDistance:Math.max(1, Number(selected.interactionRadius || 2.2))
    };

    setActiveGame(game);
    location.href = './desertsurvival_field_v2.html?v=20261002-map1';
  });

  window.addEventListener('resize', renderSelection);
  renderSelection();
}
