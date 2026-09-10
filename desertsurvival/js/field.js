import { getActiveGame, setActiveGame, createNewGameState } from './save.js';
import { normalizePlayer, advancePlayer } from './player.js';
import { advanceTime, TIME_SCALE, formatTime } from './time.js';
import { getAmbientTemperature } from './temperature.js';
import { updateWeather } from './weather.js';
import { moveWorldPosition } from './world.js';
import { markpoints } from './markpoints.js';
import { getNearbyMarkpoint } from './markpoint-common.js';
import { drawMiniMap, drawWorldMap } from './map.js';
import { drawClock } from './clock.js';

const worldCanvas = document.getElementById('worldCanvas');
const playerHud = document.getElementById('playerHud');
const miniMapCanvas = document.getElementById('miniMapCanvas');
const miniMapBtn = document.getElementById('miniMapBtn');
const mapOverlay = document.getElementById('mapOverlay');
const closeMapBtn = document.getElementById('closeMapBtn');
const worldMapCanvas = document.getElementById('worldMapCanvas');
const interactBtn = document.getElementById('interactBtn');
const itemBtn = document.getElementById('itemBtn');
const runBtn = document.getElementById('runBtn');
const movePad = document.getElementById('movePad');
const moveKnob = document.getElementById('moveKnob');

let game = getActiveGame() || createNewGameState();
normalizePlayer(game.player);
setActiveGame(game);

let inputX = 0;
let inputY = 0;
let joystickPointerId = null;
let lastFrame = performance.now();
let timeAccumulator = 0;
let saveAccumulator = 0;

function hudBar(label, value, suffix = '') {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  return `<div class="hud-row"><b>${label}</b><span class="hud-bar"><i style="width:${safe}%"></i></span><span>${Math.round(value)}${suffix}</span></div>`;
}

function renderHud() {
  const ambient = getAmbientTemperature(game.time, game.weather.type);
  const statuses = game.player.status?.length ? game.player.status.join(' / ') : '正常';
  playerHud.innerHTML = `
    ${hudBar('体力', game.player.health)}
    ${hudBar('水', game.player.water)}
    ${hudBar('食', game.player.food)}
    ${hudBar('睡眠', game.player.sleep)}
    <div class="hud-row"><b>体温</b><span>${game.player.bodyTemp.toFixed(1)}℃</span><span></span></div>
    <div class="hud-row"><b>外気</b><span>${ambient.toFixed(1)}℃</span><span></span></div>
    <div class="hud-row"><b>状態</b><span>${statuses}</span><span></span></div>
    <div class="hud-clock-row"><canvas id="clockCanvas" width="84" height="84"></canvas><span>${formatTime(game.time)}</span></div>
  `;
  const clockCanvas = document.getElementById('clockCanvas');
  if (clockCanvas) {
    clockCanvas.style.width = '72px';
    clockCanvas.style.height = '72px';
    drawClock(clockCanvas, game.time);
  }
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawField() {
  const { ctx, width, height } = fitCanvas(worldCanvas);
  const storm = game.weather.type === 'sandstorm';
  const hour = Number(game.time.hour || 0) + Number(game.time.minute || 0) / 60;
  const dayLight = hour >= 6 && hour < 18;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = dayLight ? '#bda77c' : '#5a5142';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = dayLight ? '#d8c59e' : '#6a604f';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.58);
  ctx.quadraticCurveTo(width * 0.28, height * 0.45, width * 0.55, height * 0.58);
  ctx.quadraticCurveTo(width * 0.78, height * 0.68, width, height * 0.52);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3d352a';
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.68, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(width / 2 - 8, height * 0.68 + 9, 16, 30);

  if (storm) {
    ctx.fillStyle = 'rgba(160,130,82,.36)';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(245,225,180,.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 28; i++) {
      const y = (i * 61 + performance.now() * 0.04) % height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y - 70);
      ctx.stroke();
    }
  }
}

function renderMaps() {
  drawMiniMap(miniMapCanvas, game.world, markpoints);
  if (!mapOverlay.hidden) drawWorldMap(worldMapCanvas, game.world, markpoints);
}

function updateNearbyPoint() {
  const point = getNearbyMarkpoint(game.world, markpoints);
  interactBtn.disabled = !point;
  interactBtn.textContent = point ? '調べる' : '調べる';
  interactBtn.title = point?.name || '';
  if (point && !game.world.discoveredMarkpoints.includes(point.id)) {
    game.world.discoveredMarkpoints.push(point.id);
  }
}

function gameMinuteTick() {
  advanceTime(game.time, 1);
  updateWeather(game.weather, game.time);
  const ambientTemp = getAmbientTemperature(game.time, game.weather.type);
  advancePlayer(game.player, {
    ambientTemp,
    weather: game.weather.type,
    running: game.world.running,
    sheltered: game.world.sheltered
  }, 1);
  renderHud();
  renderMaps();
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;

  if (mapOverlay.hidden) {
    const length = Math.hypot(inputX, inputY) || 1;
    const ix = inputX / length;
    const iy = inputY / length;
    const speed = game.world.running ? 140 : 78;
    if (Math.hypot(inputX, inputY) > 0.05) {
      const movement = moveWorldPosition(game.world, ix * speed * dt, iy * speed * dt);
      timeAccumulator += movement.gameMinutes;
      updateNearbyPoint();
      renderMaps();
    }
  }

  timeAccumulator += dt * (1000 / TIME_SCALE.realMillisecondsPerGameMinute);
  while (timeAccumulator >= 1) {
    gameMinuteTick();
    timeAccumulator -= 1;
  }

  saveAccumulator += dt;
  if (saveAccumulator >= 3) {
    setActiveGame(game);
    saveAccumulator = 0;
  }

  drawField();
  requestAnimationFrame(frame);
}

function setJoystickFromEvent(event) {
  const rect = movePad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const max = rect.width * 0.32;
  let dx = event.clientX - cx;
  let dy = event.clientY - cy;
  const distance = Math.hypot(dx, dy);
  if (distance > max) {
    dx = dx / distance * max;
    dy = dy / distance * max;
  }
  inputX = dx / max;
  inputY = dy / max;
  moveKnob.style.transform = `translate(${dx}px,${dy}px)`;
}

movePad.addEventListener('pointerdown', event => {
  joystickPointerId = event.pointerId;
  movePad.setPointerCapture(event.pointerId);
  setJoystickFromEvent(event);
});
movePad.addEventListener('pointermove', event => {
  if (event.pointerId === joystickPointerId) setJoystickFromEvent(event);
});
function releaseJoystick(event) {
  if (joystickPointerId !== null && event.pointerId !== joystickPointerId) return;
  joystickPointerId = null;
  inputX = 0;
  inputY = 0;
  moveKnob.style.transform = 'translate(0,0)';
}
movePad.addEventListener('pointerup', releaseJoystick);
movePad.addEventListener('pointercancel', releaseJoystick);

runBtn.addEventListener('pointerdown', () => { game.world.running = true; runBtn.textContent = 'RUNNING'; });
runBtn.addEventListener('pointerup', () => { game.world.running = false; runBtn.textContent = 'RUN'; });
runBtn.addEventListener('pointercancel', () => { game.world.running = false; runBtn.textContent = 'RUN'; });

miniMapBtn.addEventListener('click', () => {
  mapOverlay.hidden = false;
  drawWorldMap(worldMapCanvas, game.world, markpoints);
});
closeMapBtn.addEventListener('click', () => { mapOverlay.hidden = true; });
itemBtn.addEventListener('click', () => {
  setActiveGame(game);
  location.href = './desertsurvival_menu.html';
});
interactBtn.addEventListener('click', () => {
  const point = getNearbyMarkpoint(game.world, markpoints);
  if (!point) return;
  alert(point.name || '地点');
});

window.addEventListener('resize', () => { renderHud(); renderMaps(); });
window.addEventListener('pagehide', () => setActiveGame(game));

renderHud();
updateNearbyPoint();
renderMaps();
requestAnimationFrame(frame);
