const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:8,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  ranged:{name:'弓',type:'arrow',damage:28},
  melee:{name:'短剣',damage:42},
  turn:0,status:'探索開始',floor:0,playerOrder:-1
};

const floors=[
  {
    dir:1,label:'上層',
    cards:[
      {type:'place',name:'石廊下',scene:'corridor'},
      {type:'place',name:'崩れ壁',scene:'broken'},
      {type:'monster',name:'獣',scene:'corridor',hp:100,maxHp:100},
      {type:'event',name:'物置跡',scene:'storage',eventText:'物置跡を調べる'},
      {type:'place',name:'石扉',scene:'gate'},
      {type:'ladder',name:'ハシゴ',scene:'ladder',eventText:'下へ降りる'}
    ]
  },
  {
    dir:-1,label:'地下1階',
    cards:[
      {type:'place',name:'地下道',scene:'tunnel'},
      {type:'event',name:'木箱',scene:'storage',eventText:'古い木箱を発見'},
      {type:'monster',name:'骸骨',scene:'crypt',hp:92,maxHp:92},
      {type:'place',name:'鉄扉',scene:'gate'},
      {type:'place',name:'水場',scene:'water'},
      {type:'ladder',name:'ハシゴ',scene:'ladder',eventText:'さらに下へ降りる'}
    ]
  },
  {
    dir:1,label:'地下2階',
    cards:[
      {type:'place',name:'坑道',scene:'mine'},
      {type:'event',name:'宝箱',scene:'treasure',eventText:'宝箱を発見'},
      {type:'place',name:'岩場',scene:'rock'},
      {type:'monster',name:'洞窟獣',scene:'cavern',hp:112,maxHp:112},
      {type:'place',name:'広間',scene:'hall'},
      {type:'goal',name:'出口',scene:'exit',eventText:'出口に到達'}
    ]
  }
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・カード探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div class="cardRpgView"><div id="cardMessage" class="cardRpgMessage">前方3カードを確認</div><div id="turnBadge" class="turnBadge">探索</div><div id="cardDungeonBoard" class="cardDungeonBoard"></div><div class="cardRpgHint">主人公から前方3カードまで開く／敵はターンごとに1カード接近</div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">矢 0</span><span id="conditionState">状態：正常</span>`;

const board=document.getElementById('cardDungeonBoard');
const message=document.getElementById('cardMessage');
const turnBadge=document.getElementById('turnBadge');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');
const floorSlots=[];
const floorCards=[];

function physicalCol(floorIndex,orderIndex){return floors[floorIndex].dir===1?orderIndex+1:5-orderIndex;}
function entryCol(floorIndex){return floors[floorIndex].dir===1?0:6;}

function frontMarkup(data){
  const eventLike=['event','ladder','goal'].includes(data.type);
  const monster=data.type==='monster';
  const badge=data.type==='event'?'EVENT':data.type==='ladder'?'↓':data.type==='goal'?'EXIT':'';
  return `<div class="dungeonScene scene-${data.scene}"></div>${eventLike?`<span class="eventBadge">${badge}</span>`:''}${monster?`<div class="monsterToken"><span class="monsterShape"></span><b>${data.name}</b></div>`:''}<span class="sceneName">${data.name}</span>`;
}

floors.forEach((floorData,floorIndex)=>{
  const lane=document.createElement('div');
  lane.className=`floorLane${floorData.dir===-1?' reverse':''}`;
  lane.innerHTML=`<span class="floorLabel">${floorData.label} ${floorData.dir===1?'→':'←'}</span>`;
  const slots=[];
  for(let col=0;col<7;col++){
    const slot=document.createElement('div');
    slot.className='cardSlot';
    slot.dataset.floor=String(floorIndex);
    slot.dataset.col=String(col);
    lane.appendChild(slot);slots.push(slot);
  }
  floorSlots.push(slots);floorCards.push([]);board.appendChild(lane);

  floorData.cards.forEach((data,orderIndex)=>{
    const col=physicalCol(floorIndex,orderIndex);
    const card=document.createElement('div');
    card.className='mapCard';
    card.dataset.floor=String(floorIndex);
    card.dataset.order=String(orderIndex);
    card.innerHTML=`<div class="cardFace cardBack">?</div><div class="cardFace cardFront dungeonFront ${data.type==='monster'?'monsterFront ':''}${['event','ladder','goal'].includes(data.type)?'eventFront ':''}">${frontMarkup(data)}</div>`;
    slots[col].appendChild(card);
    floorCards[floorIndex][orderIndex]=card;
  });
});

const ladderRight=document.createElement('div');ladderRight.className='verticalLadder right';board.appendChild(ladderRight);
const ladderLeft=document.createElement('div');ladderLeft.className='verticalLadder left';board.appendChild(ladderLeft);

const playerCard=document.createElement('div');
playerCard.id='playerCard';playerCard.className='playerCard';
playerCard.innerHTML='<span class="playerLightDot"></span>';
floorSlots[0][entryCol(0)].appendChild(playerCard);

function setMessage(text){state.status=text;message.textContent=text;document.getElementById('exploreState').textContent=text;}
function renderStatus(){document.getElementById('hpText').textContent=`HP ${state.hp}/${state.maxHp}`;document.getElementById('hpFill').style.width=`${state.hp/state.maxHp*100}%`;document.getElementById('foodValue').textContent=`🍖 ${state.food}`;document.getElementById('ammoState').textContent=`矢 ${state.arrows}`;}
function renderInventory(){inventoryGrid.innerHTML='';const items=[['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],['🏹','矢',state.arrows],['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]];for(let i=0;i<8;i++){const slot=document.createElement('div');slot.className='squareSlot';const it=items[i];if(!it)slot.classList.add('empty');else slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span><span class="itemCount">${it[2]}</span>`;inventoryGrid.appendChild(slot);}}
function renderAbilities(active='弓'){abilityGrid.innerHTML='';const a=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];for(let i=0;i<7;i++){const slot=document.createElement('div');slot.className='squareSlot skillSlot';const it=a[i];if(!it)slot.classList.add('empty');else{if(it[1]===active)slot.classList.add('active');slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;}abilityGrid.appendChild(slot);}}

const delay=ms=>new Promise(r=>setTimeout(r,ms));
function revealCard(f,o){const card=floorCards[f][o];if(card&&!card.classList.contains('revealed'))card.classList.add('revealed');}
function markVisited(f,o){floorCards[f][o]?.classList.add('visited');}
function cardCol(f,o){return Number(floorCards[f][o].parentElement.dataset.col);}
function playerCol(){return Number(playerCard.parentElement.dataset.col);}

function revealAhead(floorIndex){
  const start=state.playerOrder+1;
  const end=Math.min(floors[floorIndex].cards.length-1,state.playerOrder+3);
  for(let i=start;i<=end;i++)revealCard(floorIndex,i);
}

function nearestVisibleMonster(floorIndex){
  const start=state.playerOrder+1;
  const end=Math.min(floors[floorIndex].cards.length-1,state.playerOrder+3);
  for(let i=start;i<=end;i++){
    const data=floors[floorIndex].cards[i];
    if(data.type==='monster'&&!data.defeated)return {data,order:i};
  }
  return null;
}

function slotRect(f,col){const br=board.getBoundingClientRect();const sr=floorSlots[f][col].getBoundingClientRect();return {left:sr.left-br.left,top:sr.top-br.top,width:sr.width,height:sr.height,x:sr.left-br.left+sr.width/2,y:sr.top-br.top+sr.height/2};}
function addSlashAt(f,col){const c=slotRect(f,col);const fx=document.createElement('div');fx.className='slashFx';fx.style.left=`${c.x}px`;fx.style.top=`${c.y}px`;board.appendChild(fx);setTimeout(()=>fx.remove(),320);}
function addDamageAt(f,col,text){const c=slotRect(f,col);const fx=document.createElement('div');fx.className='damageFx';fx.textContent=text;fx.style.left=`${c.x}px`;fx.style.top=`${c.y-4}px`;board.appendChild(fx);setTimeout(()=>fx.remove(),700);}
function shake(el){el.classList.remove('cardHit');void el.offsetWidth;el.classList.add('cardHit');setTimeout(()=>el.classList.remove('cardHit'),300);}

function flyProjectile(f,fromCol,toCol,type='arrow'){
  return new Promise(resolve=>{
    const from=slotRect(f,fromCol),to=slotRect(f,toCol);
    const fx=document.createElement('div');fx.className=`projectileFx ${type}${to.x<from.x?' left':''}`;fx.style.left=`${from.x}px`;fx.style.top=`${from.y}px`;board.appendChild(fx);
    const start=performance.now(),duration=Math.max(240,Math.abs(to.x-from.x)*1.25);
    function frame(now){const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);fx.style.left=`${from.x+(to.x-from.x)*e}px`;fx.style.top=`${from.y+(to.y-from.y)*e}px`;if(t<1)requestAnimationFrame(frame);else{fx.remove();resolve();}}
    requestAnimationFrame(frame);
  });
}

function createBattleMonster(data,f,startCol){
  const el=document.createElement('div');el.className='battleMonster';el.innerHTML=`<div class="enemyMiniHp"><i></i></div><div class="dungeonScene scene-${data.scene}"></div><div class="monsterToken live"><span class="monsterShape"></span><b>${data.name}</b></div>`;board.appendChild(el);
  const battle={el,floorIndex:f,col:startCol,hp:data.hp,maxHp:data.maxHp,data};positionBattleMonster(battle,false);return battle;
}
function positionBattleMonster(battle,animate=true){const r=slotRect(battle.floorIndex,battle.col);if(!animate)battle.el.style.transition='none';battle.el.style.left=`${r.left}px`;battle.el.style.top=`${r.top}px`;battle.el.style.width=`${r.width}px`;battle.el.style.height=`${r.height}px`;requestAnimationFrame(()=>{if(!animate)battle.el.style.transition='left .45s cubic-bezier(.2,.8,.2,1),top .45s cubic-bezier(.2,.8,.2,1),transform .15s ease,filter .15s ease';});}
function updateEnemyHp(battle){battle.el.querySelector('.enemyMiniHp i').style.width=`${Math.max(0,battle.hp)/battle.maxHp*100}%`;}

async function playerAttack(battle){
  state.turn++;turnBadge.textContent=`主人公 TURN ${state.turn}`;
  const pCol=playerCol();const distance=Math.abs(battle.col-pCol);const adjacent=distance===1;
  if(!adjacent&&state.ranged&&state.arrows>0){
    renderAbilities('弓');setMessage(`遠距離攻撃：${state.ranged.name}`);state.arrows--;renderStatus();renderInventory();
    await flyProjectile(battle.floorIndex,pCol,battle.col,state.ranged.type);battle.hp-=state.ranged.damage;shake(battle.el);addDamageAt(battle.floorIndex,battle.col,`-${state.ranged.damage}`);updateEnemyHp(battle);await delay(360);return;
  }
  if(adjacent){
    renderAbilities('短剣');setMessage(`隣接：${state.melee.name}で攻撃`);addSlashAt(battle.floorIndex,battle.col);shake(battle.el);battle.hp-=state.melee.damage;addDamageAt(battle.floorIndex,battle.col,`-${state.melee.damage}`);updateEnemyHp(battle);await delay(430);return;
  }
  setMessage('近接武器しかないため接近を待つ');await delay(420);
}

async function enemyTurn(battle){
  if(battle.hp<=0)return;turnBadge.textContent='敵 TURN';const pCol=playerCol();const distance=Math.abs(battle.col-pCol);
  if(distance>1){setMessage('敵が1カード接近');battle.col+=battle.col>pCol?-1:1;positionBattleMonster(battle,true);await delay(650);return;}
  setMessage('敵の近接攻撃');addSlashAt(battle.floorIndex,pCol);shake(playerCard);const damage=13;state.hp=Math.max(0,state.hp-damage);addDamageAt(battle.floorIndex,pCol,`-${damage}`);renderStatus();await delay(560);
}

function convertMonsterCardToDungeon(f,o){
  const data=floors[f].cards[o];data.defeated=true;data.type='place';
  const card=floorCards[f][o];const front=card.querySelector('.cardFront');
  front.classList.remove('monsterFront');front.classList.add('clearedFront');
  front.innerHTML=`<div class="dungeonScene scene-${data.scene}"></div><span class="sceneName">${data.name}跡</span>`;
  card.classList.add('cleared');
}

async function battleLoop(data,f,o){
  const sourceCard=floorCards[f][o];const startCol=cardCol(f,o);
  turnBadge.textContent='戦闘';setMessage(`${data.name}を前方に発見`);sourceCard.classList.add('battleSource');
  const battle=createBattleMonster(data,f,startCol);await delay(450);
  while(battle.hp>0&&state.hp>0){await playerAttack(battle);if(battle.hp<=0)break;await enemyTurn(battle);}
  if(state.hp<=0){setMessage('戦闘不能');document.getElementById('conditionState').textContent='状態：戦闘不能';return false;}
  setMessage(`${data.name}を撃破`);battle.el.classList.add('dead');await delay(520);battle.el.remove();sourceCard.classList.remove('battleSource');convertMonsterCardToDungeon(f,o);turnBadge.textContent='探索';return true;
}

async function swapPlayerWithNext(floorIndex){
  const nextOrder=state.playerOrder+1;if(nextOrder>=floors[floorIndex].cards.length)return false;
  const card=floorCards[floorIndex][nextOrder];const currentSlot=playerCard.parentElement;const targetSlot=card.parentElement;
  playerCard.classList.add('moving');card.classList.add('swapping');await delay(150);
  currentSlot.appendChild(card);targetSlot.appendChild(playerCard);
  card.classList.remove('swapping');playerCard.classList.remove('moving');markVisited(floorIndex,nextOrder);state.playerOrder=nextOrder;
  await delay(220);return true;
}

async function showEvent(data,card){
  card.classList.add('eventActive');turnBadge.textContent='EVENT';setMessage(`EVENT：${data.eventText||data.name}`);await delay(900);card.classList.remove('eventActive');turnBadge.textContent='探索';
}

async function enterFloor(floorIndex){
  state.floor=floorIndex;state.playerOrder=-1;
  playerCard.classList.add('descending');await delay(220);floorSlots[floorIndex][entryCol(floorIndex)].appendChild(playerCard);playerCard.classList.remove('descending');
  setMessage(`${floors[floorIndex].label}：前方3カードを確認`);revealAhead(floorIndex);await delay(700);
}

async function exploreFloor(floorIndex){
  await enterFloor(floorIndex);
  const floor=floors[floorIndex];
  while(state.playerOrder<floor.cards.length-1){
    revealAhead(floorIndex);
    await delay(250);

    const threat=nearestVisibleMonster(floorIndex);
    if(threat){const ok=await battleLoop(threat.data,floorIndex,threat.order);if(!ok)return false;await delay(250);}

    const nextOrder=state.playerOrder+1;
    const nextData=floor.cards[nextOrder];
    const nextCard=floorCards[floorIndex][nextOrder];

    if(['event','ladder','goal'].includes(nextData.type))await showEvent(nextData,nextCard);

    setMessage('前方のカードと場所交換');
    await swapPlayerWithNext(floorIndex);
    revealAhead(floorIndex);
    await delay(500);

    if(nextData.type==='ladder'){
      setMessage('ハシゴから下へ');await delay(500);return true;
    }
    if(nextData.type==='goal'){
      setMessage('出口に到達');await delay(500);return true;
    }
  }
  return true;
}

async function runExplore(){
  renderStatus();renderInventory();renderAbilities('弓');await delay(450);
  for(let f=0;f<floors.length;f++){
    const ok=await exploreFloor(f);if(!ok)return;
    if(f<floors.length-1){turnBadge.textContent='移動';await delay(300);}
  }
  setMessage('探索完了');document.getElementById('conditionState').textContent='状態：探索完了';turnBadge.textContent='完了';
}

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>{});
runExplore();