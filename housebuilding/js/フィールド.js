// フィールド画面の内容・移動・敵・採取物などを管理するJS。
// 今はレイアウト確認用。オート移動・戦闘・SAVE処理はまだ未実装。

const hud = document.getElementById('fieldHud');
const fieldView = document.getElementById('fieldView');
const equipList = document.getElementById('equipList');
const inventoryGrid = document.getElementById('inventoryGrid');
const skillList = document.getElementById('skillList');

hud.innerHTML = `
  <div class="hudRow">
    <strong class="hudPlace">森・入口</strong>
    <div class="hpWrap">
      <span class="hudValue">HP 82/100</span>
      <div class="hpBar"><div class="hpFill"></div></div>
    </div>
    <span class="hudValue">🍖 74</span>
  </div>
  <div class="hudRow hudSub">
    <span>探索中</span>
    <span>弾 8/20</span>
    <span>状態：正常</span>
  </div>
`;

fieldView.innerHTML = `
  <div class="fieldLayer">
    <button id="backToShop" class="fieldEdge fieldEdgeLeft" type="button" aria-label="店があるマップへ戻る">◀</button>
    <div class="fieldGuide">フィールド表示テスト</div>
    <div class="routeObject ladder">はしご</div>
    <div class="routeObject crate">木箱</div>
    <div class="player" aria-label="主人公"></div>
    <div class="exitMark">▶</div>
  </div>
`;

const equipment = [
  ['武器', '短剣'],
  ['遠距離', '弓'],
  ['防具', '革鎧']
];

equipment.forEach(([label, name]) => {
  const slot = document.createElement('div');
  slot.className = 'equipSlot';
  slot.innerHTML = `<span>${label}</span><strong>${name}</strong>`;
  equipList.appendChild(slot);
});

const items = [
  ['🌿', 3],
  ['🧴', 1],
  ['🍞', 2],
  ['🏹', 14],
  ['🪢', 1],
  ['🗝️', 1],
  ['🪓', 1]
];

for (let i = 0; i < 12; i++) {
  const slot = document.createElement('div');
  slot.className = 'itemSlot';

  const item = items[i];
  if (!item) {
    slot.classList.add('empty');
  } else {
    slot.innerHTML = `<span>${item[0]}</span><span class="itemCount">${item[1]}</span>`;
  }

  inventoryGrid.appendChild(slot);
}

['応急処置', '採取', '危険察知'].forEach(name => {
  const slot = document.createElement('div');
  slot.className = 'skillSlot';
  slot.textContent = name;
  skillList.appendChild(slot);
});

// 画面移動はブラウザ履歴を積まない。
document.getElementById('backToShop')?.addEventListener('click', () => {
  window.location.replace('./フィールド_店エリア_v3.html');
});

// SAVEは明示操作だけ。現段階では保存処理自体をまだ実装しない。
document.getElementById('fieldSave')?.addEventListener('click', () => {
  alert('SAVE機能はまだ未実装です。');
});

document.getElementById('fieldLog')?.addEventListener('click', () => {
  alert('LOG画面はまだ未実装です。');
});

document.getElementById('fieldMenu')?.addEventListener('click', () => {
  alert('MENU画面はまだ未実装です。');
});
