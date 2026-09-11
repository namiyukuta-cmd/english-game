// フィールド画面の具体的な中身はJS側で生成する。
// HTMLは上部div / 真ん中4/6 / 真ん中2/6 / 下部div のガワだけ持つ。
// オート移動・戦闘・SAVE処理はまだ未実装。

const fieldTop = document.getElementById('fieldTop');
const fieldView = document.getElementById('fieldView');
const fieldPanel = document.getElementById('fieldPanel');
const fieldBottom = document.getElementById('fieldBottom');

fieldTop.innerHTML = `
  <div class="topMenuRow">
    <strong class="topPlace">森・入口</strong>
    <button id="fieldLog" class="topMenuButton" type="button">LOG</button>
    <button id="fieldSave" class="topMenuButton" type="button">SAVE</button>
    <button id="fieldMenu" class="topMenuButton" type="button">MENU</button>
  </div>
`;

fieldView.innerHTML = `
  <div class="fieldLayer">
    <button id="backToShop" class="fieldEdge fieldEdgeLeft" type="button" aria-label="店があるマップへ戻る">◀</button>
    <div class="fieldGuide">探索マップ</div>
    <div class="routeObject ladder">はしご</div>
    <div class="routeObject crate">木箱</div>
    <div class="player" aria-label="主人公"></div>
  </div>
`;

fieldPanel.innerHTML = `
  <div class="panelStatus">
    <div class="hpWrap">
      <span class="hpText">HP 82/100</span>
      <div class="hpBar"><div class="hpFill"></div></div>
    </div>
    <span class="foodValue">🍖 74</span>
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
  <span>探索中</span>
  <span>弾 8/20</span>
  <span>状態：正常</span>
`;

const inventoryGrid = document.getElementById('inventoryGrid');
const abilityGrid = document.getElementById('abilityGrid');

const items = [
  ['🌿', '薬草', 3],
  ['🧴', '回復薬', 1],
  ['🍞', 'パン', 2],
  ['🏹', '矢', 14],
  ['🪢', 'ロープ', 1],
  ['🗝️', '鍵', 1],
  ['🪓', '斧', 1]
];

for (let i = 0; i < 8; i++) {
  const slot = document.createElement('div');
  slot.className = 'squareSlot';
  const item = items[i];

  if (!item) {
    slot.classList.add('empty');
  } else {
    slot.innerHTML = `
      <span class="slotIcon">${item[0]}</span>
      <span class="slotName">${item[1]}</span>
      <span class="itemCount">${item[2]}</span>
    `;
  }
  inventoryGrid.appendChild(slot);
}

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
    slot.innerHTML = `
      <span class="slotIcon">${ability[0]}</span>
      <span class="slotName">${ability[1]}</span>
    `;
  }
  abilityGrid.appendChild(slot);
}

// ブラウザ履歴は使わない。
document.getElementById('backToShop')?.addEventListener('click', () => {
  window.location.replace('./フィールド_店エリア_v3.html');
});

// SAVEは明示操作だけ。現在は保存処理自体をまだ実装しない。
document.getElementById('fieldSave')?.addEventListener('click', () => {
  alert('SAVE機能はまだ未実装です。');
});

document.getElementById('fieldLog')?.addEventListener('click', () => {
  alert('LOG画面はまだ未実装です。');
});

document.getElementById('fieldMenu')?.addEventListener('click', () => {
  alert('MENU画面はまだ未実装です。');
});
