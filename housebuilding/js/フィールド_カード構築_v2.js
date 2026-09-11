const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:95,maxHp:100,food:74,
  herb:2,potion:1,bread:2,arrows:7,rope:1,keys:0,axe:1,
  status:'山札から1枚引く'
};

const deckTemplate=[
  {kind:'place',name:'石の通路',tag:'DUNGEON',symbol:'▥'},
  {kind:'event',name:'崩れた扉',tag:'EVENT',symbol:'⚠'},
  {kind:'place',name:'地下水路',tag:'DUNGEON',symbol:'≈'},
  {kind:'monster',name:'洞窟獣',tag:'ENEMY',symbol:'●'},
  {kind:'place',name:'古い石室',tag:'DUNGEON',symbol:'□'},
  {kind:'treasure',name:'放置された箱',tag:'TREASURE',symbol:'◇'},
  {kind:'place',name:'細い坑道',tag:'DUNGEON',symbol:'▤'},
  {kind:'event',name:'切れた足場',tag:'EVENT',symbol:'⚠'},
  {kind:'monster',name:'骸骨',tag:'ENEMY',symbol:'●'},
  {kind:'ladder',name:'地下へのハシゴ',tag:'DOWN',symbol:'↧'}
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・カード探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;

fieldView.innerHTML=`
  <button id="backToField" class="fieldEdge" type="button" aria-label="元のフィールドへ戻る">◀</button>
  <div class="buildView">
    <button id="drawCard" class="buildMessageButton" type="button">1枚引く</button>
    <span id="deckCount" class="deckCountBadge">山札 10</span>
    <div id="mapBoard" class="mapBoard" aria-label="構築中のダンジョン">
      <div id="rowTop" class="mapRow"></div>
      <div id="rowBottom" class="mapRow reverse"></div>
      <div class="rowConnector" aria-hidden="true"></div>
    </div>
  </div>`;

fieldPanel.innerHTML=`
  <div class="panelStatus">
    <div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div>
    <span id="foodValue" class="foodValue"></span>
  </div>
  <div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div>
  <div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;

fieldBottom.innerHTML=`<span id="exploreState">山札から1枚引く</span><span id="ammoState">矢 ${state.arrows}</span><span id="conditionState">状態：構築中</span>`;

const rowTop=document.getElementById('rowTop');
const rowBottom=document.getElementById('rowBottom');
const drawButton=document.getElementById('drawCard');
const deckCount=document.getElementById('deckCount');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');
const cardViewer=document.getElementById('cardViewer');
const viewerCard=document.getElementById('viewerCard');
const viewerClose=document.getElementById('viewerClose');

let deck=[];
let drawn=[];
const slots=[];

function setStatus(text){
  state.status=text;
  document.getElementById('exploreState').textContent=text;
}

function renderStatus(){
  document.getElementById('hpText').textContent=`HP ${state.hp}/${state.maxHp}`;
  document.getElementById('hpFill').style.width=`${state.hp/state.maxHp*100}%`;
  document.getElementById('foodValue').textContent=`🍖 ${state.food}`;
  document.getElementById('ammoState').textContent=`矢 ${state.arrows}`;
}

function renderInventory(){
  inventoryGrid.innerHTML='';
  const items=[
    ['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],['🏹','矢',state.arrows],
    ['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]
  ];
  for(let i=0;i<8;i++){
    const card=document.createElement('div');card.className='itemCard';
    const item=items[i];
    if(!item){card.classList.add('empty');inventoryGrid.appendChild(card);continue;}
    card.innerHTML=`<span class="slotIcon">${item[0]}</span><span class="slotName">${item[1]}</span><span class="itemCount">${item[2]}</span>`;
    if(item[2]<=0)card.classList.add('empty');
    inventoryGrid.appendChild(card);
  }
}

function renderAbilities(){
  abilityGrid.innerHTML='';
  const abilities=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];
  for(let i=0;i<7;i++){
    const slot=document.createElement('div');slot.className='squareSlot skillSlot';
    const item=abilities[i];
    if(!item){slot.classList.add('empty');}
    else{slot.innerHTML=`<span class="slotIcon">${item[0]}</span><span class="slotName">${item[1]}</span>`;}
    abilityGrid.appendChild(slot);
  }
}

function createSlots(){
  rowTop.innerHTML='';rowBottom.innerHTML='';slots.length=0;
  for(let i=0;i<5;i++){
    const slot=document.createElement('div');slot.className='mapSlot';slot.dataset.index=String(i);rowTop.appendChild(slot);slots[i]=slot;
  }
  for(let visual=0;visual<5;visual++){
    const index=9-visual;
    const slot=document.createElement('div');slot.className='mapSlot';slot.dataset.index=String(index);rowBottom.appendChild(slot);slots[index]=slot;
  }
}

function cardMarkup(card){
  return `<div class="cardArt"><span class="cardSymbol">${card.symbol}</span></div><span class="cardTag">${card.tag}</span><span class="cardName">${card.name}</span>`;
}

function refreshNext(){
  slots.forEach(slot=>slot?.classList.remove('next'));
  if(drawn.length<slots.length)slots[drawn.length]?.classList.add('next');
}

function updateDeck(){
  deckCount.textContent=`山札 ${deck.length}`;
  if(deck.length===0){
    drawButton.disabled=true;drawButton.textContent='完成';
    setStatus('ダンジョン完成');
    document.getElementById('conditionState').textContent='状態：完成';
  }else{
    drawButton.disabled=false;drawButton.textContent='1枚引く';
  }
  refreshNext();
}

function showLargeCard(card){
  viewerCard.dataset.kind=card.kind;
  viewerCard.innerHTML=cardMarkup(card);
  cardViewer.hidden=false;
}

function placeCard(card){
  const slot=slots[drawn.length];if(!slot)return;
  const el=document.createElement('div');el.className='dungeonCard';el.dataset.kind=card.kind;el.innerHTML=cardMarkup(card);
  el.addEventListener('click',()=>showLargeCard(card));slot.appendChild(el);drawn.push(card);
}

function drawOne(){
  if(deck.length===0)return;
  const card=deck.shift();placeCard(card);
  setStatus(`${card.name} を引いた`);
  if(card.kind==='monster')document.getElementById('conditionState').textContent='状態：敵カード';
  else if(card.kind==='event')document.getElementById('conditionState').textContent='状態：イベント';
  else if(card.kind==='treasure')document.getElementById('conditionState').textContent='状態：宝箱';
  else if(card.kind==='ladder')document.getElementById('conditionState').textContent='状態：ハシゴ';
  else document.getElementById('conditionState').textContent='状態：構築中';
  updateDeck();
}

function reset(){
  deck=deckTemplate.map(card=>({...card}));drawn=[];createSlots();setStatus('山札から1枚引く');
  document.getElementById('conditionState').textContent='状態：構築中';updateDeck();
}

drawButton.addEventListener('click',drawOne);
document.getElementById('backToField')?.addEventListener('click',()=>window.location.replace('./フィールド.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>{if(confirm('この試作マップを最初から作り直しますか？'))reset();});
viewerClose?.addEventListener('click',()=>{cardViewer.hidden=true;});
cardViewer?.addEventListener('click',e=>{if(e.target===cardViewer)cardViewer.hidden=true;});

renderStatus();renderInventory();renderAbilities();reset();
