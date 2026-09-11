const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:8,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  ranged:{name:'弓',type:'arrow',damage:28},
  melee:{name:'短剣',damage:42},
  turn:0,status:'探索開始',floor:0,playerOrder:0
};

const itemDefs={
  herb:{stateKey:'herb',icon:'🌿',name:'薬草'},
  potion:{stateKey:'potion',icon:'🧴',name:'回復薬'},
  bread:{stateKey:'bread',icon:'🍞',name:'パン'},
  arrows:{stateKey:'arrows',icon:'🏹',name:'矢'},
  rope:{stateKey:'rope',icon:'🪢',name:'ロープ'},
  key:{stateKey:'keys',icon:'🗝️',name:'鍵'},
  axe:{stateKey:'axe',icon:'🪓',name:'斧'}
};

/* 1階につき7枚。カード自体はダンジョン背景、主人公・敵はその上に乗る。 */
const floors=[
  {
    dir:1,label:'上層',cards:[
      {type:'place',name:'石廊下'},
      {type:'place',name:'崩れ壁'},
      {type:'monster',name:'獣',hp:100,maxHp:100},
      {type:'event',name:'施錠扉',eventText:'鍵のかかった扉',requires:{item:'key',count:1,consume:true}},
      {type:'place',name:'物置跡'},
      {type:'place',name:'石室'},
      {type:'ladder',name:'ハシゴ',eventText:'下へ降りる'}
    ]
  },
  {
    dir:-1,label:'地下1階',cards:[
      {type:'place',name:'地下道'},
      {type:'place',name:'水場'},
      {type:'monster',name:'骸骨',hp:92,maxHp:92},
      {type:'place',name:'石廊下'},
      {type:'event',name:'切れた足場',eventText:'ロープで渡る',requires:{item:'rope',count:1,consume:false}},
      {type:'place',name:'墓室'},
      {type:'ladder',name:'ハシゴ',eventText:'さらに下へ降りる'}
    ]
  },
  {
    dir:1,label:'地下2階',cards:[
      {type:'place',name:'坑道'},
      {type:'event',name:'板張り封鎖',eventText:'斧で板を壊す',requires:{item:'axe',count:1,consume:false}},
      {type:'place',name:'岩場'},
      {type:'monster',name:'洞窟獣',hp:112,maxHp:112},
      {type:'place',name:'広間'},
      {type:'place',name:'出口前'},
      {type:'goal',name:'出口',eventText:'出口に到達'}
    ]
  }
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・カード探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div class="cardRpgView"><div id="cardMessage" class="cardRpgMessage">現在地＋前方3カードを確認</div><div id="turnBadge" class="turnBadge">探索</div><div id="cardDungeonBoard" class="cardDungeonBoard"></div><div class="cardRpgHint">ダンジョンカードは固定／主人公と敵がカード上を移動</div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">矢 0</span><span id="conditionState">状態：正常</span>`;

const board=document.getElementById('cardDungeonBoard');
const message=document.getElementById('cardMessage');
const turnBadge=document.getElementById('turnBadge');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');
const floorSlots=[];
const floorCards=[];

function physicalCol(floorIndex,orderIndex){return floors[floorIndex].dir===1?orderIndex:6-orderIndex;}
function cardCol(floorIndex,orderIndex){return physicalCol(floorIndex,orderIndex);}

function eventInfo(data){
  if(data.type==='event'&&data.requires){
    const def=itemDefs[data.requires.item];
    return `<span class="eventBadge">EVENT</span><span class="eventNeed">${def.icon} ${def.name} ×${data.requires.count}</span>`;
  }
  if(data.type==='ladder')return '<span class="eventBadge">↓ ハシゴ</span>';
  if(data.type==='goal')return '<span class="eventBadge">EXIT</span>';
  if(data.type==='monster')return '<span class="threatBadge">ENEMY</span>';
  return '';
}

floors.forEach((floorData,floorIndex)=>{
  const lane=document.createElement('div');
  lane.className=`floorLane${floorData.dir===-1?' reverse':''}`;
  lane.innerHTML=`<span class="floorLabel">${floorData.label} ${floorData.dir===1?'→':'←'}</span>`;
  const slots=[];
  for(let col=0;col<7;col++){
    const slot=document.createElement('div');
    slot.className='cardSlot';slot.dataset.floor=String(floorIndex);slot.dataset.col=String(col);
    lane.appendChild(slot);slots.push(slot);
  }
  floorSlots.push(slots);floorCards.push([]);board.appendChild(lane);

  floorData.cards.forEach((data,orderIndex)=>{
    const col=physicalCol(floorIndex,orderIndex);
    const card=document.createElement('div');
    card.className='mapCard';
    card.dataset.floor=String(floorIndex);card.dataset.order=String(orderIndex);
    card.innerHTML=`<div class="cardFace cardBack">?</div><div class="cardFace cardFront"><div class="dungeonWhite"></div>${eventInfo(data)}<span class="sceneName">${data.name}</span></div>`;
    slots[col].appendChild(card);
    floorCards[floorIndex][orderIndex]=card;
  });
});

const ladderRight=document.createElement('div');ladderRight.className='verticalLadder right';board.appendChild(ladderRight);
const ladderLeft=document.createElement('div');ladderLeft.className='verticalLadder left';board.appendChild(ladderLeft);

const playerToken=document.createElement('div');
playerToken.id='playerToken';playerToken.className='playerToken';playerToken.innerHTML='<span class="tokenLight"></span>';
floorSlots[0][physicalCol(0,0)].appendChild(playerToken);

function setMessage(text){state.status=text;message.textContent=text;document.getElementById('exploreState').textContent=text;}
function renderStatus(){document.getElementById('hpText').textContent=`HP ${state.hp}/${state.maxHp}`;document.getElementById('hpFill').style.width=`${state.hp/state.maxHp*100}%`;document.getElementById('foodValue').textContent=`🍖 ${state.food}`;document.getElementById('ammoState').textContent=`矢 ${state.arrows}`;}

function renderInventory(){
  inventoryGrid.innerHTML='';
  const order=['herb','potion','bread','arrows','rope','key','axe'];
  for(let i=0;i<8;i++){
    const id=order[i];
    const card=document.createElement('div');
    card.className='itemCard';
    if(!id){card.classList.add('empty');inventoryGrid.appendChild(card);continue;}
    const def=itemDefs[id],count=state[def.stateKey];
    card.dataset.item=id;
    card.innerHTML=`<span class="slotIcon">${def.icon}</span><span class="slotName">${def.name}</span><span class="itemCount">${count}</span>`;
    if(count<=0)card.classList.add('empty');
    inventoryGrid.appendChild(card);
  }
}

function renderAbilities(active='弓'){
  abilityGrid.innerHTML='';
  const a=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];
  for(let i=0;i<7;i++){
    const slot=document.createElement('div');slot.className='squareSlot skillSlot';const it=a[i];
    if(!it)slot.classList.add('empty');
    else{if(it[1]===active)slot.classList.add('active');slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;}
    abilityGrid.appendChild(slot);
  }
}

const delay=ms=>new Promise(r=>setTimeout(r,ms));
function revealCard(f,o){const card=floorCards[f][o];if(card&&!card.classList.contains('revealed'))card.classList.add('revealed');}
function markVisited(f,o){floorCards[f][o]?.classList.add('visited');}
function markCurrent(f,o){floorCards[f].forEach(c=>c?.classList.remove('current'));floorCards[f][o]?.classList.add('current');}

async function revealAhead(floorIndex){
  const start=Math.max(0,state.playerOrder);
  const end=Math.min(floors[floorIndex].cards.length-1,state.playerOrder+3);
  for(let i=start;i<=end;i++){
    const card=floorCards[floorIndex][i];
    if(card&&!card.classList.contains('revealed')){revealCard(floorIndex,i);await delay(150);}
  }
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

function slotRect(f,order){
  const col=physicalCol(f,order);
  const br=board.getBoundingClientRect();const sr=floorSlots[f][col].getBoundingClientRect();
  return {left:sr.left-br.left,top:sr.top-br.top,width:sr.width,height:sr.height,x:sr.left-br.left+sr.width/2,y:sr.top-br.top+sr.height/2};
}
function addSlashAt(f,order){const c=slotRect(f,order);const fx=document.createElement('div');fx.className='slashFx';fx.style.left=`${c.x}px`;fx.style.top=`${c.y}px`;board.appendChild(fx);setTimeout(()=>fx.remove(),320);}
function addDamageAt(f,order,text){const c=slotRect(f,order);const fx=document.createElement('div');fx.className='damageFx';fx.textContent=text;fx.style.left=`${c.x}px`;fx.style.top=`${c.y-4}px`;board.appendChild(fx);setTimeout(()=>fx.remove(),700);}
function shake(el){el.classList.remove('cardHit');void el.offsetWidth;el.classList.add('cardHit');setTimeout(()=>el.classList.remove('cardHit'),300);}

function flyProjectile(f,fromOrder,toOrder,type='arrow'){
  return new Promise(resolve=>{
    const from=slotRect(f,fromOrder),to=slotRect(f,toOrder);
    const fx=document.createElement('div');fx.className=`projectileFx ${type}${to.x<from.x?' left':''}`;fx.style.left=`${from.x}px`;fx.style.top=`${from.y}px`;board.appendChild(fx);
    const start=performance.now(),duration=Math.max(240,Math.abs(to.x-from.x)*1.25);
    function frame(now){const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);fx.style.left=`${from.x+(to.x-from.x)*e}px`;fx.style.top=`${from.y+(to.y-from.y)*e}px`;if(t<1)requestAnimationFrame(frame);else{fx.remove();resolve();}}
    requestAnimationFrame(frame);
  });
}

function createBattleMonster(data,f,startOrder){
  const el=document.createElement('div');
  el.className='battleMonsterToken';
  el.innerHTML=`<div class="enemyMiniHp"><i></i></div><div class="enemyFigure"></div><span class="enemyName">${data.name}</span>`;
  board.appendChild(el);
  const battle={el,floorIndex:f,order:startOrder,hp:data.hp,maxHp:data.maxHp,data};
  positionBattleMonster(battle,false);return battle;
}
function positionBattleMonster(battle,animate=true){
  const r=slotRect(battle.floorIndex,battle.order);
  if(!animate)battle.el.style.transition='none';
  battle.el.style.left=`${r.left}px`;battle.el.style.top=`${r.top}px`;battle.el.style.width=`${r.width}px`;battle.el.style.height=`${r.height}px`;
  requestAnimationFrame(()=>{if(!animate)battle.el.style.transition='left .45s cubic-bezier(.2,.8,.2,1),top .45s cubic-bezier(.2,.8,.2,1),width .15s ease,height .15s ease,transform .15s ease,filter .15s ease';});
}
function updateEnemyHp(battle){battle.el.querySelector('.enemyMiniHp i').style.width=`${Math.max(0,battle.hp)/battle.maxHp*100}%`;}

async function playerAttack(battle){
  state.turn++;turnBadge.textContent=`主人公 TURN ${state.turn}`;
  const distance=battle.order-state.playerOrder;
  const adjacent=distance===1;
  if(!adjacent&&state.ranged&&state.arrows>0){
    renderAbilities('弓');setMessage(`遠距離攻撃：${state.ranged.name}`);state.arrows--;renderStatus();renderInventory();
    await flyProjectile(battle.floorIndex,state.playerOrder,battle.order,state.ranged.type);
    battle.hp-=state.ranged.damage;shake(battle.el);addDamageAt(battle.floorIndex,battle.order,`-${state.ranged.damage}`);updateEnemyHp(battle);await delay(360);return;
  }
  if(adjacent){
    renderAbilities('短剣');setMessage(`隣接：${state.melee.name}で攻撃`);addSlashAt(battle.floorIndex,battle.order);shake(battle.el);
    battle.hp-=state.melee.damage;addDamageAt(battle.floorIndex,battle.order,`-${state.melee.damage}`);updateEnemyHp(battle);await delay(430);return;
  }
  setMessage('近接武器しかないため接近を待つ');await delay(420);
}

async function enemyTurn(battle){
  if(battle.hp<=0)return;
  turnBadge.textContent='敵 TURN';
  const distance=battle.order-state.playerOrder;
  if(distance>1){
    setMessage('敵が1カード接近');battle.order--;positionBattleMonster(battle,true);await delay(650);return;
  }
  setMessage('敵の近接攻撃');addSlashAt(battle.floorIndex,state.playerOrder);shake(playerToken);
  const damage=13;state.hp=Math.max(0,state.hp-damage);addDamageAt(battle.floorIndex,state.playerOrder,`-${damage}`);renderStatus();await delay(560);
}

function clearMonsterMarker(f,o){
  const data=floors[f].cards[o];data.defeated=true;
  const card=floorCards[f][o];
  card.querySelector('.threatBadge')?.remove();
  card.querySelector('.sceneName').textContent=data.name+'跡';
  card.classList.add('cleared');
}

async function battleLoop(data,f,o){
  turnBadge.textContent='戦闘';setMessage(`${data.name}を前方に発見`);
  const battle=createBattleMonster(data,f,o);await delay(420);
  while(battle.hp>0&&state.hp>0){
    await playerAttack(battle);if(battle.hp<=0)break;await enemyTurn(battle);
  }
  if(state.hp<=0){setMessage('戦闘不能');document.getElementById('conditionState').textContent='状態：戦闘不能';return false;}
  setMessage(`${data.name}を撃破`);battle.el.classList.add('dead');await delay(500);battle.el.remove();clearMonsterMarker(f,o);turnBadge.textContent='探索';await delay(220);return true;
}

async function movePlayerOne(floorIndex){
  const next=state.playerOrder+1;if(next>=floors[floorIndex].cards.length)return false;
  playerToken.classList.add('moving');await delay(130);
  floorSlots[floorIndex][physicalCol(floorIndex,next)].appendChild(playerToken);
  markVisited(floorIndex,state.playerOrder);
  state.playerOrder=next;markCurrent(floorIndex,state.playerOrder);
  playerToken.classList.remove('moving');await delay(220);return true;
}

function getInventoryCount(itemId){const def=itemDefs[itemId];return state[def.stateKey];}
function consumeInventory(itemId,count){const def=itemDefs[itemId];state[def.stateKey]=Math.max(0,state[def.stateKey]-count);}

async function flyItemCardsToEvent(itemId,count,targetCard){
  const source=document.querySelector(`.itemCard[data-item="${itemId}"]`);
  if(!source)return [];
  const def=itemDefs[itemId];
  const sr=source.getBoundingClientRect();const tr=targetCard.getBoundingClientRect();
  const clones=[];
  for(let i=0;i<count;i++){
    const fly=document.createElement('div');
    fly.className='flyingItemCard';
    fly.innerHTML=`<span class="flyIcon">${def.icon}</span><span class="flyName">${def.name}</span>`;
    Object.assign(fly.style,{left:`${sr.left}px`,top:`${sr.top}px`,width:`${sr.width}px`,height:`${sr.height}px`});
    document.body.appendChild(fly);clones.push(fly);
    await delay(70);
    requestAnimationFrame(()=>{
      const w=Math.max(34,tr.width*.72),h=Math.max(44,tr.height*.72);
      fly.style.left=`${tr.left+tr.width/2-w/2+(i-(count-1)/2)*5}px`;
      fly.style.top=`${tr.top+tr.height/2-h/2+i*3}px`;
      fly.style.width=`${w}px`;fly.style.height=`${h}px`;fly.style.transform=`rotate(${(i-(count-1)/2)*6}deg)`;
    });
  }
  await delay(620);
  clones.forEach(c=>c.classList.add('landed'));
  source.classList.add('used');setTimeout(()=>source.classList.remove('used'),350);
  return clones;
}

async function resolveItemEvent(data,f,o){
  const req=data.requires;
  if(!req||data.cleared)return true;
  const card=floorCards[f][o];const def=itemDefs[req.item];
  turnBadge.textContent='EVENT';card.classList.add('eventActive');
  setMessage(`EVENT：${def.name} ×${req.count} を使用`);
  if(getInventoryCount(req.item)<req.count){
    setMessage(`${def.name}が足りない`);document.getElementById('conditionState').textContent='状態：進行不能';return false;
  }
  const clones=await flyItemCardsToEvent(req.item,req.count,card);
  card.classList.add('eventUnlock');
  const badge=card.querySelector('.eventBadge');if(badge){badge.textContent='解除';badge.classList.add('clear');}
  card.querySelector('.eventNeed')?.classList.add('clear');
  await delay(430);
  if(req.consume)consumeInventory(req.item,req.count);
  data.cleared=true;renderInventory();
  clones.forEach(c=>c.style.opacity='0');await delay(260);clones.forEach(c=>c.remove());
  card.classList.remove('eventActive');turnBadge.textContent='探索';setMessage(`${data.name}を解除`);await delay(250);return true;
}

async function showSimpleEvent(data,card){
  card.classList.add('eventActive');turnBadge.textContent='EVENT';setMessage(`EVENT：${data.eventText||data.name}`);await delay(700);card.classList.remove('eventActive');turnBadge.textContent='探索';
}

async function enterFloor(floorIndex){
  state.floor=floorIndex;state.playerOrder=0;
  playerToken.classList.add('descending');await delay(180);
  floorSlots[floorIndex][physicalCol(floorIndex,0)].appendChild(playerToken);
  playerToken.classList.remove('descending');markCurrent(floorIndex,0);
  setMessage(`${floors[floorIndex].label}：前方3カードを確認`);await revealAhead(floorIndex);await delay(420);
}

async function exploreFloor(floorIndex){
  await enterFloor(floorIndex);
  const floor=floors[floorIndex];
  while(state.playerOrder<floor.cards.length-1){
    await revealAhead(floorIndex);
    const threat=nearestVisibleMonster(floorIndex);
    if(threat){const ok=await battleLoop(threat.data,floorIndex,threat.order);if(!ok)return false;}

    const nextOrder=state.playerOrder+1;
    const nextData=floor.cards[nextOrder];const nextCard=floorCards[floorIndex][nextOrder];

    if(nextData.type==='event'){
      const ok=await resolveItemEvent(nextData,floorIndex,nextOrder);if(!ok)return false;
    }else if(nextData.type==='ladder'||nextData.type==='goal'){
      await showSimpleEvent(nextData,nextCard);
    }

    setMessage('1カード前進');await movePlayerOne(floorIndex);await revealAhead(floorIndex);await delay(350);

    if(nextData.type==='ladder'){setMessage('ハシゴから下へ');await delay(450);return true;}
    if(nextData.type==='goal'){setMessage('出口に到達');await delay(450);return true;}
  }
  return true;
}

async function runExplore(){
  renderStatus();renderInventory();renderAbilities('弓');await delay(400);
  for(let f=0;f<floors.length;f++){
    const ok=await exploreFloor(f);if(!ok)return;
    if(f<floors.length-1){turnBadge.textContent='移動';await delay(260);}
  }
  setMessage('探索完了');document.getElementById('conditionState').textContent='状態：探索完了';turnBadge.textContent='完了';
}

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>{});
runExplore();
