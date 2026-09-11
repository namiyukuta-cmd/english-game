const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:8,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  ranged:{name:'弓',type:'arrow',damage:28},
  melee:{name:'短剣',damage:42},
  turn:0,status:'探索開始',floor:0
};

/*
  各階は「入口の主人公カード1枚＋探索カード6枚」。
  上段は左→右、中段は右→左、下段は左→右。
*/
const floors=[
  {
    dir:1,label:'上層',
    cards:[
      {type:'place',name:'林道',icon:'🌲',sub:'薄暗い道'},
      {type:'place',name:'崩れ壁',icon:'▤',sub:'狭い通路'},
      {type:'monster',name:'獣',icon:'●',sub:'HP 100',hp:100,maxHp:100},
      {type:'place',name:'物置跡',icon:'□',sub:'調べられる'},
      {type:'place',name:'石扉',icon:'▥',sub:'古い扉'},
      {type:'ladder',name:'ハシゴ',icon:'🪜',sub:'下へ降りる'}
    ]
  },
  {
    dir:-1,label:'地下1階',
    cards:[
      {type:'place',name:'地下道',icon:'▥',sub:'右から左へ'},
      {type:'place',name:'木箱',icon:'▣',sub:'古い荷物'},
      {type:'monster',name:'骸骨',icon:'◉',sub:'HP 92',hp:92,maxHp:92},
      {type:'place',name:'鉄扉',icon:'▤',sub:'錆びている'},
      {type:'place',name:'水場',icon:'≈',sub:'足元が濡れる'},
      {type:'ladder',name:'ハシゴ',icon:'🪜',sub:'さらに下へ'}
    ]
  },
  {
    dir:1,label:'地下2階',
    cards:[
      {type:'place',name:'坑道',icon:'◇',sub:'細い通路'},
      {type:'place',name:'宝箱',icon:'▣',sub:'調べられる'},
      {type:'place',name:'岩場',icon:'▲',sub:'崩れかけ'},
      {type:'place',name:'広間',icon:'○',sub:'静かな空間'},
      {type:'place',name:'門',icon:'▥',sub:'出口の手前'},
      {type:'goal',name:'出口',icon:'◇',sub:'次の場所へ'}
    ]
  }
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・カード探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div class="cardRpgView"><div id="cardMessage" class="cardRpgMessage">カードをめくって探索</div><div id="turnBadge" class="turnBadge">探索</div><div id="cardDungeonBoard" class="cardDungeonBoard"></div><div class="cardRpgHint">上段→ハシゴ↓→中段←→ハシゴ↓→下段→</div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">矢 0</span><span id="conditionState">状態：正常</span>`;

const board=document.getElementById('cardDungeonBoard');
const message=document.getElementById('cardMessage');
const turnBadge=document.getElementById('turnBadge');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

const floorSlots=[];
const floorCards=[];

function physicalCol(floorIndex,cardOrderIndex){
  return floors[floorIndex].dir===1 ? cardOrderIndex+1 : 5-cardOrderIndex;
}
function entryCol(floorIndex){return floors[floorIndex].dir===1?0:6;}

floors.forEach((floorData,floorIndex)=>{
  const lane=document.createElement('div');
  lane.className=`floorLane${floorData.dir===-1?' reverse':''}`;
  lane.dataset.floor=String(floorIndex);
  lane.innerHTML=`<span class="floorLabel">${floorData.label} ${floorData.dir===1?'→':'←'}</span>`;

  const slots=[];
  for(let col=0;col<7;col++){
    const slot=document.createElement('div');
    slot.className='cardSlot';
    slot.dataset.floor=String(floorIndex);
    slot.dataset.col=String(col);
    lane.appendChild(slot);
    slots.push(slot);
  }
  floorSlots.push(slots);
  floorCards.push([]);
  board.appendChild(lane);

  floorData.cards.forEach((cardData,orderIndex)=>{
    const col=physicalCol(floorIndex,orderIndex);
    const card=document.createElement('div');
    card.className='mapCard';
    card.dataset.floor=String(floorIndex);
    card.dataset.col=String(col);
    card.dataset.order=String(orderIndex);
    let frontClass='cardFront';
    if(cardData.type==='monster')frontClass+=' monsterFront';
    if(cardData.type==='ladder')frontClass+=' ladderFront';
    if(cardData.type==='goal')frontClass+=' goalFront';
    card.innerHTML=`<div class="cardFace cardBack">?</div><div class="cardFace ${frontClass}"><span class="cardIcon">${cardData.icon}</span><span class="cardName">${cardData.name}</span><span class="cardSub">${cardData.sub}</span></div>`;
    slots[col].appendChild(card);
    floorCards[floorIndex][orderIndex]=card;
  });
});

const ladderRight=document.createElement('div');
ladderRight.className='verticalLadder right';
board.appendChild(ladderRight);
const ladderLeft=document.createElement('div');
ladderLeft.className='verticalLadder left';
board.appendChild(ladderLeft);

const playerCard=document.createElement('div');
playerCard.id='playerCard';
playerCard.className='playerCard';
playerCard.innerHTML='<span class="playerLightDot"></span>';
floorSlots[0][entryCol(0)].appendChild(playerCard);

function setMessage(text){
  state.status=text;
  message.textContent=text;
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
  const items=[['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],['🏹','矢',state.arrows],['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]];
  for(let i=0;i<8;i++){
    const slot=document.createElement('div');slot.className='squareSlot';
    const it=items[i];
    if(!it)slot.classList.add('empty');
    else slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span><span class="itemCount">${it[2]}</span>`;
    inventoryGrid.appendChild(slot);
  }
}

function renderAbilities(active='弓'){
  abilityGrid.innerHTML='';
  const a=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];
  for(let i=0;i<7;i++){
    const slot=document.createElement('div');slot.className='squareSlot skillSlot';
    const it=a[i];
    if(!it)slot.classList.add('empty');
    else{
      if(it[1]===active)slot.classList.add('active');
      slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;
    }
    abilityGrid.appendChild(slot);
  }
}

const delay=ms=>new Promise(r=>setTimeout(r,ms));

function revealCard(floorIndex,orderIndex){floorCards[floorIndex][orderIndex]?.classList.add('revealed');}
function markVisited(floorIndex,orderIndex){floorCards[floorIndex][orderIndex]?.classList.add('visited');}

function slotRect(floorIndex,col){
  const br=board.getBoundingClientRect();
  const sr=floorSlots[floorIndex][col].getBoundingClientRect();
  return {left:sr.left-br.left,top:sr.top-br.top,width:sr.width,height:sr.height,x:sr.left-br.left+sr.width/2,y:sr.top-br.top+sr.height/2};
}

function addSlashAt(floorIndex,col){
  const c=slotRect(floorIndex,col);
  const fx=document.createElement('div');fx.className='slashFx';
  fx.style.left=`${c.x}px`;fx.style.top=`${c.y}px`;board.appendChild(fx);
  setTimeout(()=>fx.remove(),320);
}

function addDamageAt(floorIndex,col,text){
  const c=slotRect(floorIndex,col);
  const fx=document.createElement('div');fx.className='damageFx';fx.textContent=text;
  fx.style.left=`${c.x}px`;fx.style.top=`${c.y-4}px`;board.appendChild(fx);
  setTimeout(()=>fx.remove(),700);
}

function shake(el){el.classList.remove('cardHit');void el.offsetWidth;el.classList.add('cardHit');setTimeout(()=>el.classList.remove('cardHit'),300);}

function flyProjectile(floorIndex,fromCol,toCol,type='arrow'){
  return new Promise(resolve=>{
    const from=slotRect(floorIndex,fromCol),to=slotRect(floorIndex,toCol);
    const fx=document.createElement('div');
    fx.className=`projectileFx ${type}${to.x<from.x?' left':''}`;
    fx.style.left=`${from.x}px`;fx.style.top=`${from.y}px`;board.appendChild(fx);
    const start=performance.now(),duration=Math.max(240,Math.abs(to.x-from.x)*1.25);
    function frame(now){
      const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);
      fx.style.left=`${from.x+(to.x-from.x)*e}px`;
      fx.style.top=`${from.y+(to.y-from.y)*e}px`;
      if(t<1)requestAnimationFrame(frame);else{fx.remove();resolve();}
    }
    requestAnimationFrame(frame);
  });
}

function createBattleMonster(data,floorIndex,startCol){
  const el=document.createElement('div');
  el.className='battleMonster';
  el.innerHTML=`<div class="enemyMiniHp"><i></i></div><span class="cardIcon">${data.icon}</span><span class="cardName">${data.name}</span>`;
  board.appendChild(el);
  const battle={el,floorIndex,col:startCol,hp:data.hp,maxHp:data.maxHp,data};
  positionBattleMonster(battle,false);
  return battle;
}

function positionBattleMonster(battle,animate=true){
  const r=slotRect(battle.floorIndex,battle.col);
  if(!animate)battle.el.style.transition='none';
  battle.el.style.left=`${r.left}px`;battle.el.style.top=`${r.top}px`;
  battle.el.style.width=`${r.width}px`;battle.el.style.height=`${r.height}px`;
  requestAnimationFrame(()=>{if(!animate)battle.el.style.transition='left .45s cubic-bezier(.2,.8,.2,1),top .45s cubic-bezier(.2,.8,.2,1),transform .15s ease,filter .15s ease';});
}

function updateEnemyHp(battle){battle.el.querySelector('.enemyMiniHp i').style.width=`${Math.max(0,battle.hp)/battle.maxHp*100}%`;}

async function playerAttack(battle){
  state.turn++;
  turnBadge.textContent=`主人公 TURN ${state.turn}`;
  const pCol=entryCol(battle.floorIndex);
  const distance=Math.abs(battle.col-pCol);
  const adjacent=distance===1;

  if(!adjacent && state.ranged && state.arrows>0){
    renderAbilities('弓');setMessage(`遠距離攻撃：${state.ranged.name}`);
    state.arrows--;renderStatus();renderInventory();
    await flyProjectile(battle.floorIndex,pCol,battle.col,state.ranged.type);
    battle.hp-=state.ranged.damage;
    shake(battle.el);addDamageAt(battle.floorIndex,battle.col,`-${state.ranged.damage}`);updateEnemyHp(battle);
    await delay(360);return;
  }

  if(adjacent){
    renderAbilities('短剣');setMessage(`隣接：${state.melee.name}で攻撃`);
    addSlashAt(battle.floorIndex,battle.col);shake(battle.el);
    battle.hp-=state.melee.damage;
    addDamageAt(battle.floorIndex,battle.col,`-${state.melee.damage}`);updateEnemyHp(battle);
    await delay(430);return;
  }

  setMessage('近接武器しかないため接近を待つ');
  await delay(420);
}

async function enemyTurn(battle){
  if(battle.hp<=0)return;
  turnBadge.textContent='敵 TURN';
  const pCol=entryCol(battle.floorIndex);
  const distance=Math.abs(battle.col-pCol);

  if(distance>1){
    setMessage('敵が1カード接近');
    battle.col+=battle.col>pCol?-1:1;
    positionBattleMonster(battle,true);
    await delay(650);return;
  }

  setMessage('敵の近接攻撃');
  addSlashAt(battle.floorIndex,pCol);shake(playerCard);
  const damage=13;
  state.hp=Math.max(0,state.hp-damage);
  addDamageAt(battle.floorIndex,pCol,`-${damage}`);renderStatus();
  await delay(560);
}

async function battleLoop(data,floorIndex,orderIndex){
  const col=physicalCol(floorIndex,orderIndex);
  turnBadge.textContent='戦闘';setMessage(`${data.name}と遭遇`);
  const sourceCard=floorCards[floorIndex][orderIndex];
  sourceCard.style.opacity='.30';
  const battle=createBattleMonster(data,floorIndex,col);
  await delay(450);

  while(battle.hp>0&&state.hp>0){
    await playerAttack(battle);
    if(battle.hp<=0)break;
    await enemyTurn(battle);
  }

  if(state.hp<=0){
    setMessage('戦闘不能');document.getElementById('conditionState').textContent='状態：戦闘不能';
    return false;
  }

  setMessage(`${data.name}を撃破`);
  battle.el.classList.add('dead');
  sourceCard.style.opacity='1';
  sourceCard.querySelector('.cardSub').textContent='撃破済み';
  await delay(620);battle.el.remove();turnBadge.textContent='探索';
  return true;
}

async function movePlayerToFloor(floorIndex){
  if(state.floor===floorIndex&&playerCard.parentElement===floorSlots[floorIndex][entryCol(floorIndex)])return;
  playerCard.classList.add('descending');
  await delay(240);
  floorSlots[floorIndex][entryCol(floorIndex)].appendChild(playerCard);
  state.floor=floorIndex;
  playerCard.classList.remove('descending');
  await delay(250);
}

async function exploreFloor(floorIndex){
  const floor=floors[floorIndex];
  await movePlayerToFloor(floorIndex);
  setMessage(`${floor.label}を${floor.dir===1?'右':'左'}へ探索`);
  await delay(350);

  for(let i=0;i<floor.cards.length;i++){
    const data=floor.cards[i];
    setMessage(`${data.name}カードをめくる`);
    revealCard(floorIndex,i);
    await delay(650);

    if(data.type==='monster'){
      const ok=await battleLoop(data,floorIndex,i);
      if(!ok)return false;
    }else if(data.type==='ladder'){
      setMessage('ハシゴを発見・下へ降りる');
      await delay(650);
    }else if(data.type==='goal'){
      setMessage('出口を発見');
      await delay(520);
    }else{
      setMessage(`${data.name}を確認`);
      await delay(400);
    }
    markVisited(floorIndex,i);
    await delay(120);
  }
  return true;
}

async function runExplore(){
  renderStatus();renderInventory();renderAbilities('弓');
  state.floor=0;
  await delay(450);

  for(let f=0;f<floors.length;f++){
    const ok=await exploreFloor(f);
    if(!ok)return;
    if(f<floors.length-1){
      turnBadge.textContent='移動';
      setMessage('ハシゴで下の階へ');
      await movePlayerToFloor(f+1);
      turnBadge.textContent='探索';
    }
  }

  setMessage('探索地点をすべて確認');
  document.getElementById('conditionState').textContent='状態：探索完了';
  turnBadge.textContent='完了';
}

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>{});

runExplore();
