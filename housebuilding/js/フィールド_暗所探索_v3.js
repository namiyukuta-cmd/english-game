const fieldTop=document.getElementById('fieldTop');
const fieldView=document.getElementById('fieldView');
const fieldPanel=document.getElementById('fieldPanel');
const fieldBottom=document.getElementById('fieldBottom');

const state={hp:88,maxHp:100,food:74,arrows:12,herb:3,potion:1,bread:2,rope:1,keys:1,axe:1,x:12,y:18,dir:1,enemyX:56,enemyY:18,enemyAlive:true,status:'探索開始'};
const LIGHT_RANGE=24; // 約3マス（1マス≈8%）
const rows=[{y:18,dir:'right'},{y:50,dir:'left'},{y:82,dir:'right'}];

fieldTop.innerHTML=`<div class="topMenuRow"><strong class="topPlace">森・暗所探索</strong><button id="fieldLog" class="topMenuButton" type="button">LOG</button><button id="fieldSave" class="topMenuButton" type="button">SAVE</button><button id="fieldMenu" class="topMenuButton" type="button">MENU</button></div>`;
fieldView.innerHTML=`<button id="backToShop" class="fieldEdge" type="button" aria-label="店があるマップへ戻る">◀</button><div id="dungeonMessage" class="dungeonMessage">灯りを頼りに自動探索</div><div id="dungeonViewport" class="dungeonViewport"><div id="dungeonWorld" class="dungeonWorld"></div></div>`;
fieldPanel.innerHTML=`<div class="panelStatus"><div class="hpWrap"><span id="hpText" class="hpText"></span><div class="hpBar"><div id="hpFill" class="hpFill"></div></div></div><span id="foodValue" class="foodValue"></span></div><div class="slotLine"><div class="slotLabel">持ち物</div><div id="inventoryGrid" class="slotGrid"></div></div><div class="slotLine"><div class="slotLabel">装備<br>スキル</div><div id="abilityGrid" class="slotGrid"></div></div>`;
fieldBottom.innerHTML=`<span id="exploreState">探索中</span><span id="ammoState">弾 0/20</span><span id="conditionState">状態：正常</span>`;

const viewport=document.getElementById('dungeonViewport');
const world=document.getElementById('dungeonWorld');
const message=document.getElementById('dungeonMessage');
const inventoryGrid=document.getElementById('inventoryGrid');
const abilityGrid=document.getElementById('abilityGrid');

fieldView.style.background='#030405';
viewport.style.background='#030405';
world.style.background='linear-gradient(180deg,#07090b 0%,#030405 54%,#020303 100%)';
world.style.overflow='hidden';
message.style.opacity='.72';

const revealables=[];
function registerReveal(el,x,y,dark=.10,lit=.72){revealables.push({el,x,y,dark,lit});el.style.opacity=String(dark);el.style.transition='opacity .12s linear,filter .12s linear';}

rows.forEach(row=>{
  const floor=document.createElement('div');
  floor.className='dungeonFloor';
  floor.style.top=`${row.y}%`;
  floor.style.opacity='.10';
  const hint=document.createElement('span');
  hint.className=`floorHint ${row.dir}`;
  hint.textContent=row.dir==='right'?'→ AUTO':'AUTO ←';
  hint.style.opacity='.14';
  floor.appendChild(hint);
  world.appendChild(floor);
});

function makeLadder(x,y1,y2){
  const el=document.createElement('div');
  el.className='dungeonLadder';
  el.style.left=`${x}%`;el.style.top=`${y1}%`;el.style.height=`${y2-y1}%`;
  world.appendChild(el);
  registerReveal(el,x,y1,.07,.78);
  return el;
}
makeLadder(86,18,50);
makeLadder(12,50,82);

const door=document.createElement('div');
door.className='dungeonDoor';door.style.left='48%';door.style.top='50%';door.textContent='鍵扉';world.appendChild(door);registerReveal(door,48,50,.07,.88);
const goal=document.createElement('div');
goal.className='dungeonGoal';goal.style.left='88%';goal.style.top='82%';goal.textContent='到達点';world.appendChild(goal);registerReveal(goal,88,82,.05,.72);

/* 人物は見せない。存在だけごく薄い影。 */
const playerShadow=document.createElement('div');
Object.assign(playerShadow.style,{position:'absolute',width:'10px',height:'25px',transform:'translate(-50%,-100%)',borderRadius:'50%',background:'#000',filter:'blur(5px)',opacity:'.018',zIndex:'35',pointerEvents:'none'});
world.appendChild(playerShadow);

/* 手元の小さい光。 */
const lampCore=document.createElement('div');
Object.assign(lampCore.style,{position:'absolute',width:'5px',height:'7px',transform:'translate(-50%,-50%)',borderRadius:'2px',background:'#ffe0a1',boxShadow:'0 0 5px rgba(255,230,170,.95),0 0 13px rgba(255,174,70,.9)',zIndex:'42',pointerEvents:'none'});
world.appendChild(lampCore);

const handGlow=document.createElement('div');
Object.assign(handGlow.style,{position:'absolute',width:'66px',height:'66px',transform:'translate(-50%,-50%)',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,224,158,.48) 0%,rgba(255,181,80,.24) 26%,rgba(255,145,47,.07) 54%,rgba(0,0,0,0) 75%)',mixBlendMode:'screen',zIndex:'39',pointerEvents:'none'});
world.appendChild(handGlow);

/* 前方2〜3マスを実際に明るく見せる帯。 */
const beam=document.createElement('div');
Object.assign(beam.style,{position:'absolute',width:`${LIGHT_RANGE}%`,height:'92px',clipPath:'polygon(0 35%,100% 3%,100% 97%,0 65%)',filter:'blur(3px)',mixBlendMode:'screen',zIndex:'38',pointerEvents:'none',opacity:'.96'});
world.appendChild(beam);

/* 足元の床も前方だけ明るくする。 */
const floorLight=document.createElement('div');
Object.assign(floorLight.style,{position:'absolute',width:`${LIGHT_RANGE}%`,height:'18px',background:'linear-gradient(90deg,rgba(255,206,120,.30),rgba(255,170,74,.16) 45%,rgba(255,150,55,.06) 72%,rgba(0,0,0,0))',filter:'blur(4px)',mixBlendMode:'screen',zIndex:'37',pointerEvents:'none'});
world.appendChild(floorLight);

/* 敵。暗闇では消え、前方ライト内で見える。 */
const enemy=document.createElement('div');
Object.assign(enemy.style,{position:'absolute',left:`${state.enemyX}%`,top:`${state.enemyY}%`,width:'20px',height:'34px',transform:'translate(-50%,-100%)',zIndex:'36',opacity:'0',transition:'opacity .12s linear,filter .12s linear,transform .35s ease',pointerEvents:'none'});
enemy.innerHTML='<span class="darkEnemyHead"></span><span class="darkEnemyBody"></span>';
world.appendChild(enemy);
Object.assign(enemy.querySelector('.darkEnemyHead').style,{position:'absolute',left:'5px',top:'0',width:'10px',height:'10px',borderRadius:'50%',background:'#111'});
Object.assign(enemy.querySelector('.darkEnemyBody').style,{position:'absolute',left:'2px',top:'9px',width:'16px',height:'24px',borderRadius:'45% 45% 28% 28%',background:'#111'});

function isLit(x,y){
  const sameRow=Math.abs(y-state.y)<4;
  const ahead=(x-state.x)*state.dir;
  return sameRow && ahead>0 && ahead<=LIGHT_RANGE+2;
}

function updateReveal(){
  revealables.forEach(o=>{
    const lit=isLit(o.x,o.y);
    o.el.style.opacity=String(lit?o.lit:o.dark);
    o.el.style.filter=lit?'brightness(1.8) drop-shadow(0 0 6px rgba(255,190,100,.28))':'none';
  });
  if(state.enemyAlive){
    const lit=isLit(state.enemyX,state.enemyY);
    enemy.style.opacity=lit?'.96':'0';
    enemy.style.filter=lit?'brightness(1.45) drop-shadow(0 0 7px rgba(255,190,100,.32))':'none';
  }else enemy.style.opacity='0';
}

function centerViewportOn(y){const max=Math.max(0,viewport.scrollHeight-viewport.clientHeight);const raw=(y/100)*world.scrollHeight-viewport.clientHeight*.46;viewport.scrollTop=Math.max(0,Math.min(max,raw));}

function updateLight(){
  const handX=state.x+state.dir*1.7, handY=state.y-2.2;
  lampCore.style.left=`${handX}%`;lampCore.style.top=`${handY}%`;
  handGlow.style.left=`${handX}%`;handGlow.style.top=`${handY}%`;
  beam.style.top=`${handY}%`;
  floorLight.style.top=`calc(${state.y}% - 9px)`;
  if(state.dir>0){
    beam.style.left=`${handX}%`;beam.style.transform='translate(0,-50%)';beam.style.background='linear-gradient(90deg,rgba(255,223,153,.40) 0%,rgba(255,190,98,.26) 30%,rgba(255,160,64,.14) 62%,rgba(0,0,0,0) 100%)';
    floorLight.style.left=`${state.x}%`;floorLight.style.transform='translate(0,-50%)';floorLight.style.background='linear-gradient(90deg,rgba(255,206,120,.30),rgba(255,170,74,.16) 45%,rgba(255,150,55,.06) 72%,rgba(0,0,0,0))';
  }else{
    beam.style.left=`${handX}%`;beam.style.transform='translate(-100%,-50%)';beam.style.background='linear-gradient(270deg,rgba(255,223,153,.40) 0%,rgba(255,190,98,.26) 30%,rgba(255,160,64,.14) 62%,rgba(0,0,0,0) 100%)';
    floorLight.style.left=`${state.x}%`;floorLight.style.transform='translate(-100%,-50%)';floorLight.style.background='linear-gradient(270deg,rgba(255,206,120,.30),rgba(255,170,74,.16) 45%,rgba(255,150,55,.06) 72%,rgba(0,0,0,0))';
  }
  updateReveal();
}

function setPlayer(x,y){state.x=x;state.y=y;playerShadow.style.left=`${x}%`;playerShadow.style.top=`${y}%`;updateLight();centerViewportOn(y);}
function setDirection(dir){state.dir=dir>=0?1:-1;updateLight();}
function setMessage(text){state.status=text;message.textContent=text;document.getElementById('exploreState').textContent=text;}

function renderStatus(){document.getElementById('hpText').textContent=`HP ${state.hp}/${state.maxHp}`;document.getElementById('hpFill').style.width=`${state.hp/state.maxHp*100}%`;document.getElementById('foodValue').textContent=`🍖 ${state.food}`;document.getElementById('ammoState').textContent=`弾 ${state.arrows}/20`;}
function renderInventory(){inventoryGrid.innerHTML='';const items=[['🌿','薬草',state.herb],['🧴','回復薬',state.potion],['🍞','パン',state.bread],['🏹','矢',state.arrows],['🪢','ロープ',state.rope],['🗝️','鍵',state.keys],['🪓','斧',state.axe]];for(let i=0;i<8;i++){const slot=document.createElement('div');slot.className='squareSlot';const it=items[i];if(!it)slot.classList.add('empty');else slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span><span class="itemCount">${it[2]}</span>`;inventoryGrid.appendChild(slot);}}
function renderAbilities(active='弓'){abilityGrid.innerHTML='';const a=[['🗡️','短剣'],['🏹','弓'],['🛡️','革鎧'],['＋','応急処置'],['🌱','採取'],['!','危険察知']];for(let i=0;i<7;i++){const slot=document.createElement('div');slot.className='squareSlot skillSlot';const it=a[i];if(!it)slot.classList.add('empty');else{if(it[1]===active)slot.classList.add('active');slot.innerHTML=`<span class="slotIcon">${it[0]}</span><span class="slotName">${it[1]}</span>`;}abilityGrid.appendChild(slot);}}

async function animatePosition(tx,ty,speed=22){const sx=state.x,sy=state.y,dx=tx-sx,dy=ty-sy;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>.2)setDirection(dx);const dist=Math.hypot(dx,dy),duration=Math.max(220,dist/speed*1000),start=performance.now();await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-start)/duration);const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;setPlayer(sx+dx*e,sy+dy*e);if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});}
const delay=ms=>new Promise(r=>setTimeout(r,ms));

function fireArrow(){return new Promise(resolve=>{const arrow=document.createElement('div');Object.assign(arrow.style,{position:'absolute',left:`${state.x+state.dir*2}%`,top:`${state.y-2.2}%`,width:'13px',height:'2px',background:'#e8d3ad',boxShadow:'0 0 4px rgba(255,210,135,.7)',zIndex:'44',pointerEvents:'none'});world.appendChild(arrow);const sx=state.x+state.dir*2,ex=state.enemyX-1,start=performance.now(),duration=260;function frame(now){const t=Math.min(1,(now-start)/duration);arrow.style.left=`${sx+(ex-sx)*t}%`;if(t<1)requestAnimationFrame(frame);else{arrow.remove();resolve();}}requestAnimationFrame(frame);});}

async function encounterEnemy(){if(!state.enemyAlive)return;setMessage('ライトの先に敵');await delay(420);if(state.arrows>0){renderAbilities('弓');state.arrows--;renderStatus();renderInventory();setMessage('弓を自動使用');await fireArrow();enemy.style.opacity='1';await delay(90);state.enemyAlive=false;enemy.style.opacity='0';enemy.style.transform='translate(-50%,-100%) translateX(8px) rotate(62deg)';setMessage('敵を撃破');await delay(420);}}

async function runExplore(){
  setDirection(1);setPlayer(12,18);renderStatus();renderInventory();renderAbilities('弓');centerViewportOn(18);
  await delay(500);
  setMessage('灯りを頼りに進む');
  await animatePosition(34,18,20); // ここで敵が前方ライト内に入る
  await encounterEnemy();
  setMessage('先へ進む');await animatePosition(86,18,21);
  setMessage('梯子を降りる');await animatePosition(86,50,14);
  setMessage('鍵扉を確認');await animatePosition(54,50,20);
  if(state.keys>0){state.keys--;door.classList.add('open');door.textContent='OPEN';renderInventory();setMessage('鍵を使用');await delay(380);}
  setMessage('先へ進む');await animatePosition(12,50,21);
  setMessage('梯子を降りる');await animatePosition(12,82,14);
  setMessage('灯りの先を進む');await animatePosition(88,82,21);
  setMessage('探索地点に到達');document.getElementById('conditionState').textContent='状態：探索完了';
}

let flickerStart=performance.now();function flicker(now){const t=(now-flickerStart)/1000;handGlow.style.opacity=String(.90+Math.sin(t*7)*.03);beam.style.opacity=String(.94+Math.sin(t*4.2)*.02);lampCore.style.opacity=String(.92+Math.sin(t*9.3)*.06);requestAnimationFrame(flicker);}requestAnimationFrame(flicker);

document.getElementById('backToShop')?.addEventListener('click',()=>window.location.replace('./フィールド_店エリア_v3.html'));
document.getElementById('fieldSave')?.addEventListener('click',()=>alert('SAVE機能はまだ未実装です。自動保存もしていません。'));
document.getElementById('fieldLog')?.addEventListener('click',()=>alert('LOG画面はまだ未実装です。'));
document.getElementById('fieldMenu')?.addEventListener('click',()=>alert('MENU画面はまだ未実装です。'));
window.addEventListener('resize',()=>centerViewportOn(state.y));
runExplore();