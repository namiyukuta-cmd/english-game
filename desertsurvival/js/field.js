import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

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

/* ------------------------------
   Three.js / 3D world
------------------------------ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec6dc);
scene.fog = new THREE.Fog(0xc9b98f, 70, 380);

const renderer = new THREE.WebGLRenderer({
  canvas: worldCanvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 650);
camera.position.set(game.world.x, 6.4, game.world.z + 10.5);

const hemiLight = new THREE.HemisphereLight(0xd8ebff, 0x7f5d31, 2.0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffefc7, 2.4);
sunLight.position.set(80, 120, 40);
scene.add(sunLight);

const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xc9ad78 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.03;
scene.add(ground);

function makePlayerModel() {
  const group = new THREE.Group();

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.78, 1.78, 7),
    new THREE.MeshLambertMaterial({ color: 0x2f302b })
  );
  robe.position.y = 0.94;
  group.add(robe);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.49, 14, 10),
    new THREE.MeshLambertMaterial({ color: 0xb88459 })
  );
  head.position.y = 2.18;
  group.add(head);

  const faceMark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.20, 0.16),
    new THREE.MeshBasicMaterial({ color: 0xe4c39b, side: THREE.DoubleSide })
  );
  faceMark.position.set(0, 2.15, -0.47);
  group.add(faceMark);

  group.userData.robe = robe;
  group.userData.head = head;
  return group;
}

const playerModel = makePlayerModel();
playerModel.position.set(game.world.x, 0, game.world.z);
scene.add(playerModel);

const duneGeometry = new THREE.SphereGeometry(1, 10, 6);
const duneMaterialA = new THREE.MeshLambertMaterial({ color: 0xd7bd88 });
const duneMaterialB = new THREE.MeshLambertMaterial({ color: 0xc5a56c });
const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x725f49 });
const scrubGeometry = new THREE.ConeGeometry(0.35, 1.25, 5);
const scrubMaterial = new THREE.MeshLambertMaterial({ color: 0x756b3d });

const CHUNK_SIZE = 120;
const CHUNK_RADIUS = 2;
const chunks = new Map();

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

function createChunk(cx, cz) {
  const random = mulberry32(hashSeed(cx, cz));
  const group = new THREE.Group();
  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  const duneCount = 5 + Math.floor(random() * 5);
  for (let i = 0; i < duneCount; i++) {
    const dune = new THREE.Mesh(duneGeometry, random() > 0.45 ? duneMaterialA : duneMaterialB);
    dune.position.set(
      baseX + random() * CHUNK_SIZE,
      0.35 + random() * 0.65,
      baseZ + random() * CHUNK_SIZE
    );
    dune.scale.set(5 + random() * 12, 0.7 + random() * 1.5, 6 + random() * 14);
    dune.rotation.y = random() * Math.PI;
    group.add(dune);
  }

  const rockCount = 3 + Math.floor(random() * 5);
  for (let i = 0; i < rockCount; i++) {
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    const s = 0.35 + random() * 1.35;
    rock.scale.set(s * (0.8 + random() * 0.9), s, s * (0.8 + random() * 0.9));
    rock.position.set(
      baseX + random() * CHUNK_SIZE,
      s * 0.65,
      baseZ + random() * CHUNK_SIZE
    );
    rock.rotation.set(random() * 0.6, random() * Math.PI, random() * 0.4);
    group.add(rock);
  }

  const scrubCount = Math.floor(random() * 4);
  for (let i = 0; i < scrubCount; i++) {
    const scrub = new THREE.Mesh(scrubGeometry, scrubMaterial);
    scrub.position.set(
      baseX + random() * CHUNK_SIZE,
      0.60,
      baseZ + random() * CHUNK_SIZE
    );
    scrub.rotation.z = (random() - 0.5) * 0.35;
    group.add(scrub);
  }

  scene.add(group);
  chunks.set(`${cx},${cz}`, group);
}

function updateChunks() {
  const centerCX = Math.floor(game.world.x / CHUNK_SIZE);
  const centerCZ = Math.floor(game.world.z / CHUNK_SIZE);
  const needed = new Set();

  for (let dz = -CHUNK_RADIUS; dz <= CHUNK_RADIUS; dz++) {
    for (let dx = -CHUNK_RADIUS; dx <= CHUNK_RADIUS; dx++) {
      const cx = centerCX + dx;
      const cz = centerCZ + dz;
      const key = `${cx},${cz}`;
      needed.add(key);
      if (!chunks.has(key)) createChunk(cx, cz);
    }
  }

  for (const [key, group] of chunks) {
    if (!needed.has(key)) {
      scene.remove(group);
      chunks.delete(key);
    }
  }
}

const sandParticleCount = 420;
const sandPositions = new Float32Array(sandParticleCount * 3);
for (let i = 0; i < sandParticleCount; i++) {
  sandPositions[i * 3] = (Math.random() - 0.5) * 70;
  sandPositions[i * 3 + 1] = Math.random() * 18;
  sandPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
}
const sandParticleGeometry = new THREE.BufferGeometry();
sandParticleGeometry.setAttribute('position', new THREE.BufferAttribute(sandPositions, 3));
const sandParticles = new THREE.Points(
  sandParticleGeometry,
  new THREE.PointsMaterial({ color: 0xe5c58e, size: 0.18, transparent: true, opacity: 0.52 })
);
sandParticles.visible = false;
scene.add(sandParticles);

let inputX = 0;
let inputY = 0;
let joystickPointerId = null;
let lastFrame = performance.now();
let timeAccumulator = 0;
let saveAccumulator = 0;
let cameraYaw = Math.PI;
let walkPhase = 0;
let lastChunkX = null;
let lastChunkZ = null;

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

function resize3D() {
  const rect = worldCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
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
  }
}

function colorForTime() {
  const hour = Number(game.time.hour || 0) + Number(game.time.minute || 0) / 60;
  const night = new THREE.Color(0x172033);
  const dawn = new THREE.Color(0xb88467);
  const day = new THREE.Color(0x9ec6dc);
  const dusk = new THREE.Color(0xb26e55);

  if (hour < 5) return night;
  if (hour < 7) return dawn.clone().lerp(day, (hour - 5) / 2);
  if (hour < 17) return day;
  if (hour < 19) return day.clone().lerp(dusk, (hour - 17) / 2);
  if (hour < 21) return dusk.clone().lerp(night, (hour - 19) / 2);
  return night;
}

function updateEnvironment() {
  const sky = colorForTime();
  const storm = game.weather.type === 'sandstorm';
  scene.background.copy(storm ? sky.clone().lerp(new THREE.Color(0xa98555), 0.52) : sky);

  if (storm) {
    scene.fog.color.set(0xb49569);
    scene.fog.near = 16;
    scene.fog.far = 120;
    sandParticles.visible = true;
  } else {
    scene.fog.color.copy(sky.clone().lerp(new THREE.Color(0xc9ad78), 0.48));
    scene.fog.near = 72;
    scene.fog.far = 380;
    sandParticles.visible = false;
  }

  const hour = Number(game.time.hour || 0) + Number(game.time.minute || 0) / 60;
  const daylight = Math.max(0.12, Math.sin(((hour - 6) / 12) * Math.PI));
  hemiLight.intensity = 0.45 + daylight * 1.55;
  sunLight.intensity = 0.20 + daylight * 2.35;

  const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
  sunLight.position.set(
    playerModel.position.x + Math.cos(sunAngle) * 100,
    18 + Math.max(0, Math.sin(sunAngle)) * 115,
    playerModel.position.z + Math.sin(sunAngle) * 80
  );
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
  updateEnvironment();
}

function shortestAngle(from, to) {
  let delta = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function updateMovement(dt) {
  if (!mapOverlay.hidden) return false;

  const magnitude = Math.hypot(inputX, inputY);
  if (magnitude <= 0.05) return false;

  const nx = inputX / magnitude;
  const ny = inputY / magnitude;

  // カメラから主人公へ向かう方向が、画面上の「前」。
  const forwardX = -Math.sin(cameraYaw);
  const forwardZ = -Math.cos(cameraYaw);
  const rightX = Math.cos(cameraYaw);
  const rightZ = -Math.sin(cameraYaw);

  let moveX = forwardX * -ny + rightX * nx;
  let moveZ = forwardZ * -ny + rightZ * nx;
  const moveLen = Math.hypot(moveX, moveZ) || 1;
  moveX /= moveLen;
  moveZ /= moveLen;

  const speed = game.world.running ? 28 : 15;
  const movement = moveWorldPosition(game.world, moveX * speed * dt, moveZ * speed * dt);
  timeAccumulator += movement.gameMinutes;

  playerModel.position.x = game.world.x;
  playerModel.position.z = game.world.z;

  const targetHeading = Math.atan2(moveX, moveZ);
  playerModel.rotation.y += shortestAngle(playerModel.rotation.y, targetHeading) * Math.min(1, dt * 10);
  cameraYaw += shortestAngle(cameraYaw, targetHeading + Math.PI) * Math.min(1, dt * 2.6);

  walkPhase += dt * (game.world.running ? 11 : 7);
  playerModel.userData.robe.position.y = 0.94 + Math.sin(walkPhase * 2) * 0.035;
  playerModel.userData.head.position.y = 2.18 + Math.abs(Math.sin(walkPhase)) * 0.045;

  updateNearbyPoint();
  renderMaps();
  return true;
}

function updateCamera(dt) {
  const distance = 8.6;
  const desiredX = playerModel.position.x + Math.sin(cameraYaw) * distance;
  const desiredZ = playerModel.position.z + Math.cos(cameraYaw) * distance;
  const desiredY = 5.4;
  const smoothing = 1 - Math.pow(0.001, dt);

  camera.position.x += (desiredX - camera.position.x) * smoothing;
  camera.position.y += (desiredY - camera.position.y) * smoothing;
  camera.position.z += (desiredZ - camera.position.z) * smoothing;
  camera.lookAt(playerModel.position.x, 1.15, playerModel.position.z);

  ground.position.x = playerModel.position.x;
  ground.position.z = playerModel.position.z;

  if (sandParticles.visible) {
    sandParticles.position.set(playerModel.position.x, 0, playerModel.position.z);
    sandParticles.rotation.y += dt * 0.8;
    const positions = sandParticleGeometry.attributes.position.array;
    for (let i = 0; i < sandParticleCount; i++) {
      positions[i * 3] += dt * 8.5;
      positions[i * 3 + 1] += Math.sin(performance.now() * 0.002 + i) * dt * 0.12;
      if (positions[i * 3] > 35) positions[i * 3] = -35;
    }
    sandParticleGeometry.attributes.position.needsUpdate = true;
  }
}

function maybeUpdateChunks() {
  const cx = Math.floor(game.world.x / CHUNK_SIZE);
  const cz = Math.floor(game.world.z / CHUNK_SIZE);
  if (cx !== lastChunkX || cz !== lastChunkZ) {
    lastChunkX = cx;
    lastChunkZ = cz;
    updateChunks();
  }
}

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;

  updateMovement(dt);
  updateCamera(dt);
  maybeUpdateChunks();

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

  renderer.render(scene, camera);
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

function startRun(event) {
  event.preventDefault();
  game.world.running = true;
  runBtn.textContent = 'RUNNING';
}
function stopRun() {
  game.world.running = false;
  runBtn.textContent = 'RUN';
}
runBtn.addEventListener('pointerdown', startRun);
runBtn.addEventListener('pointerup', stopRun);
runBtn.addEventListener('pointercancel', stopRun);
runBtn.addEventListener('pointerleave', event => {
  if (event.buttons === 0) stopRun();
});

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

window.addEventListener('resize', () => {
  resize3D();
  renderHud();
  renderMaps();
});
window.addEventListener('pagehide', () => setActiveGame(game));

resize3D();
renderHud();
updateNearbyPoint();
renderMaps();
updateChunks();
updateEnvironment();
updateCamera(1);
requestAnimationFrame(frame);
