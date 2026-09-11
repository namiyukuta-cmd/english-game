const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:12,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  x:12,y:18,dir:1,status:'探索開始',
  enemyX:61,enemyY:18,enemyAlive:true
};

const rows=[
  {y:18,dir:'right'},
  {y:50,dir:'left'},
  {y:82,dir:'right'}
];

const LIGHT_RANGE=24; // 約3マス分。1マス≈8%

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・暗所探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div id="dungeonMessage" class="dungeonMessage">灯りを頼りに自動探索</div><div id="dungeonViewport" class="dungeonViewport"><div id="dungeonWorld" class="dungeonWorld"></div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">弾 0/20</span><span id="conditionState">状態：正常</span>`;

const viewport=document.getElementById('dungeonViewport');
const world=document.getElementById('dungeonWorld');
const message=document.getElementById('dungeonMessage');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

fieldView.style.background='#040506';
viewport.style.background='#040506';
world.style.background='linear-gradient(180deg,#080a0c 0%,#040506 52%,#020303 100%)';
world.style.overflow='hidden';
message.style.opacity='.68';

function makeFloor(row){
  const floor=document.createElement('div');
  floor.className='dungeonFloor';
  floor.style.top=`${row.y}%`;
  floor.style.opacity='.12';
  const hint=document.createElement('span');
  hint.className=`floorHint ${row.dir}`;
  hint.textContent=row.dir==='right'?'→ AUTO':'AUTO ←';
  hint.style.opacity='.15';
  floor.appendChild(hint);
  world.appendChild(floor);
}
rows.forEach(makeFloor);

function makeLadder(x,y1,y2){
  const el=document.createElement('div');
  el.className='dungeonLadder';
  el.style.left=`${x}%`;
  el.style.top=`${y1}%`;
  el.style.height=`${y2-y1}%`;
  el.style.opacity='.10';
  world.appendChild(el);
}
makeLadder(86,18,50);
makeLadder(12,50,82);

const door=document.createElement('div');
door.className='dungeonDoor';
door.style.left='48%';
door.style.top='50%';
door.style.opacity='.11';
door.textContent='鍵扉';
world.appendChild(door);

const goal=document.createElement('div');
goal.className='dungeonGoal';
goal.style.left='88%';
goal.style.top='82%';
goal.style.opacity='.08';
goal.textContent='到達点';
world.appendChild(goal);

/* 人物はほぼ見えない影だけ。 */
const playerShadow=document.createElement('div');
Object.assign(playerShadow.style,{
  position:'absolute',width:'12px',height:'27px',
  transform:'translate(-50%,-100%)',borderRadius:'48% 48% 42% 42%',
  background:'rgba(0,0,0,.96)',filter:'blur(4px)',opacity:'.035',
  zIndex:'30',pointerEvents:'none'
});
world.appendChild(playerShadow);

/* 手元の灯り。 */
const playerLight=document.createElement('div');
Object.assign(playerLight.style,{
  position:'absolute',width:'74px',height:'74px',
  transform:'translate(-50%,-50%)',borderRadius:'50%',
  background:'radial-gradient(circle,rgba(255,214,135,.48) 0%,rgba(255,176,72,.22) 18%,rgba(245,135,40,.07) 43%,rgba(0,0,0,0) 72%)',
  mixBlendMode:'screen',zIndex:'31',pointerEvents:'none',opacity:'.88'
});
world.appendChild(playerLight);

/* 前方2〜3マスだけを照らす光。 */
const playerBeam=document.createElement('div');
Object.assign(playerBeam.style,{
  position:'absolute',width:`${LIGHT_RANGE}%`,height:'74px',
  transform:'translate(0,-50%)',
  clipPath:'polygon(0 42%,100% 5%,100% 95%,0 58%)',
  background:'linear-gradient(90deg,rgba(255,210,126,.22) 0%,rgba(255,177,78,.13) 28%,rgba(255,146,52,.065) 58%,rgba(0,0,0,0) 100%)',
  filter:'blur(6px)',mixBlendMode:'screen',zIndex:'29',pointerEvents:'none',opacity:'.96'
});
world.appendChild(playerBeam);

const lampCore=document.createElement('div');
Object.assign(lampCore.style,{
  position:'absolute',width:'4px',height:'6px',
  transform:'translate(-50%,-50%)',borderRadius:'2px',background:'#ffd88a',
  boxShadow:'0 0 5px rgba(255,220,145,.95),0 0 12px rgba(255,168,64,.85)',
  zIndex:'32',pointerEvents:'none'
});
world.appendChild(lampCore);

/* 敵。暗闇ではほぼ見えず、ライトに入った時だけ姿が浮く。 */
const enemy=document.createElement('div');
Object.assign(enemy.style,{
  position:'absolute',left:`${state.enemyX}%`,top:`${state.enemyY}%`,
  width:'18px',height:'31px',transform:'translate(-50%,-100%)',
  zIndex:'28',opacity:'.025',transition:'opacity .16s linear, filter .16s linear',
  pointerEvents:'none'
});
enemy.innerHTML='<span class="darkEnemyHead"></span><span class="darkEnemyBody"></span>';
world.appendChild(enemy);

const enemyHead=enemy.querySelector('.darkEnemyHead');
Object.assign(enemyHead.style,{
  position:'absolute',left:'5px',top:'0',width:'9px',height:'9px',
  borderRadius:'50%',background:'#050505'
});
const enemyBody=enemy.querySelector('.darkEnemyBody');
Object.assign(enemyBody.style,{
  position:'absolute',left:'3px',top:'8px',width:'12px',height:'22px',
  borderRadius:'45% 45% 30% 30%',background:'#050505'
});

function centerViewportOn(y){
  const max=Math.max(0,viewport.scrollHeight-viewport.clientHeight);
  const raw=(y/100)*world.scrollHeight-viewport.clientHeight*.46;
  viewport.scrollTop=Math.max(0,Math.min(max,raw));
}

function updateBeam(){
  const handX=state.x+(state.dir*1.8);
  const handY=state.y-2.1;

  playerLight.style.left=`${handX}%`;
  playerLight.style.top=`${handY}%`;
  lampCore.style.left=`${handX}%`;
  lampCore.style.top=`${handY}%`;
  playerBeam.style.top=`${handY}%`;

  if(state.dir>0){
    playerBeam.style.left=`${handX}%`;
    playerBeam.style.transform='translate(0,-50%)';
    playerBeam.style.background='linear-gradient(90deg,rgba(255,210,126,.22) 0%,rgba(255,177,78,.13) 28%,rgba(255,146,52,.065) 58%,rgba(0,0,0,0) 100%)';
  }else{
    playerBeam.style.left=`${handX}%`;
    playerBeam.style.transform='translate(-100%,-50%)';
    playerBeam.style.background='linear-gradient(270deg,rgba(255,210,126,.22) 0%,rgba(255,177,78,.13) 28%,rgba(255,146,52,.065) 58%,rgba(0,0,0,0) 100%)';
  }

  updateEnemyVisibility();
}

function updateEnemyVisibility(){
  if(!state.enemyAlive){
    enemy.style.opacity='0';
    return;
  }
  const sameRow=Math.abs(state.enemyY-state.y)<3.4;
  const ahead=(state.enemyX-state.x)*state.dir;
  const lit=sameRow && ahead>0 && ahead<=LIGHT_RANGE+2;
  enemy.style.opacity=lit?'.78':'.025';
  enemy.style.filter=lit?'drop-shadow(0 0 5px rgba(255,177,86,.18))':'none';
}

function setPlayer(x,y){
  state.x=x;state.y=y;
  playerShadow.style.left=`${x}%`;
  playerShadow.style.top=`${y}%`;
  updateBeam();
  centerViewportOn(y);
}

function setDirection(dir){
  state.dir=dir>=0?1:-1;
  updateBeam();
}

let flickerStart=performance.now();
function flicker(now){
  const t=(now-flickerStart)/1000;
  const a=.84+Math.sin(t*7.4)*.035+Math.sin(t*13.7)*.02;
  const s=1+Math.sin(t*5.1)*.018;
  playerLight.style.opacity=String(a);
  playerLight.style.scale=String(s);
  playerBeam.style.opacity=String(.92+Math.sin(t*4.4)*.025);
  lampCore.style.opacity=String(.9+Math.sin(t*9.6)*.07);
  requestAnimationFrame(flicker);
}
requestAnimationFrame(flicker);

function setMessage(text){
  state.status=text;
  message.textContent=text;
  document.getElementById('exploreState').textContent=text;
}

function renderStatus(){
  document.getElementById('hpText').textContent=`HP ${state.hp}/${state.maxHp}`;
  document.getElementById('hpFill').style.width=`${state.hp/state.maxHp*100}%`;
  document.getElementById('foodValue').textContent=`🍖 ${state.food}`;
  document.getElementById('ammoState').textContent=`弾 ${state.arrows}/20`;
}

function renderInventory(){
  inventoryGrid.innerHTML='';
  const items=[['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],['🏹','矢',state.arrows],['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]];
  for(let i=0;i<8;i++){
    const slot=document.createElement('div');
    slot.className='squareSlot';
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
    const slot=document.createElement('div');
    slot.className='squareSlot skillSlot';
    const it=a[i];
    if(!it)slot.classList.add('empty');
    else{
      if(it[1]===active)slot.classList.add('active');
      slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;
    }
    abilityGrid.appendChild(slot);
  }
}

async function animatePosition(tx,ty,speed=23){
  const sx=state.x,sy=state.y,dx=tx-sx,dy=ty-sy;
  if(Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>.2)setDirection(dx);
  const dist=Math.hypot(dx,dy);
  const duration=Math.max(220,dist/speed*1000);
  const start=performance.now();
  await new Promise(resolve=>{
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      setPlayer(sx+dx*e,sy+dy*e);
      if(t<1)requestAnimationFrame(frame);else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function fireArrow(){
  return new Promise(resolve=>{
    const arrow=document.createElement('div');
    Object.assign(arrow.style,{
      position:'absolute',left:`${state.x+2}%`,top:`${state.y-2.2}%`,
      width:'12px',height:'2px',background:'#d8c8a8',borderRadius:'2px',
      boxShadow:'0 0 4px rgba(255,214,145,.55)',zIndex:'33',pointerEvents:'none'
    });
    world.appendChild(arrow);
    const startX=state.x+2,endX=state.enemyX-1,start=performance.now(),duration=280;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      arrow.style.left=`${startX+(endX-startX)*t}%`;
      if(t<1)requestAnimationFrame(frame);
      else{arrow.remove();resolve();}
    }
    requestAnimationFrame(frame);
  });
}

const delay=ms=>new Promise(r=>setTimeout(r,ms));

async function encounterEnemy(){
  if(!state.enemyAlive)return;
  setMessage('ライトの先に敵を発見');
  await delay(520);
  if(state.arrows>0){
    renderAbilities('弓');
    setMessage('弓を自動使用');
    state.arrows-=1;
    renderStatus();
    renderInventory();
    await fireArrow();
    enemy.style.opacity='1';
    enemy.style.filter='drop-shadow(0 0 7px rgba(255,186,96,.30))';
    await delay(110);
    state.enemyAlive=false;
    enemy.style.transition='opacity .45s ease, transform .45s ease';
    enemy.style.opacity='0';
    enemy.style.transform='translate(-50%,-100%) translateX(8px) rotate(58deg)';
    setMessage('敵を撃破');
    await delay(520);
  }
}

async function runExplore(){
  setDirection(1);
  setPlayer(12,18);
  renderStatus();renderInventory();renderAbilities('弓');
  centerViewportOn(18);

  await delay(550);
  setMessage('灯りを頼りに進む');
  await animatePosition(38,18,20);
  await encounterEnemy();

  setMessage('先へ進む');
  await animatePosition(86,18,21);

  setMessage('梯子を降りる');
  await animatePosition(86,50,14);

  setMessage('暗がりの鍵扉を確認');
  await animatePosition(54,50,20);
  if(state.keys>0){
    state.keys-=1;
    door.classList.add('open');
    door.textContent='OPEN';
    door.style.opacity='.09';
    renderInventory();
    setMessage('鍵を使用');
    await delay(420);
  }

  setMessage('先へ進む');
  await animatePosition(12,50,21);

  setMessage('梯子を降りる');
  await animatePosition(12,82,14);

  setMessage('灯りの届く範囲だけを進む');
  await animatePosition(88,82,21);

  setMessage('探索地点に到達');
  document.getElementById('conditionState').textContent='状態：探索完了';
}

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>centerViewportOn(state.y));

runExplore();
