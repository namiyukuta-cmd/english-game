const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:8,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  ranged:{name:'弓',type:'arrow',damage:28},
  melee:{name:'短剣',damage:42},
  turn:0,
  status:'探索開始'
};

const map=[
  {type:'place',name:'林道',icon:'🌲',sub:'薄暗い道'},
  {type:'place',name:'石段',icon:'▤',sub:'下へ続く'},
  {type:'monster',name:'獣',icon:'●',sub:'HP 140',hp:140,maxHp:140},
  {type:'place',name:'物置跡',icon:'□',sub:'調べられる'},
  {type:'place',name:'崩れた廊下',icon:'▥',sub:'足場が悪い'},
  {type:'goal',name:'出口',icon:'◇',sub:'次の場所へ'}
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・カード探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div class="cardRpgView"><div id="cardMessage" class="cardRpgMessage">カードをめくって探索</div><div id="turnBadge" class="turnBadge">探索</div><div id="cardTrack" class="cardTrack"><div class="distanceLine"></div></div><div class="cardRpgHint">カード位置＝距離。敵は自分のターンごとに1カード接近</div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">矢 0</span><span id="conditionState">状態：正常</span>`;

const track=document.getElementById('cardTrack');
const message=document.getElementById('cardMessage');
const turnBadge=document.getElementById('turnBadge');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

const slots=[];
const playerSlot=document.createElement('div');
playerSlot.className='cardSlot';
playerSlot.innerHTML='<div id="playerCard" class="playerCard"><span class="playerLightDot"></span></div>';
track.appendChild(playerSlot);
slots.push(playerSlot);

map.forEach((cardData,i)=>{
  const slot=document.createElement('div');
  slot.className='cardSlot';
  const card=document.createElement('div');
  card.className='mapCard';
  card.dataset.index=String(i+1);
  const frontClass=cardData.type==='monster'?'cardFront monsterFront':'cardFront';
  card.innerHTML=`<div class="cardFace cardBack">?</div><div class="cardFace ${frontClass}"><span class="cardIcon">${cardData.icon}</span><span class="cardName">${cardData.name}</span><span class="cardSub">${cardData.sub}</span></div>`;
  slot.appendChild(card);
  track.appendChild(slot);
  slots.push(slot);
});

const playerCard=document.getElementById('playerCard');

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

function revealCard(index){
  const card=slots[index].querySelector('.mapCard');
  if(!card)return;
  card.classList.add('revealed');
}

function markVisited(index){
  const card=slots[index].querySelector('.mapCard');
  card?.classList.add('visited');
}

function slotCenter(index){
  const trackRect=track.getBoundingClientRect();
  const slotRect=slots[index].getBoundingClientRect();
  return {
    x:slotRect.left-trackRect.left+slotRect.width/2,
    y:slotRect.top-trackRect.top+slotRect.height/2
  };
}

function addSlashAt(index){
  const c=slotCenter(index);
  const fx=document.createElement('div');
  fx.className='slashFx';
  fx.style.left=`${c.x}px`;fx.style.top=`${c.y}px`;
  track.appendChild(fx);
  setTimeout(()=>fx.remove(),320);
}

function addDamageAt(index,text){
  const c=slotCenter(index);
  const fx=document.createElement('div');
  fx.className='damageFx';
  fx.textContent=text;
  fx.style.left=`${c.x}px`;fx.style.top=`${c.y-4}px`;
  track.appendChild(fx);
  setTimeout(()=>fx.remove(),700);
}

function shake(el){
  el.classList.remove('cardHit');void el.offsetWidth;el.classList.add('cardHit');
  setTimeout(()=>el.classList.remove('cardHit'),300);
}

function flyProjectile(fromIndex,toIndex,type='arrow'){
  return new Promise(resolve=>{
    const from=slotCenter(fromIndex),to=slotCenter(toIndex);
    const fx=document.createElement('div');
    fx.className=`projectileFx ${type}`;
    fx.style.left=`${from.x}px`;fx.style.top=`${from.y}px`;
    track.appendChild(fx);
    const start=performance.now(),duration=Math.max(240,Math.abs(to.x-from.x)*1.25);
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const e=1-Math.pow(1-t,3);
      fx.style.left=`${from.x+(to.x-from.x)*e}px`;
      fx.style.top=`${from.y+(to.y-from.y)*e}px`;
      if(t<1)requestAnimationFrame(frame);
      else{fx.remove();resolve();}
    }
    requestAnimationFrame(frame);
  });
}

function createBattleMonster(data,startIndex){
  const el=document.createElement('div');
  el.className='battleMonster';
  el.innerHTML=`<div class="enemyMiniHp"><i></i></div><span class="cardIcon">${data.icon}</span><span class="cardName">${data.name}</span>`;
  track.appendChild(el);
  const battle={el,index:startIndex,hp:data.hp,maxHp:data.maxHp,data};
  positionBattleMonster(battle,false);
  return battle;
}

function positionBattleMonster(battle,animate=true){
  const slot=slots[battle.index];
  const tr=track.getBoundingClientRect();
  const sr=slot.getBoundingClientRect();
  if(!animate)battle.el.style.transition='none';
  battle.el.style.left=`${sr.left-tr.left}px`;
  requestAnimationFrame(()=>{if(!animate)battle.el.style.transition='left .45s cubic-bezier(.2,.8,.2,1),transform .15s ease,filter .15s ease';});
}

function updateEnemyHp(battle){
  battle.el.querySelector('.enemyMiniHp i').style.width=`${Math.max(0,battle.hp)/battle.maxHp*100}%`;
}

async function playerAttack(battle){
  state.turn++;
  turnBadge.textContent=`主人公 TURN ${state.turn}`;
  const adjacent=battle.index===1;

  if(!adjacent && state.ranged && state.arrows>0){
    renderAbilities('弓');
    setMessage(`遠距離攻撃：${state.ranged.name}`);
    state.arrows--;
    renderStatus();renderInventory();
    await flyProjectile(0,battle.index,state.ranged.type);
    battle.hp-=state.ranged.damage;
    shake(battle.el);addDamageAt(battle.index,`-${state.ranged.damage}`);updateEnemyHp(battle);
    await delay(360);
    return;
  }

  if(adjacent){
    renderAbilities('短剣');
    setMessage(`隣接：${state.melee.name}で攻撃`);
    addSlashAt(1);shake(battle.el);
    battle.hp-=state.melee.damage;
    addDamageAt(1,`-${state.melee.damage}`);updateEnemyHp(battle);
    await delay(430);
    return;
  }

  setMessage('近接武器しかないため接近を待つ');
  await delay(420);
}

async function enemyTurn(battle){
  if(battle.hp<=0)return;
  turnBadge.textContent='敵 TURN';

  if(battle.index>1){
    setMessage('敵が1カード接近');
    battle.index--;
    positionBattleMonster(battle,true);
    await delay(650);
    return;
  }

  setMessage('敵の近接攻撃');
  addSlashAt(0);shake(playerCard);
  const damage=13;
  state.hp=Math.max(0,state.hp-damage);
  addDamageAt(0,`-${damage}`);
  renderStatus();
  await delay(560);
}

async function battleLoop(data,mapIndex){
  turnBadge.textContent='戦闘';
  setMessage(`${data.name}と遭遇`);
  const sourceCard=slots[mapIndex].querySelector('.mapCard');
  sourceCard.style.opacity='.32';
  const battle=createBattleMonster(data,mapIndex);
  await delay(500);

  while(battle.hp>0 && state.hp>0){
    await playerAttack(battle);
    if(battle.hp<=0)break;
    await enemyTurn(battle);
  }

  if(state.hp<=0){
    setMessage('戦闘不能');
    document.getElementById('conditionState').textContent='状態：戦闘不能';
    return false;
  }

  setMessage(`${data.name}を撃破`);
  battle.el.classList.add('dead');
  sourceCard.style.opacity='1';
  sourceCard.querySelector('.cardSub').textContent='撃破済み';
  await delay(650);
  battle.el.remove();
  turnBadge.textContent='探索';
  return true;
}

async function runExplore(){
  renderStatus();renderInventory();renderAbilities('弓');
  await delay(500);

  for(let i=1;i<slots.length;i++){
    const data=map[i-1];
    setMessage(`カード${i}をめくる`);
    revealCard(i);
    await delay(760);

    if(data.type==='monster'){
      const ok=await battleLoop(data,i);
      if(!ok)return;
    }else{
      setMessage(`${data.name}を発見`);
      await delay(520);
    }

    markVisited(i);
    await delay(180);
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
