// 縦画面向け・自動探索ダンジョン演出試作。
// ブラウザ履歴・オートセーブは使わない。
// 入場後は自動移動 / 自動戦闘 / 自動回復 / 自動解錠で進行する。

const fieldTop = document.getElementById('fieldTop');
const fieldView = document.getElementById('fieldView');
const fieldPanel = document.getElementById('fieldPanel');
const fieldBottom = document.getElementById('fieldBottom');

const state = {
  hp: 82,
  maxHp: 100,
  food: 74,
  arrows: 14,
  herb: 3,
  potion: 1,
  bread: 2,
  rope: 1,
  keys: 1,
  axe: 1,
  x: 12,
  y: 18,
  row: 0,
  status: '探索開始',
  enemyHp: 90,
  enemyMaxHp: 90,
  enemyAlive: true,
  doorLocked: true
};

const dungeonRows = [
  { row: 0, y: 18, direction: 'right', startX: 12, endX: 86 },
  { row: 1, y: 50, direction: 'left', startX: 86, endX: 12 },
  { row: 2, y: 82, direction: 'right', startX: 12, endX: 88 }
];

fieldTop.innerHTML = `
  <div class="topMenuRow">
    <strong class="topPlace">森・自動探索試作</strong>
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
const inventoryGrid = document.getElementById('inventoryGrid');
const abilityGrid = document.getElementById('abilityGrid');

function createFloor(row) {
  const floor = document.createElement('div');
  floor.className = 'dungeonFloor';
  floor.style.top = `${row.y}%`;

  const hint = document.createElement('span');
  hint.className = `floorHint ${row.direction}`;
  hint.textContent = row.direction === 'right' ? '→ AUTO' : 'AUTO ←';
  floor.appendChild(hint);
  world.appendChild(floor);
}

dungeonRows.forEach(createFloor);

function createLadder(x, y1, y2) {
  const ladder = document.createElement('div');
  ladder.className = 'dungeonLadder';
  ladder.style.left = `${x}%`;
  ladder.style.top = `${y1}%`;
  ladder.style.height = `${y2 - y1}%`;
  world.appendChild(ladder);
}

createLadder(86, 18, 50);
createLadder(12, 50, 82);

const enemy = document.createElement('div');
enemy.id = 'enemy1';
enemy.className = 'dungeonObject dungeonEnemy';
enemy.style.left = '52%';
enemy.style.top = '18%';
enemy.innerHTML = '<div class="enemyHp"><div id="enemyHpFill" class="enemyHpFill"></div></div>';
world.appendChild(enemy);

const door = document.createElement('div');
door.id = 'door1';
door.className = 'dungeonObject dungeonDoor';
door.style.left = '48%';
door.style.top = '50%';
door.textContent = '鍵扉';
world.appendChild(door);

const goal = document.createElement('div');
goal.className = 'dungeonObject dungeonGoal';
goal.style.left = '88%';
goal.style.top = '82%';
goal.textContent = '到達点';
world.appendChild(goal);

const player = document.createElement('div');
player.id = 'autoPlayer';
player.className = 'player';
world.appendChild(player);

function setPlayerPosition(x, y) {
  state.x = x;
  state.y = y;
  player.style.left = `${x}%`;
  player.style.top = `${y}%`;
  centerViewportOn(y);
}

function centerViewportOn(y) {
  const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const raw = (y / 100) * world.scrollHeight - viewport.clientHeight * 0.46;
  viewport.scrollTop = Math.max(0, Math.min(maxScroll, raw));
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

function renderAbilities() {
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
    if (!ability) slot.classList.add('empty');
    else slot.innerHTML = `<span class="slotIcon">${ability[0]}</span><span class="slotName">${ability[1]}</span>`;
    abilityGrid.appendChild(slot);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function moveTo(targetX, targetY, speed = 20) {
  return new Promise(resolve => {
    const startX = state.x;
    const startY = state.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);
    const duration = Math.max(250, (distance / speed) * 1000);
    const startTime = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setPlayerPosition(startX + dx * eased, startY + dy * eased);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function worldPointFromPercent(x, y) {
  return {
    x: (x / 100) * world.clientWidth,
    y: (y / 100) * world.clientHeight
  };
}

function spawnFloat(text, x, y, className = '') {
  const el = document.createElement('div');
  el.className = `damageFloat ${className}`.trim();
  el.textContent = text;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  world.appendChild(el);
  setTimeout(() => el.remove(), 720);
}

function spawnImpact(x, y) {
  const el = document.createElement('div');
  el.className = 'impactBurst';
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  world.appendChild(el);
  setTimeout(() => el.remove(), 320);
}

function shakeScreen() {
  viewport.classList.remove('shake');
  void viewport.offsetWidth;
  viewport.classList.add('shake');
}

async function flashPlayer(className, ms = 220) {
  player.classList.add(className);
  await delay(ms);
  player.classList.remove(className);
}

function fireArrow(fromX, toX, y) {
  return new Promise(resolve => {
    const arrow = document.createElement('div');
    arrow.className = 'projectileArrow';
    arrow.style.left = `${fromX}%`;
    arrow.style.top = `${y - 0.6}%`;
    world.appendChild(arrow);

    const startTime = performance.now();
    const duration = 260;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = fromX + (toX - fromX) * eased;
      arrow.style.left = `${x}%`;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        arrow.remove();
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

async function enemyHit(damage = 30) {
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  document.getElementById('enemyHpFill').style.width = `${(state.enemyHp / state.enemyMaxHp) * 100}%`;

  spawnImpact(52, 17.3);
  spawnFloat(`-${damage}`, 52, 15.5);
  enemy.classList.add('hitFlash');
  enemy.style.left = '55%';
  shakeScreen();
  await delay(110);
  enemy.classList.remove('hitFlash');
  enemy.style.left = '52%';
  await delay(140);
}

async function playerHit(damage = 12) {
  setMessage('被弾・ノックバック');
  state.hp = Math.max(0, state.hp - damage);
  renderStatus();
  spawnFloat(`-${damage}`, state.x, state.y - 2.5, 'playerDamage');
  shakeScreen();
  await flashPlayer('hit', 160);

  const fightX = state.x;
  await moveTo(Math.max(10, fightX - 5), state.y, 44);
  await delay(120);
  return fightX;
}

async function enemyCounterAttack() {
  enemy.classList.add('lunge');
  enemy.style.left = '47%';
  await delay(150);
  const returnX = await playerHit(12);
  enemy.style.left = '52%';
  enemy.classList.remove('lunge');
  await delay(140);
  return returnX;
}

async function autoHealIfNeeded() {
  const missing = state.maxHp - state.hp;
  if (missing < 20 || state.herb <= 0) return;

  setMessage('薬草を自動使用');
  await delay(260);
  state.herb -= 1;
  state.hp = Math.min(state.maxHp, state.hp + 20);
  renderStatus();
  renderInventory();
  spawnFloat('+20', state.x, state.y - 2.5, 'healFloat');
  await flashPlayer('heal', 300);
  await delay(260);
}

async function rangedShot(shotNumber) {
  setMessage(`弓を構える ${shotNumber}/3`);
  player.classList.add('aiming');
  await delay(320);

  setMessage('射撃');
  state.arrows -= 1;
  renderStatus();
  renderInventory();

  player.classList.add('recoil');
  const arrowPromise = fireArrow(state.x + 1.5, 50.5, state.y - 0.2);
  await delay(80);
  player.classList.remove('recoil');
  await arrowPromise;

  player.classList.remove('aiming');
  await enemyHit(30);
}

async function fightEnemy() {
  if (!state.enemyAlive) return;

  setMessage('敵を感知・その場で停止');
  await delay(420);
  setMessage('弓へ自動切替');
  await delay(350);

  let shot = 1;
  while (state.enemyHp > 0 && state.arrows > 0) {
    await rangedShot(shot);

    if (shot === 1 && state.enemyHp > 0) {
      const returnX = await enemyCounterAttack();
      await autoHealIfNeeded();
      setMessage('射撃位置へ戻る');
      await moveTo(returnX, state.y, 40);
    }

    shot += 1;
    await delay(170);
  }

  if (state.enemyHp <= 0) {
    state.enemyAlive = false;
    enemy.classList.add('dead');
    setMessage('敵撃破・探索再開');
    await delay(650);
  } else {
    setMessage('矢切れ・近接へ切替');
    await delay(450);
    state.enemyHp = 0;
    state.enemyAlive = false;
    enemy.classList.add('dead');
  }
}

async function unlockDoor() {
  if (!state.doorLocked) return;
  setMessage('鍵扉を確認');
  await delay(420);

  if (state.keys > 0) {
    setMessage('鍵を自動使用');
    state.keys -= 1;
    state.doorLocked = false;
    door.classList.add('open');
    door.textContent = 'OPEN';
    renderInventory();
    await delay(480);
  } else {
    setMessage('鍵がないため停止');
    throw new Error('NO_KEY');
  }
}

async function runDungeon() {
  try {
    setPlayerPosition(12, 18);
    renderStatus();
    renderInventory();
    renderAbilities();
    await delay(700);

    setMessage('自動移動：右へ');
    await moveTo(43, 18);
    await fightEnemy();

    setMessage('自動移動：梯子へ');
    await moveTo(86, 18);
    setMessage('梯子を自動で降りる');
    await moveTo(86, 50, 16);
    state.row = 1;

    setMessage('自動移動：左へ');
    await moveTo(57, 50);
    await unlockDoor();
    await moveTo(12, 50);

    setMessage('梯子を自動で降りる');
    await moveTo(12, 82, 16);
    state.row = 2;

    setMessage('自動移動：右へ');
    await moveTo(88, 82);
    setMessage('探索地点に到達');
    document.getElementById('conditionState').textContent = '状態：探索完了';
  } catch (error) {
    if (error.message !== 'NO_KEY') console.error(error);
  }
}

// 画面移動は履歴を積まない。
document.getElementById('backToShop')?.addEventListener('click', () => {
  window.location.replace('./フィールド_店エリア_v3.html');
});

// SAVEは明示操作のみ。現段階では保存しない。
document.getElementById('fieldSave')?.addEventListener('click', () => {
  alert('SAVE機能はまだ未実装です。自動保存もしていません。');
});
document.getElementById('fieldLog')?.addEventListener('click', () => alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click', () => alert('MENU画面はまだ未実装です。'));

window.addEventListener('resize', () => centerViewportOn(state.y));

runDungeon();
