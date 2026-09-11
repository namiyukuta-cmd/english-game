const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:12,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  x:12,y:18,status:'探索開始'
};

const rows=[
  {y:18,dir:'right'},
  {y:50,dir:'left'},
  {y:82,dir:'right'}
];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・暗所探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;

fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div id="dungeonMessage" class="dungeonMessage">灯りを頼りに自動探索</div><div id="dungeonViewport" class="dungeonViewport"><div id="dungeonWorld" class="dungeonWorld"></div></div>`;

fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;

fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">弾 0/20</span><span id="conditionState">状態：正常</span>`;

const viewport=document.getElementById('dungeonViewport');
const world=document.getElementById('dungeonWorld');
const message=document.getElementById('dungeonMessage');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

/* 探索画面はほぼ暗闇。管理パネル側はそのまま。 */
fieldView.style.background='#050608';
viewport.style.background='#050608';
world.style.background='linear-gradient(180deg,#090b0e 0%,#050608 52%,#030405 100%)';
world.style.overflow='hidden';
message.style.opacity='.68';

function makeFloor(row){
  const floor=document.createElement('div');
  floor.className='dungeonFloor';
  floor.style.top=`${row.y}%`;
  floor.style.opacity='.18';
  const hint=document.createElement('span');
  hint.className=`floorHint ${row.dir}`;
  hint.textContent=row.dir==='right'?'→ AUTO':'AUTO ←';
  hint.style.opacity='.22';
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
  el.style.opacity='.14';
  world.appendChild(el);
}
makeLadder(86,18,50);
makeLadder(12,50,82);

const door=document.createElement('div');
door.className='dungeonDoor';
door.style.left='48%';
door.style.top='50%';
door.style.opacity='.18';
door.textContent='鍵扉';
world.appendChild(door);

const goal=document.createElement('div');
goal.className='dungeonGoal';
goal.style.left='88%';
goal.style.top='82%';
goal.style.opacity='.13';
goal.textContent='到達点';
world.appendChild(goal);

/* 人物そのものは見せない。位置の存在だけを極薄いぼけ影で持つ。 */
const playerShadow=document.createElement('div');
Object.assign(playerShadow.style,{
  position:'absolute',
  width:'12px',
  height:'27px',
  transform:'translate(-50%,-100%)',
  borderRadius:'48% 48% 42% 42%',
  background:'rgba(0,0,0,.92)',
  filter:'blur(4px)',
  opacity:'.08',
  zIndex:'30',
  pointerEvents:'none'
});
world.appendChild(playerShadow);

/* 画面上で実際に見えるのは、ほぼこの灯りだけ。 */
const playerLight=document.createElement('div');
Object.assign(playerLight.style,{
  position:'absolute',
  width:'108px',
  height:'108px',
  transform:'translate(-50%,-50%)',
  borderRadius:'50%',
  background:'radial-gradient(circle,rgba(255,201,109,.42) 0%,rgba(255,173,68,.25) 13%,rgba(245,139,42,.11) 31%,rgba(224,113,35,.035) 50%,rgba(0,0,0,0) 72%)',
  mixBlendMode:'screen',
  zIndex:'31',
  pointerEvents:'none',
  opacity:'.88'
});
world.appendChild(playerLight);

const lampCore=document.createElement('div');
Object.assign(lampCore.style,{
  position:'absolute',
  width:'4px',
  height:'6px',
  transform:'translate(-50%,-50%)',
  borderRadius:'2px',
  background:'#ffd88a',
  boxShadow:'0 0 5px rgba(255,220,145,.95),0 0 12px rgba(255,168,64,.85)',
  zIndex:'32',
  pointerEvents:'none'
});
world.appendChild(lampCore);

function centerViewportOn(y){
  const max=Math.max(0,viewport.scrollHeight-viewport.clientHeight);
  const raw=(y/100)*world.scrollHeight-viewport.clientHeight*.46;
  viewport.scrollTop=Math.max(0,Math.min(max,raw));
}

function setPlayer(x,y){
  state.x=x;
  state.y=y;
  playerShadow.style.left=`${x}%`;
  playerShadow.style.top=`${y}%`;

  /* 灯りは手元の位置。人物より少し前・少し上。 */
  playerLight.style.left=`${x+1.9}%`;
  playerLight.style.top=`${y-2.2}%`;
  lampCore.style.left=`${x+1.9}%`;
  lampCore.style.top=`${y-2.2}%`;
  centerViewportOn(y);
}

/* わずかな灯りの揺れ。人物アニメではなく光だけ動かす。 */
let flickerStart=performance.now();
function flicker(now){
  const t=(now-flickerStart)/1000;
  const a=.82+Math.sin(t*7.4)*.035+Math.sin(t*13.7)*.02;
  const s=1+Math.sin(t*5.1)*.018;
  playerLight.style.opacity=String(a);
  playerLight.style.scale=String(s);
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
  const items=[
    ['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],
    ['🏹','矢',state.arrows],['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]
  ];
  for(let i=0;i<8;i++){
    const slot=document.createElement('div');
    slot.className='squareSlot';
    const it=items[i];
    if(!it){
      slot.classList.add('empty');
    }else{
      slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span><span class="itemCount">${it[2]}</span>`;
    }
    inventoryGrid.appendChild(slot);
  }
}

function renderAbilities(){
  abilityGrid.innerHTML='';
  const a=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];
  for(let i=0;i<7;i++){
    const slot=document.createElement('div');
    slot.className='squareSlot skillSlot';
    const it=a[i];
    if(!it){
      slot.classList.add('empty');
    }else{
      slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;
    }
    abilityGrid.appendChild(slot);
  }
}

async function animatePosition(tx,ty,speed=23){
  const sx=state.x,sy=state.y;
  const dx=tx-sx,dy=ty-sy;
  const dist=Math.hypot(dx,dy);
  const duration=Math.max(220,dist/speed*1000);
  const start=performance.now();

  await new Promise(resolve=>{
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      setPlayer(sx+dx*e,sy+dy*e);
      if(t<1)requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

const delay=ms=>new Promise(r=>setTimeout(r,ms));

async function runExplore(){
  setPlayer(12,18);
  renderStatus();
  renderInventory();
  renderAbilities();
  centerViewportOn(18);

  await delay(550);
  setMessage('灯りを頼りに進む');
  await animatePosition(86,18,21);

  setMessage('梯子を降りる');
  await animatePosition(86,50,14);

  setMessage('暗がりの鍵扉を確認');
  await animatePosition(54,50,20);
  if(state.keys>0){
    state.keys-=1;
    door.classList.add('open');
    door.textContent='OPEN';
    door.style.opacity='.11';
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
