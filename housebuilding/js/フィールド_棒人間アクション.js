// 棒人間オートアクション試作。
// ブラウザ履歴・オートセーブは使わない。
// 探索5/8の中で、ジャンプ回避・空中射撃・ダッシュ・近接斬撃を自動再生する。

const fieldTop = document.getElementById('fieldTop');
const fieldView = document.getElementById('fieldView');
const fieldPanel = document.getElementById('fieldPanel');
const fieldBottom = document.getElementById('fieldBottom');

const state = {
  hp: 88,
  maxHp: 100,
  food: 74,
  arrows: 12,
  herb: 3,
  potion: 1,
  bread: 2,
  rope: 1,
  keys: 1,
  axe: 1,
  x: 12,
  y: 18,
  enemyX: 62,
  enemyY: 18,
  enemyHp: 100,
  enemyMaxHp: 100,
  enemyAlive: true,
  doorLocked: true,
  status: '探索開始'
};

const rows = [
  { y: 18, dir: 'right' },
  { y: 50, dir: 'left' },
  { y: 82, dir: 'right' }
];

fieldTop.innerHTML = `
  <div class="topMenuRow">
    <strong class="topPlace">森・棒人間アクション試作</strong>
    <button id="fieldLog" class="topMenuButton" type="button">LOG</button>
    <button id="fieldSave" class="topMenuButton" type="button">SAVE</button>
    <button id="fieldMenu" class="topMenuButton" type="button">MENU</button>
  </div>
`;

fieldView.innerHTML = `
  <button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button>
  <div id="dungeonMessage" class="dungeonMessage">自動探索を開始します</div>
  <div id="dungeonViewport" class="dungeonViewport">
    <div id="dungeonWorld" class="dungeonWorld"></div>
    <div id="screenFlash" class="screenFlash"></div>
  </div>
`;

fieldPanel.innerHTML = `
  <div class="panelStatus">
    <div class="hpWrap">
      <span id="hpText" class="hpText"></span>
      <div class="hpBar"><div id="hpFill" class="hpFill"></div></div>
    </div>
    <span id="foodValue" class="foodValue"></span>
  </div>
  <div class="slotLine">
    <div class="slotLabel">持ち物</div>
    <div id="inventoryGrid" class="slotGrid" aria-label="持ち物"></div>
  </div>
  <div class="slotLine">
    <div class="slotLabel">装備<br>スキル</div>
    <div id="abilityGrid" class="slotGrid" aria-label="装備とスキル"></div>
  </div>
`;

fieldBottom.innerHTML = `
  <span id="exploreState">探索中</span>
  <span id="ammoState">弾 0/20</span>
  <span id="conditionState">状態：正常</span>
`;

const viewport = document.getElementById('dungeonViewport');
const world = document.getElementById('dungeonWorld');
const message = document.getElementById('dungeonMessage');
const screenFlash = document.getElementById('screenFlash');
const inventoryGrid = document.getElementById('inventoryGrid');
const abilityGrid = document.getElementById('abilityGrid');

function makeFloor(row) {
  const floor = document.createElement('div');
  floor.className = 'dungeonFloor';
  floor.style.top = `${row.y}%`;
  const hint = document.createElement('span');
  hint.className = `floorHint ${row.dir}`;
  hint.textContent = row.dir === 'right' ? '→ AUTO' : 'AUTO ←';
  floor.appendChild(hint);
  world.appendChild(floor);
}
rows.forEach(makeFloor);

function makeLadder(x, fromY, toY) {
  const ladder = document.createElement('div');
  ladder.className = 'dungeonLadder';
  ladder.style.left = `${x}%`;
  ladder.style.top = `${fromY}%`;
  ladder.style.height = `${toY - fromY}%`;
  world.appendChild(ladder);
}
makeLadder(86, 18, 50);
makeLadder(12, 50, 82);

const door = document.createElement('div');
door.className = 'dungeonDoor';
door.style.left = '48%';
door.style.top = '50%';
door.textContent = '鍵扉';
world.appendChild(door);

const goal = document.createElement('div');
goal.className = 'dungeonGoal';
goal.style.left = '88%';
goal.style.top = '82%';
goal.textContent = '到達点';
world.appendChild(goal);

function createStick(extraClass = '') {
  const el = document.createElement('div');
  el.className = `stick ${extraClass}`.trim();
  el.innerHTML = `
    <span class="head"></span>
    <span class="body"></span>
    <span class="arm left"></span>
    <span class="arm right"></span>
    <span class="leg left"></span>
    <span class="leg right"></span>
    <span class="weapon"></span>
  `;
  world.appendChild(el);
  return el;
}

const player = createStick('playerStick');
const enemy = createStick('enemyStick');
const enemyHp = document.createElement('div');
enemyHp.className = 'enemyHp';
enemyHp.innerHTML = '<div id="enemyHpFill" class="enemyHpFill"></div>';
enemy.appendChild(enemyHp);

enemy.style.left = `${state.enemyX}%`;
enemy.style.top = `${state.enemyY}%`;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function centerViewportOn(y) {
  const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const raw = (y / 100) * world.scrollHeight - viewport.clientHeight * 0.46;
  viewport.scrollTop = Math.max(0, Math.min(maxScroll, raw));
}

function setPlayer(x, y) {
  state.x = x;
  state.y = y;
  player.style.left = `${x}%`;
  player.style.top = `${y}%`;
  centerViewportOn(y);
}

function setEnemy(x, y = state.enemyY) {
  state.enemyX = x;
  state.enemyY = y;
  enemy.style.left = `${x}%`;
  enemy.style.top = `${y}%`;
}

function setMessage(text) {
  state.status = text;
  message.textContent = text;
  document.getElementById('exploreState').textContent = text;
}

function renderStatus() {
  document.getElementById('hpText').textContent = `HP ${state.hp}/${state.maxHp}`;
  document.getElementById('hpFill').style.width = `${(state.hp / state.maxHp) * 100}%`;
  document.getElementById('foodValue').textContent = `🍖 ${state.food}`;
  document.getElementById('ammoState').textContent = `弾 ${state.arrows}/20`;
}

function renderInventory() {
  inventoryGrid.innerHTML = '';
  const items = [
    ['🌿', '薬草', state.herb],
    ['🧴', '回復薬', state.potion],
    ['🍞', 'パン', state.bread],
    ['🏹', '矢', state.arrows],
    ['🪢', 'ロープ', state.rope],
    ['🗝️', '鍵', state.keys],
    ['🪓', '斧', state.axe]
  ];
  for (let i = 0; i < 8; i++) {
    const slot = document.createElement('div');
    slot.className = 'squareSlot';
    const item = items[i];
    if (!item) {
      slot.classList.add('empty');
    } else {
      slot.innerHTML = `<span class="slotIcon">${item[0]}</span><span class="slotName">${item[1]}</span><span class="itemCount">${item[2]}</span>`;
    }
    inventoryGrid.appendChild(slot);
  }
}

function renderAbilities(active = '') {
  abilityGrid.innerHTML = '';
  const abilities = [
    ['🗡️', '短剣'],
    ['🏹', '弓'],
    ['🛡️', '革鎧'],
    ['＋', '応急処置'],
    ['🌱', '採取'],
    ['!', '危険察知']
  ];
  for (let i = 0; i < 7; i++) {
    const slot = document.createElement('div');
    slot.className = 'squareSlot skillSlot';
    const ability = abilities[i];
    if (!ability) {
      slot.classList.add('empty');
    } else {
      if (ability[1] === active) slot.style.outline = '2px solid #6f675c';
      slot.innerHTML = `<span class="slotIcon">${ability[0]}</span><span class="slotName">${ability[1]}</span>`;
    }
    abilityGrid.appendChild(slot);
  }
}

function animatePosition(targetX, targetY, speed = 28, onFrame = null) {
  return new Promise(resolve => {
    const startX = state.x;
    const startY = state.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);
    const duration = Math.max(180, (distance / speed) * 1000);
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setPlayer(startX + dx * eased, startY + dy * eased);
      if (onFrame) onFrame(t);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function animateEnemy(targetX, speed = 42) {
  return new Promise(resolve => {
    const startX = state.enemyX;
    const dx = targetX - startX;
    const duration = Math.max(120, Math.abs(dx) / speed * 1000);
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setEnemy(startX + dx * eased);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function spawnAfterImage(x, y) {
  const ghost = document.createElement('div');
  ghost.className = 'afterImage';
  ghost.style.left = `${x}%`;
  ghost.style.top = `${y}%`;
  world.appendChild(ghost);
  setTimeout(() => ghost.remove(), 380);
}

async function jumpArc(targetX, baseY, height = 11, duration = 650) {
  player.classList.add('jumpPose');
  const startX = state.x;
  const dx = targetX - startX;
  const start = performance.now();
  await new Promise(resolve => {
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const x = startX + dx * t;
      const arc = 4 * height * t * (1 - t);
      setPlayer(x, baseY - arc);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  player.classList.remove('jumpPose');
  setPlayer(targetX, baseY);
  spawnGroundShock(targetX, baseY);
}

function spawnGroundShock(x, y) {
  const el = document.createElement('div');
  el.className = 'groundShock';
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  world.appendChild(el);
  setTimeout(() => el.remove(), 360);
}

function spawnImpact(x, y) {
  const el = document.createElement('div');
  el.className = 'impactBurst';
  el.style.left = `${x}%`;
  el.style.top = `${y - 1}%`;
  world.appendChild(el);
  setTimeout(() => el.remove(), 430);
}

function spawnDamage(text, x, y, heal = false) {
  const el = document.createElement('div');
  el.className = `damageFloat${heal ? ' healFloat' : ''}`;
  el.textContent = text;
  el.style.left = `${x}%`;
  el.style.top = `${y - 3}%`;
  world.appendChild(el);
  setTimeout(() => el.remove(), 820);
}

function flashScreen() {
  screenFlash.classList.remove('play');
  void screenFlash.offsetWidth;
  screenFlash.classList.add('play');
}

function shake() {
  viewport.classList.remove('shake');
  void viewport.offsetWidth;
  viewport.classList.add('shake');
}

function fireArrow(fromX, fromY, toX, toY) {
  return new Promise(resolve => {
    const arrow = document.createElement('div');
    arrow.className = 'projectileArrow';
    arrow.style.left = `${fromX}%`;
    arrow.style.top = `${fromY}%`;
    world.appendChild(arrow);
    const start = performance.now();
    const duration = 280;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      arrow.style.left = `${fromX + (toX - fromX) * eased}%`;
      arrow.style.top = `${fromY + (toY - fromY) * eased}%`;
      if (t < 1) requestAnimationFrame(frame);
      else { arrow.remove(); resolve(); }
    }
    requestAnimationFrame(frame);
  });
}

function slashWave(fromX, y, toX) {
  return new Promise(resolve => {
    const wave = document.createElement('div');
    wave.className = 'slashWave';
    wave.style.left = `${fromX}%`;
    wave.style.top = `${y - 2}%`;
    world.appendChild(wave);
    const start = performance.now();
    const duration = 330;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2);
      wave.style.left = `${fromX + (toX - fromX) * eased}%`;
      if (t < 1) requestAnimationFrame(frame);
      else { wave.remove(); resolve(); }
    }
    requestAnimationFrame(frame);
  });
}

async function damageEnemy(amount, knockToX) {
  state.enemyHp = Math.max(0, state.enemyHp - amount);
  document.getElementById('enemyHpFill').style.width = `${state.enemyHp / state.enemyMaxHp * 100}%`;
  spawnImpact(state.enemyX, state.enemyY);
  spawnDamage(`-${amount}`, state.enemyX, state.enemyY);
  flashScreen();
  shake();
  await animateEnemy(knockToX, 70);
}

async function airborneShot() {
  setMessage('空中で弓へ自動切替');
  renderAbilities('弓');
  player.classList.add('bowPose');
  await delay(140);
  state.arrows -= 1;
  renderStatus();
  renderInventory();
  const fromX = state.x + 1;
  const fromY = state.y - 1;
  await fireArrow(fromX, fromY, state.enemyX - 1, state.enemyY - 1);
  await damageEnemy(30, Math.min(88, state.enemyX + 5));
  player.classList.remove('bowPose');
}

async function jumpEvadeSequence() {
  setMessage('敵が突進・自動ジャンプ回避');
  enemy.classList.add('telegraph');
  await delay(420);
  enemy.classList.remove('telegraph');
  enemy.classList.add('charge');

  const jumpPromise = jumpArc(42, 18, 11, 700);
  await delay(110);
  await animateEnemy(27, 68);
  enemy.classList.remove('charge');

  await delay(60);
  await airborneShot();
  await jumpPromise;

  setMessage('着地');
  await delay(220);
  setEnemy(61, 18);
}

async function dashSlashSequence() {
  setMessage('敵接近・短剣へ自動切替');
  renderAbilities('短剣');
  await delay(300);

  setMessage('ダッシュ接近');
  player.classList.add('dashPose');
  const startX = state.x;
  const dashTarget = 49;
  const dashStart = performance.now();
  await new Promise(resolve => {
    function frame(now) {
      const t = Math.min(1, (now - dashStart) / 280);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = startX + (dashTarget - startX) * eased;
      if (Math.floor(t * 8) !== Math.floor((t - .04) * 8)) spawnAfterImage(x - 2, 18);
      setPlayer(x, 18);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  player.classList.remove('dashPose');

  setMessage('ダッシュ斬り');
  player.classList.add('slashPose');
  await delay(70);
  const wavePromise = slashWave(state.x + 3, 18, state.enemyX - 1);
  await delay(110);
  player.classList.remove('slashPose');
  await wavePromise;
  await damageEnemy(70, 86);

  state.enemyAlive = false;
  enemy.classList.add('dead');
  setMessage('敵撃破・探索再開');
  await delay(650);
}

async function continueDungeon() {
  setMessage('自動移動：梯子へ');
  await animatePosition(86, 18, 30);
  setMessage('梯子を降りる');
  await animatePosition(86, 50, 18);

  setMessage('鍵扉を確認');
  await animatePosition(54, 50, 30);
  if (state.keys > 0) {
    state.keys -= 1;
    door.classList.add('open');
    door.textContent = 'OPEN';
    renderInventory();
    setMessage('鍵を自動使用');
    await delay(350);
  }
  await animatePosition(12, 50, 30);
  setMessage('梯子を降りる');
  await animatePosition(12, 82, 18);
  setMessage('自動移動：到達点へ');
  await animatePosition(88, 82, 30);
  setMessage('探索地点に到達');
  document.getElementById('conditionState').textContent = '状態：探索完了';
}

async function runDemo() {
  setPlayer(12, 18);
  renderStatus();
  renderInventory();
  renderAbilities('短剣');
  centerViewportOn(18);
  await delay(700);

  setMessage('自動移動：敵を感知');
  await animatePosition(34, 18, 28);
  await delay(250);
  await jumpEvadeSequence();
  await dashSlashSequence();
  await continueDungeon();
}

// ブラウザ履歴は使わない。
document.getElementById('backToShop')?.addEventListener('click', () => {
  window.location.replace('./フィールド_店エリア_v3.html');
});

// SAVEは明示操作のみ。現段階では保存処理自体は未実装。
document.getElementById('fieldSave')?.addEventListener('click', () => {
  alert('SAVE機能はまだ未実装です。自動保存もしていません。');
});
document.getElementById('fieldLog')?.addEventListener('click', () => alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click', () => alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize', () => centerViewportOn(state.y));

runDemo();
