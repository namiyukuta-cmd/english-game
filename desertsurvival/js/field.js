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
let playerDirection = 0;
let walkPhase = 0;

const VIEW_SCALE = 1.0;
const CHUNK_SIZE = 280;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(x, z) {
  let h = Math.imul((x | 0) ^ 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul((z | 0) ^ 0xc2b2ae35, 0x27d4eb2d);
  h ^= h >>> 16;
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const pixelWidth = Math.max(1, Math.floor(width * dpr));
  const pixelHeight = Math.max(1, Math.floor(height * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return { ctx, width, height };
}

function hudBar(label, value, suffix = '') {
  const safe = clamp(Number(value || 0), 0, 100);
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

function renderMaps() {
  drawMiniMap(miniMapCanvas, game.world, markpoints);
  if (!mapOverlay.hidden) drawWorldMap(worldMapCanvas, game.world, markpoints);
}

function updateNearbyPoint() {
  const point = getNearbyMarkpoint(game.world, markpoints);
  interactBtn.disabled = !point;
  interactBtn.title = point?.name || '';

  if (point && !game.world.discoveredMarkpoints.includes(point.id)) {
    game.world.discoveredMarkpoints.push(point.id);
    renderMaps();
  }
}

function worldToScreen(worldX, worldZ, width, height) {
  const playerScreenX = width * 0.5;
  const playerScreenY = height * 0.56;
  return {
    x: playerScreenX + (worldX - game.world.x) * VIEW_SCALE,
    y: playerScreenY + (worldZ - game.world.z) * VIEW_SCALE
  };
}

function drawDune(ctx, x, y, radius, rotation, shade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(1.9, 0.72);
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(115,83,43,.16)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.08, radius * 0.72, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();
  ctx.restore();
}

function drawRock(ctx, x, y, radius, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = '#75604a';
  ctx.strokeStyle = 'rgba(55,43,32,.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (Math.PI * 2 * i) / 7;
    const r = radius * (i % 2 ? 0.82 : 1.08);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawScrub(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#75683f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChunkDecorations(ctx, cx, cz, width, height) {
  const random = mulberry32(hashSeed(cx, cz));
  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  const duneCount = 4 + Math.floor(random() * 5);
  for (let i = 0; i < duneCount; i++) {
    const wx = baseX + random() * CHUNK_SIZE;
    const wz = baseZ + random() * CHUNK_SIZE;
    const p = worldToScreen(wx, wz, width, height);
    const radius = 14 + random() * 24;
    if (p.x < -90 || p.x > width + 90 || p.y < -60 || p.y > height + 60) continue;
    drawDune(ctx, p.x, p.y, radius, random() * Math.PI, random() > 0.5 ? '#d4bd8f' : '#cbb181');
  }

  const rockCount = 2 + Math.floor(random() * 5);
  for (let i = 0; i < rockCount; i++) {
    const wx = baseX + random() * CHUNK_SIZE;
    const wz = baseZ + random() * CHUNK_SIZE;
    const p = worldToScreen(wx, wz, width, height);
    const radius = 5 + random() * 11;
    if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) continue;
    drawRock(ctx, p.x, p.y, radius, random() * Math.PI);
  }

  const scrubCount = Math.floor(random() * 4);
  for (let i = 0; i < scrubCount; i++) {
    const wx = baseX + random() * CHUNK_SIZE;
    const wz = baseZ + random() * CHUNK_SIZE;
    const p = worldToScreen(wx, wz, width, height);
    if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) continue;
    drawScrub(ctx, p.x, p.y, 6 + random() * 7);
  }
}

function drawMarkpoints(ctx, width, height) {
  for (const point of markpoints) {
    if (!Number.isFinite(Number(point.x)) || !Number.isFinite(Number(point.z))) continue;

    const p = worldToScreen(Number(point.x), Number(point.z), width, height);
    if (p.x < -70 || p.x > width + 70 || p.y < -70 || p.y > height + 70) continue;

    const type = point.type || '';
    if (type === 'water') {
      ctx.fillStyle = '#527d8c';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 22, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,245,245,.55)';
      ctx.stroke();
    } else if (type === 'town') {
      ctx.fillStyle = '#8b6844';
      ctx.fillRect(p.x - 20, p.y - 17, 40, 34);
      ctx.fillStyle = '#6f5137';
      ctx.beginPath();
      ctx.moveTo(p.x - 24, p.y - 17);
      ctx.lineTo(p.x, p.y - 34);
      ctx.lineTo(p.x + 24, p.y - 17);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'camp') {
      ctx.fillStyle = '#72594a';
      ctx.beginPath();
      ctx.moveTo(p.x - 19, p.y + 13);
      ctx.lineTo(p.x, p.y - 20);
      ctx.lineTo(p.x + 19, p.y + 13);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#594c3c';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    const discovered = game.world.discoveredMarkpoints.includes(point.id);
    if (discovered || Math.hypot(Number(point.x) - game.world.x, Number(point.z) - game.world.z) < 95) {
      ctx.fillStyle = 'rgba(44,35,26,.82)';
      ctx.font = '600 12px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.name || point.id || '', p.x, p.y - 42);
    }
  }
}

function drawPlayer(ctx, width, height, moving) {
  const x = width * 0.5;
  const y = height * 0.56;
  const bob = moving ? Math.sin(walkPhase) * 1.5 : 0;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(playerDirection);

  ctx.fillStyle = 'rgba(61,48,33,.18)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 17, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#37342d';
  ctx.beginPath();
  ctx.moveTo(-11, 16);
  ctx.lineTo(-9, -7);
  ctx.quadraticCurveTo(0, -14, 9, -7);
  ctx.lineTo(11, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b98a61';
  ctx.beginPath();
  ctx.arc(0, -15, 9, 0, Math.PI * 2);
  ctx.fill();

  // 向いている方向を示す小さな布。
  ctx.fillStyle = '#e4c39b';
  ctx.beginPath();
  ctx.moveTo(-3, -24);
  ctx.lineTo(3, -24);
  ctx.lineTo(0, -30);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function timeTint() {
  const hour = Number(game.time.hour || 0) + Number(game.time.minute || 0) / 60;
  if (hour >= 7 && hour < 17) return null;
  if (hour >= 5 && hour < 7) return 'rgba(181,111,76,.10)';
  if (hour >= 17 && hour < 19.5) return 'rgba(154,78,59,.16)';
  return 'rgba(17,29,53,.46)';
}

function drawSandstorm(ctx, width, height, now) {
  if (game.weather.type !== 'sandstorm') return;

  ctx.fillStyle = 'rgba(148,112,65,.25)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(246,226,181,.34)';
  ctx.lineWidth = 2;

  for (let i = 0; i < 34; i++) {
    const y = (i * 53 + now * 0.07) % (height + 100) - 50;
    const x = ((i * 91 + now * 0.10) % (width + 180)) - 90;
    ctx.beginPath();
    ctx.moveTo(x - 34, y + 14);
    ctx.lineTo(x + 38, y - 14);
    ctx.stroke();
  }
}

function drawField(now = performance.now()) {
  const { ctx, width, height } = fitCanvas(worldCanvas);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#c8ae7d';
  ctx.fillRect(0, 0, width, height);

  const marginWorldX = width / (2 * VIEW_SCALE) + CHUNK_SIZE;
  const marginWorldZ = height / (2 * VIEW_SCALE) + CHUNK_SIZE;
  const minCX = Math.floor((game.world.x - marginWorldX) / CHUNK_SIZE);
  const maxCX = Math.floor((game.world.x + marginWorldX) / CHUNK_SIZE);
  const minCZ = Math.floor((game.world.z - marginWorldZ) / CHUNK_SIZE);
  const maxCZ = Math.floor((game.world.z + marginWorldZ) / CHUNK_SIZE);

  for (let cz = minCZ; cz <= maxCZ; cz++) {
    for (let cx = minCX; cx <= maxCX; cx++) {
      drawChunkDecorations(ctx, cx, cz, width, height);
    }
  }

  drawMarkpoints(ctx, width, height);

  const moving = Math.hypot(inputX, inputY) > 0.05 && mapOverlay.hidden;
  drawPlayer(ctx, width, height, moving);

  const tint = timeTint();
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, width, height);
  }

  drawSandstorm(ctx, width, height, now);
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

function updateMovement(dt) {
  if (!mapOverlay.hidden) return;

  const magnitude = Math.hypot(inputX, inputY);
  if (magnitude <= 0.05) return;

  const nx = inputX / magnitude;
  const nz = inputY / magnitude;
  const speed = game.world.running ? 132 : 76;
  const movement = moveWorldPosition(game.world, nx * speed * dt, nz * speed * dt);

  if (movement.moved > 0) {
    playerDirection = Math.atan2(nx, -nz);
    walkPhase += dt * (game.world.running ? 13 : 8);
    timeAccumulator += movement.gameMinutes;
    updateNearbyPoint();
    renderMaps();
  }
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;

  updateMovement(dt);
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

  drawField(now);
  requestAnimationFrame(frame);
}

function setJoystickFromEvent(event) {
  const rect = movePad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const max = Math.max(20, rect.width * 0.32);
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

function stopRunning() {
  game.world.running = false;
  runBtn.textContent = 'RUN';
}

runBtn.addEventListener('pointerdown', () => {
  game.world.running = true;
  runBtn.textContent = 'RUNNING';
});
runBtn.addEventListener('pointerup', stopRunning);
runBtn.addEventListener('pointercancel', stopRunning);
runBtn.addEventListener('pointerleave', stopRunning);

miniMapBtn.addEventListener('click', () => {
  inputX = 0;
  inputY = 0;
  moveKnob.style.transform = 'translate(0,0)';
  stopRunning();
  mapOverlay.hidden = false;
  drawWorldMap(worldMapCanvas, game.world, markpoints);
});

closeMapBtn.addEventListener('click', () => {
  mapOverlay.hidden = true;
});

itemBtn.addEventListener('click', () => {
  setActiveGame(game);
  location.href = './desertsurvival_menu.html';
});

interactBtn.addEventListener('click', () => {
  const point = getNearbyMarkpoint(game.world, markpoints);
  if (!point) return;
  alert(point.name || '地点');
});

window.addEventListener('resize', () => {
  renderHud();
  renderMaps();
  drawField();
});
window.addEventListener('pagehide', () => setActiveGame(game));

renderHud();
updateNearbyPoint();
renderMaps();
drawField();
requestAnimationFrame(frame);
