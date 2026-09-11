const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={
  hp:88,maxHp:100,food:74,
  arrows:12,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,
  x:12,y:18,dir:1,
  enemyX:56,enemyY:18,enemyAlive:true,
  status:'探索開始'
};

const rows=[
  {y:18,dir:'right'},
  {y:50,dir:'left'},
  {y:82,dir:'right'}
];

const SPOT_AHEAD=18;   // 人物の約2〜3マス前
const SPOT_RADIUS=13;  // スポット判定半径

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・暗所探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;

fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div id="dungeonMessage" class="dungeonMessage">灯りを頼りに自動探索</div><div id="dungeonViewport" class="dungeonViewport"><div id="dungeonWorld" class="dungeonWorld"></div></div>`;

fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;

fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">弾 0/20</span><span id="conditionState">状態：正常</span>`;

const viewport=document.getElementById('dungeonViewport');
const world=document.getElementById('dungeonWorld');
const message=document.getElementById('dungeonMessage');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

fieldView.style.background='#020304';
viewport.style.background='#020304';
world.style.background='linear-gradient(180deg,#07090b 0%,#020304 54%,#010202 100%)';
world.style.overflow='hidden';
message.style.opacity='.72';

const revealables=[];
function registerReveal(el,x,y,dark=.05,lit=1){
  revealables.push({el,x,y,dark,lit});
  el.style.opacity=String(dark);
  el.style.transition='opacity .1s linear,filter .1s linear';
}

rows.forEach(row=>{
  const floor=document.createElement('div');
  floor.className='dungeonFloor';
  floor.style.top=`${row.y}%`;
  floor.style.opacity='.08';
  const hint=document.createElement('span');
  hint.className=`floorHint ${row.dir}`;
  hint.textContent=row.dir==='right'?'→ AUTO':'AUTO ←';
  hint.style.opacity='.09';
  floor.appendChild(hint);
  world.appendChild(floor);
});

function makeLadder(x,y1,y2){
  const el=document.createElement('div');
  el.className='dungeonLadder';
  el.style.left=`${x}%`;
  el.style.top=`${y1}%`;
  el.style.height=`${y2-y1}%`;
  world.appendChild(el);
  registerReveal(el,x,y1,.035,1);
  return el;
}
makeLadder(86,18,50);
makeLadder(12,50,82);

const door=document.createElement('div');
door.className='dungeonDoor';
door.style.left='48%';
door.style.top='50%';
door.textContent='鍵扉';
world.appendChild(door);
registerReveal(door,48,50,.035,1);

const goal=document.createElement('div');
goal.className='dungeonGoal';
goal.style.left='88%';
goal.style.top='82%';
goal.textContent='到達点';
world.appendChild(goal);
registerReveal(goal,88,82,.03,1);

/* 人物はほぼ見えない。 */
const playerShadow=document.createElement('div');
Object.assign(playerShadow.style,{
  position:'absolute',width:'10px',height:'25px',
  transform:'translate(-50%,-100%)',borderRadius:'50%',
  background:'#000',filter:'blur(5px)',opacity:'.012',
  zIndex:'35',pointerEvents:'none'
});
world.appendChild(playerShadow);

/* 手元の小さな灯りだけは見える。 */
const lampCore=document.createElement('div');
Object.assign(lampCore.style,{
  position:'absolute',width:'5px',height:'7px',
  transform:'translate(-50%,-50%)',borderRadius:'2px',
  background:'#fff4cf',
  boxShadow:'0 0 6px rgba(255,245,210,1),0 0 14px rgba(255,184,77,.95)',
  zIndex:'45',pointerEvents:'none'
});
world.appendChild(lampCore);

/* ビームは使わない。前方に丸いスポットライトを置く。 */
const spotLight=document.createElement('div');
Object.assign(spotLight.style,{
  position:'absolute',
  width:'118px',height:'118px',
  transform:'translate(-50%,-50%)',
  borderRadius:'50%',
  background:'radial-gradient(circle,rgba(255,252,232,.96) 0%,rgba(255,239,194,.86) 24%,rgba(255,208,130,.64) 47%,rgba(255,174,81,.38) 66%,rgba(255,144,50,.14) 79%,rgba(0,0,0,0) 100%)',
  boxShadow:'0 0 24px rgba(255,211,132,.42),0 0 46px rgba(255,170,75,.24)',
  mixBlendMode:'screen',
  filter:'blur(1px)',
  zIndex:'40',
  pointerEvents:'none',
  opacity:'1'
});
world.appendChild(spotLight);

/* スポット中心にある床を少し強めに見せる小さい円。 */
const spotCore=document.createElement('div');
Object.assign(spotCore.style,{
  position:'absolute',
  width:'66px',height:'66px',
  transform:'translate(-50%,-50%)',
  borderRadius:'50%',
  background:'radial-gradient(circle,rgba(255,255,244,.78) 0%,rgba(255,235,184,.46) 55%,rgba(0,0,0,0) 100%)',
  mixBlendMode:'screen',
  zIndex:'41',
  pointerEvents:'none',
  opacity:'.95'
});
world.appendChild(spotCore);

/* 敵。暗闇では消え、スポット内に入ると見える。 */
const enemy=document.createElement('div');
Object.assign(enemy.style,{
  position:'absolute',left:`${state.enemyX}%`,top:`${state.enemyY}%`,
  width:'20px',height:'34px',transform:'translate(-50%,-100%)',
  zIndex:'43',opacity:'0',
  transition:'opacity .1s linear,filter .1s linear,transform .35s ease',
  pointerEvents:'none'
});
enemy.innerHTML='<span class="darkEnemyHead"></span><span class="darkEnemyBody"></span>';
world.appendChild(enemy);
Object.assign(enemy.querySelector('.darkEnemyHead').style,{
  position:'absolute',left:'5px',top:'0',width:'10px',height:'10px',
  borderRadius:'50%',background:'#202020'
});
Object.assign(enemy.querySelector('.darkEnemyBody').style,{
  position:'absolute',left:'2px',top:'9px',width:'16px',height:'24px',
  borderRadius:'45% 45% 28% 28%',background:'#202020'
});

function getSpotCenter(){
  return {
    x:state.x+(state.dir*SPOT_AHEAD),
    y:state.y-2.2
  };
}

function isLit(x,y){
  const c=getSpotCenter();
  const dx=x-c.x;
  const dy=(y-c.y)*1.25;
  return Math.hypot(dx,dy)<=SPOT_RADIUS;
}

function updateReveal(){
  revealables.forEach(o=>{
    const lit=isLit(o.x,o.y);
    o.el.style.opacity=String(lit?o.lit:o.dark);
    o.el.style.filter=lit
      ?'brightness(4.5) contrast(1.12) drop-shadow(0 0 10px rgba(255,223,160,.72))'
      :'none';
  });

  if(state.enemyAlive){
    const lit=isLit(state.enemyX,state.enemyY);
    enemy.style.opacity=lit?'1':'0';
    enemy.style.filter=lit
      ?'brightness(4.2) drop-shadow(0 0 10px rgba(255,223,160,.72))'
      :'none';
  }else{
    enemy.style.opacity='0';
  }
}

function centerViewportOn(y){
  const max=Math.max(0,viewport.scrollHeight-viewport.clientHeight);
  const raw=(y/100)*world.scrollHeight-viewport.clientHeight*.46;
  viewport.scrollTop=Math.max(0,Math.min(max,raw));
}

function updateLight(){
  const handX=state.x+(state.dir*1.8);
  const handY=state.y-2.2;
  const c=getSpotCenter();

  lampCore.style.left=`${handX}%`;
  lampCore.style.top=`${handY}%`;

  spotLight.style.left=`${c.x}%`;
  spotLight.style.top=`${c.y}%`;
  spotCore.style.left=`${c.x}%`;
  spotCore.style.top=`${c.y}%`;

  updateReveal();
}

function setPlayer(x,y){
  state.x=x;
  state.y=y;
  playerShadow.style.left=`${x}%`;
  playerShadow.style.top=`${y}%`;
  updateLight();
  centerViewportOn(y);
}

function setDirection(dir){
  state.dir=dir>=0?1:-1;
  updateLight();
}

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

async function animatePosition(tx,ty,speed=22){
  const sx=state.x,sy=state.y;
  const dx=tx-sx,dy=ty-sy;
  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>.2)setDirection(dx);
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

function fireArrow(){
  return new Promise(resolve=>{
    const arrow=document.createElement('div');
    Object.assign(arrow.style,{
      position:'absolute',left:`${state.x+state.dir*2}%`,top:`${state.y-2.2}%`,
      width:'13px',height:'2px',background:'#fff0d0',
      boxShadow:'0 0 6px rgba(255,225,165,.9)',zIndex:'46',pointerEvents:'none'
    });
    world.appendChild(arrow);
    const sx=state.x+state.dir*2;
    const ex=state.enemyX-1;
    const start=performance.now();
    const duration=260;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      arrow.style.left=`${sx+(ex-sx)*t}%`;
      if(t<1)requestAnimationFrame(frame);
      else{arrow.remove();resolve();}
    }
    requestAnimationFrame(frame);
  });
}

async function encounterEnemy(){
  if(!state.enemyAlive)return;
  setMessage('スポットの中に敵');
  await delay(520);
  if(state.arrows>0){
    renderAbilities('弓');
    state.arrows--;
    renderStatus();
    renderInventory();
    setMessage('弓を自動使用');
    await fireArrow();
    enemy.style.opacity='1';
    await delay(100);
    state.enemyAlive=false;
    enemy.style.opacity='0';
    enemy.style.transform='translate(-50%,-100%) translateX(8px) rotate(62deg)';
    setMessage('敵を撃破');
    await delay(450);
  }
}

async function runExplore(){
  setDirection(1);
  setPlayer(12,18);
  renderStatus();
  renderInventory();
  renderAbilities('弓');
  centerViewportOn(18);

  await delay(500);
  setMessage('灯りを頼りに進む');
  await animatePosition(34,18,20);
  await encounterEnemy();

  setMessage('先へ進む');
  await animatePosition(86,18,21);

  setMessage('梯子を降りる');
  await animatePosition(86,50,14);

  setMessage('鍵扉を確認');
  await animatePosition(54,50,20);
  if(state.keys>0){
    state.keys--;
    door.classList.add('open');
    door.textContent='OPEN';
    renderInventory();
    setMessage('鍵を使用');
    await delay(380);
  }

  setMessage('先へ進む');
  await animatePosition(12,50,21);

  setMessage('梯子を降りる');
  await animatePosition(12,82,14);

  setMessage('スポットの先を進む');
  await animatePosition(88,82,21);

  setMessage('探索地点に到達');
  document.getElementById('conditionState').textContent='状態：探索完了';
}

let flickerStart=performance.now();
function flicker(now){
  const t=(now-flickerStart)/1000;
  spotLight.style.opacity=String(.98+Math.sin(t*4.1)*.012);
  spotCore.style.opacity=String(.94+Math.sin(t*5.8)*.018);
  lampCore.style.opacity=String(.95+Math.sin(t*8.9)*.04);
  requestAnimationFrame(flicker);
}
requestAnimationFrame(flicker);

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>centerViewportOn(state.y));

runExplore();