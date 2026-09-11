const rowTop=document.getElementById('rowTop');
const rowBottom=document.getElementById('rowBottom');
const drawButton=document.getElementById('drawCard');
const deckCount=document.getElementById('deckCount');
const buildMessage=document.getElementById('buildMessage');
const drawTitle=document.getElementById('drawTitle');
const drawText=document.getElementById('drawText');
const resetMap=document.getElementById('resetMap');
const backField=document.getElementById('backField');
const cardViewer=document.getElementById('cardViewer');
const viewerCard=document.getElementById('viewerCard');
const viewerClose=document.getElementById('viewerClose');

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

let deck=[];
let drawn=[];
const slots=[];

function createSlots(){
  rowTop.innerHTML='';
  rowBottom.innerHTML='';
  slots.length=0;
  for(let i=0;i<5;i++){
    const slot=document.createElement('div');
    slot.className='mapSlot';
    slot.dataset.index=String(i);
    rowTop.appendChild(slot);
    slots.push(slot);
  }
  for(let i=0;i<5;i++){
    const slot=document.createElement('div');
    slot.className='mapSlot';
    slot.dataset.index=String(9-i);
    rowBottom.appendChild(slot);
  }
  const bottomSlots=[...rowBottom.children].reverse();
  bottomSlots.forEach(slot=>slots.push(slot));
}

function cardMarkup(card){
  return `<div class="cardArt"><span class="cardSymbol">${card.symbol}</span></div><span class="cardTag">${card.tag}</span><span class="cardName">${card.name}</span>`;
}

function refreshNextSlot(){
  slots.forEach(slot=>slot.classList.remove('next'));
  if(drawn.length<slots.length)slots[drawn.length].classList.add('next');
}

function updateInfo(){
  deckCount.textContent=`山札 ${deck.length}`;
  drawButton.disabled=deck.length===0;
  if(deck.length===0){
    buildMessage.textContent='ダンジョン完成';
    drawTitle.textContent='完成';
    drawText.textContent='10枚のカードで1つのダンジョンができた';
  }
  refreshNextSlot();
}

function showLargeCard(card){
  viewerCard.dataset.kind=card.kind;
  viewerCard.innerHTML=cardMarkup(card);
  cardViewer.hidden=false;
}

function placeCard(card){
  const slot=slots[drawn.length];
  if(!slot)return;
  const el=document.createElement('div');
  el.className='dungeonCard';
  el.dataset.kind=card.kind;
  el.innerHTML=cardMarkup(card);
  el.addEventListener('click',()=>showLargeCard(card));
  slot.appendChild(el);
  drawn.push(card);
}

function drawOne(){
  if(deck.length===0)return;
  const card=deck.shift();
  placeCard(card);
  buildMessage.textContent=`${card.name} を引いた`;
  drawTitle.textContent=card.name;
  if(card.kind==='monster'){
    drawText.textContent='モンスター。戦闘は別HTMLに切り離せる';
  }else if(card.kind==='event'){
    drawText.textContent='イベントカード。必要アイテム処理などをここで止められる';
  }else if(card.kind==='ladder'){
    drawText.textContent='次の階層へつなぐカード';
  }else if(card.kind==='treasure'){
    drawText.textContent='宝箱・入手物などの探索結果';
  }else{
    drawText.textContent='ダンジョンの場所カードとして盤面に追加';
  }
  updateInfo();
}

function reset(){
  deck=deckTemplate.map(card=>({...card}));
  drawn=[];
  createSlots();
  buildMessage.textContent='山札から1枚引く';
  drawTitle.textContent='未探索';
  drawText.textContent='カードを引くたびにダンジョンが出来ていく';
  updateInfo();
}

drawButton.addEventListener('click',drawOne);
resetMap.addEventListener('click',reset);
backField.addEventListener('click',()=>window.location.replace('./フィールド.html'));
viewerClose.addEventListener('click',()=>{cardViewer.hidden=true;});
cardViewer.addEventListener('click',e=>{if(e.target===cardViewer)cardViewer.hidden=true;});

reset();
