import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

import {getActiveGame,setActiveGame,createNewGameState} from './save.js';
import {normalizePlayer,advancePlayer} from './player.js';
import {addItem,itemData} from './items.js?v=20260910-itemuse1';
import {advanceTime,TIME_SCALE} from './time.js';
import {getAmbientTemperature} from './temperature.js';
import {updateWeather} from './weather.js';
import {moveWorldPosition} from './world.js';
import {markpoints} from './markpoints.js';
import {drawMiniMap,drawWorldMap} from './map.js';
import {drawClock} from './clock.js';

const $=id=>document.getElementById(id);
const canvas=$('worldCanvas');
const hud=$('playerHud');
const mini=$('miniMapCanvas');
const miniBtn=$('miniMapBtn');
const overlay=$('mapOverlay');
const closeMap=$('closeMapBtn');
const worldMap=$('worldMapCanvas');
const pickupToast=$('pickupToast');
const item=$('itemBtn');
const fieldStage=document.querySelector('.field-stage');

let game=getActiveGame()||createNewGameState();
normalizePlayer(game.player);
game.inventory=Array.isArray(game.inventory)?game.inventory:[];
game.world.discoveredMarkpoints=Array.isArray(game.world.discoveredMarkpoints)?game.world.discoveredMarkpoints:[];
game.world.collectedPickups=Array.isArray(game.world.collectedPickups)?game.world.collectedPickups:[];
game.world.placedObjects=Array.isArray(game.world.placedObjects)?game.world.placedObjects:[];
setActiveGame(game);

/* ---------- 3D scene ---------- */
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xc6d6d6);
scene.fog=new THREE.Fog(0xd4c5a1,45,145);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=false;

const camera=new THREE.PerspectiveCamera(47,1,0.1,260);
const CAMERA_OFFSET=new THREE.Vector3(0,31,24);
const CAMERA_LOOK_AHEAD=new THREE.Vector3(0,0,-4.5);

const hemi=new THREE.HemisphereLight(0xe9f3f3,0x8a6b43,1.65);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe5b6,2.15);
sun.position.set(-30,55,20);
scene.add(sun);

const groundMat=new THREE.MeshLambertMaterial({color:0xc9ad78});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(430,430),groundMat);
ground.rotation.x=-Math.PI/2;
ground.position.y=-0.04;
scene.add(ground);

function makePlayer(){
  const g=new THREE.Group();
  const robe=new THREE.Mesh(
    new THREE.CylinderGeometry(0.44,0.68,1.65,7),
    new THREE.MeshLambertMaterial({color:0x34352f})
  );
  robe.position.y=0.86;
  g.add(robe);

  const head=new THREE.Mesh(
    new THREE.SphereGeometry(0.42,12,8),
    new THREE.MeshLambertMaterial({color:0xb98961})
  );
  head.position.y=1.98;
  g.add(head);

  const directionMark=new THREE.Mesh(
    new THREE.ConeGeometry(0.16,0.42,5),
    new THREE.MeshLambertMaterial({color:0xe1c39b})
  );
  directionMark.rotation.x=-Math.PI/2;
  directionMark.position.set(0,1.90,-0.43);
  g.add(directionMark);
  return g;
}

const player=makePlayer();
player.position.set(game.world.x,0,game.world.z);
scene.add(player);

/* ---------- continuous world cells ---------- */
const CELL=18;
const RADIUS_X=8;
const RADIUS_Z=10;
const PICKUP_RADIUS=1.25;
const PICKUP_SPAWN_CHANCE=Object.freeze({
  stone:0.07,
  dry_branch:0.07
});
const cells=new Map();
const activePickups=new Map();
const placedObjects=new Map();

const duneGeo=new THREE.SphereGeometry(1,10,6);
const duneMatA=new THREE.MeshLambertMaterial({color:0xd9bf8d});
const duneMatB=new THREE.MeshLambertMaterial({color:0xc9a973});
const rockGeo=new THREE.DodecahedronGeometry(1,0);
const rockMat=new THREE.MeshLambertMaterial({color:0x71614f});
const scrubGeo=new THREE.ConeGeometry(1,1,5);
const scrubMat=new THREE.MeshLambertMaterial({color:0x746a43});

const pickupStoneGeo=new THREE.OctahedronGeometry(.48,0);
const pickupBranchGeo=new THREE.CylinderGeometry(.09,.13,1.45,6);
const pickupStoneMat=new THREE.MeshStandardMaterial({color:0xaefaff,emissive:0x00b8c6,emissiveIntensity:1.45,roughness:.28,metalness:.05});
const pickupBranchMat=new THREE.MeshStandardMaterial({color:0xffdf7a,emissive:0xe38700,emissiveIntensity:1.55,roughness:.38,metalness:.02});
const pickupGlowMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending});
const pickupHaloGeo=new THREE.TorusGeometry(.78,.045,6,22);
const pickupSparkGeo=new THREE.OctahedronGeometry(.10,0);

function hash(x,z){
  let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263);
  h=Math.imul(h^(h>>>13),1274126177);
  return (h^(h>>>16))>>>0;
}
function rng(seed){
  let s=seed>>>0;
  return()=>{
    s|=0;s=s+0x6D2B79F5|0;
    let t=Math.imul(s^s>>>15,1|s);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}

function pickupIdForCell(itemId,cx,cz){
  return `material_${itemId}_${cx}_${cz}`;
}

function makePickup(itemId,pickupId,wx,wz,phase){
  const g=new THREE.Group();
  let core;
  if(itemId==='dry_branch'){
    core=new THREE.Mesh(pickupBranchGeo,pickupBranchMat);
    core.rotation.z=Math.PI/2;
    core.rotation.y=.35;
    core.position.y=.50;
  }else{
    core=new THREE.Mesh(pickupStoneGeo,pickupStoneMat);
    core.position.y=.55;
  }
  g.add(core);

  const halo=new THREE.Mesh(pickupHaloGeo,pickupGlowMat);
  halo.rotation.x=Math.PI/2;
  halo.position.y=.08;
  g.add(halo);

  const sparkA=new THREE.Mesh(pickupSparkGeo,pickupGlowMat);
  sparkA.position.set(.58,1.05,0);
  g.add(sparkA);
  const sparkB=new THREE.Mesh(pickupSparkGeo,pickupGlowMat);
  sparkB.scale.setScalar(.72);
  sparkB.position.set(-.44,.82,.28);
  g.add(sparkB);

  g.position.set(wx,0,wz);
  g.userData={pickupId,itemId,phase,halo,sparkA,sparkB};
  return g;
}

function createCell(cx,cz){
  const random=rng(hash(cx,cz));
  const group=new THREE.Group();
  const wx=cx*CELL+(random()-.5)*CELL*.68;
  const wz=cz*CELL+(random()-.5)*CELL*.68;
  const type=random();

  if(type<0.46){
    const dune=new THREE.Mesh(duneGeo,random()>.5?duneMatA:duneMatB);
    dune.scale.set(3.1+random()*3.7,.55+random()*.65,2.5+random()*3.9);
    dune.position.set(wx,-.14,wz);
    dune.rotation.y=random()*Math.PI;
    group.add(dune);
  }else if(type<0.78){
    const rock=new THREE.Mesh(rockGeo,rockMat);
    const s=.45+random()*1.05;
    rock.scale.set(s*(.75+random()*.55),s,s*(.78+random()*.55));
    rock.position.set(wx,s*.62,wz);
    rock.rotation.set(random()*.4,random()*Math.PI,random()*.25);
    group.add(rock);
  }else if(type<0.91){
    const count=2+Math.floor(random()*3);
    for(let i=0;i<count;i++){
      const scrub=new THREE.Mesh(scrubGeo,scrubMat);
      const s=.22+random()*.32;
      scrub.scale.set(s,s*(1.8+random()),s);
      scrub.position.set(wx+(random()-.5)*2.4,s,wz+(random()-.5)*2.4);
      scrub.rotation.z=(random()-.5)*.35;
      group.add(scrub);
    }
  }

  function spawnPickup(itemId,chance){
    const pickupId=pickupIdForCell(itemId,cx,cz);
    if(random()>=chance||game.world.collectedPickups.includes(pickupId))return;
    const px=cx*CELL+(random()-.5)*CELL*.56;
    const pz=cz*CELL+(random()-.5)*CELL*.56;
    const pickup=makePickup(itemId,pickupId,px,pz,random()*Math.PI*2);
    group.add(pickup);
    activePickups.set(pickupId,{group:pickup,cellGroup:group,itemId});
  }

  // 石と枯れ枝は別々に判定する。片方の率を変えても、もう片方には影響しない。
  spawnPickup('stone',PICKUP_SPAWN_CHANCE.stone);
  spawnPickup('dry_branch',PICKUP_SPAWN_CHANCE.dry_branch);

  scene.add(group);
  cells.set(`${cx},${cz}`,group);
}

let lastCellX=null,lastCellZ=null;
function updateCells(force=false){
  const centerX=Math.floor(game.world.x/CELL);
  const centerZ=Math.floor(game.world.z/CELL);
  if(!force&&centerX===lastCellX&&centerZ===lastCellZ)return;
  lastCellX=centerX;lastCellZ=centerZ;

  const needed=new Set();
  for(let z=centerZ-RADIUS_Z;z<=centerZ+RADIUS_Z;z++){
    for(let x=centerX-RADIUS_X;x<=centerX+RADIUS_X;x++){
      const key=`${x},${z}`;
      needed.add(key);
      if(!cells.has(key))createCell(x,z);
    }
  }
  for(const [key,group] of cells){
    if(!needed.has(key)){
      for(const [pickupId,entry] of activePickups){
        if(entry.cellGroup===group)activePickups.delete(pickupId);
      }
      scene.remove(group);
      cells.delete(key);
    }
  }
}

/* ---------- automatic material pickup ---------- */
let toastTimer=null;
function showFieldToast(text){
  pickupToast.textContent=String(text||'');
  pickupToast.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{pickupToast.hidden=true;},1000);
}
function showPickupToast(itemId){
  const name=itemData[itemId]?.name||itemId;
  showFieldToast(`${name} を拾った`);
}

function collectNearbyPickups(){
  for(const [pickupId,entry] of activePickups){
    const dx=entry.group.position.x-game.world.x;
    const dz=entry.group.position.z-game.world.z;
    if(Math.hypot(dx,dz)>PICKUP_RADIUS)continue;
    addItem(game.inventory,entry.itemId,1);
    game.world.collectedPickups.push(pickupId);
    entry.cellGroup.remove(entry.group);
    activePickups.delete(pickupId);
    showPickupToast(entry.itemId);
    setActiveGame(game);
    window.dispatchEvent(new CustomEvent('desert:inventory-changed'));
  }
}

function animatePickups(now){
  const t=now*.001;
  for(const entry of activePickups.values()){
    const g=entry.group;
    const d=g.userData;
    const phase=d.phase||0;
    g.position.y=.06+Math.sin(t*2.2+phase)*.10;
    g.rotation.y=t*.65+phase;
    d.halo.rotation.z=t*1.8+phase;
    const pulse=.75+Math.sin(t*3.4+phase)*.25;
    d.sparkA.scale.setScalar(.75+pulse*.55);
    d.sparkB.scale.setScalar(.55+pulse*.35);
  }
}

/* ---------- placed items ---------- */
function makeCampfireObject(data){
  const g=new THREE.Group();
  const stoneMat=new THREE.MeshLambertMaterial({color:0x665a4c});
  const woodMat=new THREE.MeshLambertMaterial({color:0x6d4327});
  const flameMat=new THREE.MeshBasicMaterial({color:0xffa52f});

  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2;
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),stoneMat);
    stone.position.set(Math.cos(a)*.72,.18,Math.sin(a)*.72);
    stone.scale.y=.7;
    g.add(stone);
  }

  for(const rot of [-.65,.65]){
    const log=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,1.25,6),woodMat);
    log.rotation.z=Math.PI/2;
    log.rotation.y=rot;
    log.position.y=.25;
    g.add(log);
  }

  const flame=new THREE.Mesh(new THREE.ConeGeometry(.34,.9,7),flameMat);
  flame.position.y=.78;
  g.add(flame);

  g.position.set(Number(data.x||0),0,Number(data.z||0));
  g.userData={placedId:data.id,type:'campfire',flame};
  return g;
}

function addPlacedObject(data){
  if(!data?.id||placedObjects.has(data.id))return;
  let obj=null;
  if(data.type==='campfire')obj=makeCampfireObject(data);
  if(!obj)return;
  scene.add(obj);
  placedObjects.set(data.id,obj);
}

function buildPlacedObjects(){
  for(const data of game.world.placedObjects)addPlacedObject(data);
}

function animatePlacedObjects(now){
  const t=now*.001;
  for(const obj of placedObjects.values()){
    if(obj.userData.type==='campfire'&&obj.userData.flame){
      const s=.92+Math.sin(t*7+obj.position.x*.1)*.10;
      obj.userData.flame.scale.set(1,s,1);
    }
  }
}

/* ---------- mark points ---------- */
const markObjects=new Map();
function buildMarkpoints(){
  for(const obj of markObjects.values())scene.remove(obj);
  markObjects.clear();
  for(const p of markpoints){
    if(!Number.isFinite(+p.x)||!Number.isFinite(+p.z))continue;
    const g=new THREE.Group();
    if(p.type==='water'){
      const rim=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,.55,18),new THREE.MeshLambertMaterial({color:0x8c7356}));
      rim.position.y=.27;g.add(rim);
      const water=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.55,.05,18),new THREE.MeshLambertMaterial({color:0x4f8290}));
      water.position.y=.57;g.add(water);
    }else if(p.type==='town'){
      const b=new THREE.Mesh(new THREE.BoxGeometry(5.5,3.4,5.5),new THREE.MeshLambertMaterial({color:0xa1845d}));
      b.position.y=1.7;g.add(b);
    }else{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.1,2.2,6),new THREE.MeshLambertMaterial({color:0x77644d}));
      m.position.y=1.1;g.add(m);
    }
    g.position.set(+p.x,0,+p.z);
    scene.add(g);
    markObjects.set(p.id,g);
  }
}

function discoverNearbyMarkpoints(){
  let changed=false;
  for(const p of markpoints){
    if(!Number.isFinite(+p.x)||!Number.isFinite(+p.z))continue;
    const distance=Math.hypot(+p.x-game.world.x,+p.z-game.world.z);
    if(distance<8&&!game.world.discoveredMarkpoints.includes(p.id)){
      game.world.discoveredMarkpoints.push(p.id);
      changed=true;
    }
  }
  if(changed)maps();
}

/* ---------- compact HUD / map ---------- */
function compactBar(icon,value,label){
  const safe=Math.max(0,Math.min(100,Number(value||0)));
  return `<div class="compact-stat" aria-label="${label} ${Math.round(safe)}"><span class="compact-stat-icon">${icon}</span><span class="compact-stat-track"><i class="compact-stat-fill" style="width:${safe}%"></i></span><span class="compact-stat-value">${Math.round(safe)}</span></div>`;
}

function weatherMarkup(){
  if(game.weather.type==='sandstorm'){
    return `<div class="weather-badge" aria-label="砂嵐" title="砂嵐"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h12c2.7 0 2.7-4 0-4-1.2 0-2 .6-2.4 1.4"/><path d="M3 12h16c2.7 0 2.7 4 0 4-1.2 0-2-.6-2.4-1.4"/><path d="M5 16h7"/><path d="M4 20h11"/></svg></div>`;
  }
  return `<div class="weather-badge" aria-label="晴れ" title="晴れ"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg></div>`;
}

function tempState(temp){
  if(temp>=48||temp<=0)return 'danger';
  if(temp>=35)return 'hot';
  if(temp>=18)return 'normal';
  if(temp>=8)return 'cool';
  return 'cold';
}

function drawHud(){
  const ambient=getAmbientTemperature(game.time,game.weather.type);
  const tempClass=tempState(ambient);
  const fill=Math.max(8,Math.min(94,((ambient+10)/65)*100));
  const statuses=Array.isArray(game.player.status)?game.player.status.filter(Boolean):[];
  const statusHtml=statuses.length?`<div class="status-alert">${statuses.join(' / ')}</div>`:'';

  hud.innerHTML=`
    <div class="survival-compact">
      ${compactBar('♥',game.player.health,'体力')}
      ${compactBar('◇',game.player.water,'水')}
      ${compactBar('◆',game.player.food,'食')}
      ${compactBar('☾',game.player.sleep,'睡眠')}
      <div class="body-temp-mini" aria-label="体温 ${game.player.bodyTemp.toFixed(1)}度">
        <svg viewBox="0 0 12 18" aria-hidden="true"><path d="M4.5 3a1.5 1.5 0 013 0v7.2a3.5 3.5 0 11-3 0V3z"/><path d="M6 6v6"/></svg>
        <span>${game.player.bodyTemp.toFixed(1)}°</span>
      </div>
    </div>
    <div class="hud-visual-row">
      <div class="time-weather-stack">
        <div class="day-badge"><span>DAY</span><strong>${Number(game.time.day||1)}</strong></div>
        <div class="clock-ring"><canvas id="clockCanvas" width="96" height="96" aria-label="ゲーム内時計"></canvas></div>
        ${weatherMarkup()}
      </div>
      <div class="temp-widget ${tempClass}" aria-label="外気温 ${ambient.toFixed(1)}度">
        <div class="thermometer"><i class="thermometer-fill" style="height:${fill}%"></i></div>
        <div class="temp-reading">${Math.round(ambient)}°</div>
      </div>
    </div>
    ${statusHtml}
  `;

  const cc=$('clockCanvas');
  if(cc)drawClock(cc,game.time);
}

function maps(){
  drawMiniMap(mini,game.world,markpoints);
  if(!overlay.hidden)drawWorldMap(worldMap,game.world,markpoints);
}

/* ---------- environment ---------- */
function resize(){
  const r=canvas.getBoundingClientRect();
  const w=Math.max(1,Math.floor(r.width));
  const h=Math.max(1,Math.floor(r.height));
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
function updateCamera(){
  camera.position.set(player.position.x+CAMERA_OFFSET.x,player.position.y+CAMERA_OFFSET.y,player.position.z+CAMERA_OFFSET.z);
  camera.lookAt(player.position.x+CAMERA_LOOK_AHEAD.x,player.position.y+CAMERA_LOOK_AHEAD.y,player.position.z+CAMERA_LOOK_AHEAD.z);
  ground.position.x=player.position.x;
  ground.position.z=player.position.z;
}
function updateLight(){
  const hour=Number(game.time.hour||0)+Number(game.time.minute||0)/60;
  const daylight=Math.max(.13,Math.sin(((hour-6)/12)*Math.PI));
  hemi.intensity=.42+daylight*1.25;
  sun.intensity=.18+daylight*2.0;
  sun.position.set(player.position.x-35,18+daylight*48,player.position.z+18);

  let sky;
  if(hour<5||hour>=20.5)sky=new THREE.Color(0x26354a);
  else if(hour<7)sky=new THREE.Color(0xb9a58e);
  else if(hour<18)sky=new THREE.Color(0xc7d8d9);
  else sky=new THREE.Color(0xb78c78);

  if(game.weather.type==='sandstorm'){
    sky.lerp(new THREE.Color(0xb49367),.55);
    scene.fog.near=18;scene.fog.far=75;
  }else{
    scene.fog.near=48;scene.fog.far=145;
  }
  scene.background.copy(sky);
  scene.fog.color.copy(sky.clone().lerp(new THREE.Color(0xc9ad78),.45));
}

/* ---------- item use ---------- */
function inventoryIndexAtHotbarSlot(slot){
  return game.inventory.findIndex(entry=>Number(entry?.slot)===Number(slot));
}

function consumeInventoryIndex(index,amount=1){
  const entry=game.inventory[index];
  if(!entry)return false;
  entry.amount=Number(entry.amount||1)-amount;
  if(entry.amount<=0)game.inventory.splice(index,1);
  return true;
}

function placeCampfire(){
  const distance=2.6;
  const x=game.world.x-Math.sin(player.rotation.y)*distance;
  const z=game.world.z-Math.cos(player.rotation.y)*distance;
  const data={
    id:`campfire_${Date.now()}`,
    type:'campfire',
    x,
    z
  };
  game.world.placedObjects.push(data);
  addPlacedObject(data);
}

function useHotbarItem(event){
  const slot=Number(event.detail?.slot);
  if(!Number.isInteger(slot)||slot<0||slot>4)return;
  const index=inventoryIndexAtHotbarSlot(slot);
  if(index<0)return;

  const entry=game.inventory[index];
  const data=itemData[entry.id];
  if(!data?.useType)return;

  if(data.useType==='eat'){
    if(Number(game.player.food||0)>=100){
      showFieldToast('今は満腹です');
      return;
    }
    game.player.food=Math.min(100,Number(game.player.food||0)+Number(data.foodRestore||10));
    consumeInventoryIndex(index,1);
    normalizePlayer(game.player);
    showFieldToast(`${data.name} を食べた`);
  }else if(data.useType==='place'&&entry.id==='campfire'){
    placeCampfire();
    consumeInventoryIndex(index,1);
    showFieldToast('焚き火を設置した');
  }else{
    return;
  }

  setActiveGame(game);
  window.dispatchEvent(new CustomEvent('desert:inventory-changed'));
}

window.addEventListener('desert:use-hotbar-item',useHotbarItem);

/* ---------- movement: drag + tap-to-walk ---------- */
let ix=0,iy=0,pointerId=null,dragStartX=0,dragStartY=0,dragMoved=false,pointerDownAt=0,last=performance.now(),timeAcc=0,saveAcc=0,walkPhase=0;
let autoTarget=null;
const MOVE_RADIUS=56;
const MOVE_DEADZONE=7;
const TAP_MAX_DISTANCE=10;
const TAP_MAX_MS=450;
const AUTO_WALK_SPEED=11.5;
const raycaster=new THREE.Raycaster();
const pointerNdc=new THREE.Vector2();

function minuteTick(){
  advanceTime(game.time,1);
  updateWeather(game.weather,game.time);
  advancePlayer(game.player,{ambientTemp:getAmbientTemperature(game.time,game.weather.type),weather:game.weather.type,running:false,sheltered:game.world.sheltered},1);
  drawHud();maps();updateLight();
}

function applyMovement(nx,nz,speed,dt){
  const moved=moveWorldPosition(game.world,nx*speed*dt,nz*speed*dt);
  if(!moved.moved)return false;

  player.position.x=game.world.x;
  player.position.z=game.world.z;
  player.rotation.y=Math.atan2(-nx,-nz);
  walkPhase+=dt*8;
  player.position.y=Math.abs(Math.sin(walkPhase))*.055;
  timeAcc+=moved.gameMinutes;
  updateCells();
  collectNearbyPickups();
  discoverNearbyMarkpoints();
  maps();
  updateCamera();
  return true;
}

function updateMovement(dt){
  if(!overlay.hidden)return;

  const manualMag=Math.hypot(ix,iy);
  if(manualMag>=.05){
    const nx=ix/manualMag;
    const nz=iy/manualMag;
    const speed=11.5*Math.min(1,manualMag);
    game.world.running=false;
    autoTarget=null;
    applyMovement(nx,nz,speed,dt);
    return;
  }

  if(!autoTarget)return;
  if(autoTarget.pickupId&&!activePickups.has(autoTarget.pickupId)){
    autoTarget=null;
    return;
  }

  const dx=autoTarget.x-game.world.x;
  const dz=autoTarget.z-game.world.z;
  const distance=Math.hypot(dx,dz);
  const stopDistance=autoTarget.pickupId?.length?0.85:0.35;
  if(distance<=stopDistance){
    collectNearbyPickups();
    autoTarget=null;
    return;
  }

  const nx=dx/distance;
  const nz=dz/distance;
  const maxStep=AUTO_WALK_SPEED*dt;
  const usableDistance=Math.max(0,distance-stopDistance);
  const speed=maxStep>usableDistance&&dt>0?usableDistance/dt:AUTO_WALK_SPEED;
  game.world.running=false;
  if(!applyMovement(nx,nz,speed,dt))autoTarget=null;
}

function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));
  last=now;
  updateMovement(dt);
  if(Math.hypot(ix,iy)<.05&&!autoTarget)player.position.y+=(0-player.position.y)*.2;
  animatePickups(now);
  animatePlacedObjects(now);
  timeAcc+=dt*(1000/TIME_SCALE.realMillisecondsPerGameMinute);
  while(timeAcc>=1){minuteTick();timeAcc-=1;}
  saveAcc+=dt;
  if(saveAcc>=3){setActiveGame(game);saveAcc=0;}
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}

function isFieldUiTarget(target){
  if(!(target instanceof Element))return false;
  return Boolean(target.closest('#miniMapBtn,#fieldUseButton,.field-left-info,button,a'));
}

function pickupGroupFromObject(object){
  let current=object;
  while(current&&current!==scene){
    if(current.userData?.pickupId)return current;
    current=current.parent;
  }
  return null;
}

function setTapDestination(clientX,clientY){
  const rect=canvas.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0)return;
  pointerNdc.set(
    ((clientX-rect.left)/rect.width)*2-1,
    -((clientY-rect.top)/rect.height)*2+1
  );

  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  raycaster.setFromCamera(pointerNdc,camera);

  const pickupGroups=[...activePickups.values()].map(entry=>entry.group);
  const pickupHits=pickupGroups.length?raycaster.intersectObjects(pickupGroups,true):[];
  if(pickupHits.length){
    const pickupGroup=pickupGroupFromObject(pickupHits[0].object);
    if(pickupGroup){
      autoTarget={
        x:pickupGroup.position.x,
        z:pickupGroup.position.z,
        pickupId:pickupGroup.userData.pickupId
      };
      return;
    }
  }

  const groundHit=raycaster.intersectObject(ground,false)[0];
  if(groundHit){
    autoTarget={x:groundHit.point.x,z:groundHit.point.z,pickupId:null};
  }
}

function updateFieldMove(e){
  const dx=e.clientX-dragStartX;
  const dy=e.clientY-dragStartY;
  const distance=Math.hypot(dx,dy);
  if(distance<MOVE_DEADZONE){
    ix=0;
    iy=0;
    return;
  }
  dragMoved=true;
  autoTarget=null;
  const scale=1/MOVE_RADIUS;
  ix=dx*scale;
  iy=dy*scale;
  const mag=Math.hypot(ix,iy);
  if(mag>1){
    ix/=mag;
    iy/=mag;
  }
}

function beginFieldMove(e){
  if(!fieldStage||pointerId!==null||!overlay.hidden||isFieldUiTarget(e.target))return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  pointerId=e.pointerId;
  dragStartX=e.clientX;
  dragStartY=e.clientY;
  dragMoved=false;
  pointerDownAt=performance.now();
  autoTarget=null;
  ix=0;
  iy=0;
  fieldStage.setPointerCapture?.(pointerId);
  e.preventDefault();
}

function moveFieldMove(e){
  if(e.pointerId!==pointerId)return;
  updateFieldMove(e);
  e.preventDefault();
}

function clearFieldPointer(e=null){
  if(e&&pointerId!==null&&e.pointerId!==pointerId)return false;
  if(fieldStage&&pointerId!==null&&fieldStage.hasPointerCapture?.(pointerId)){
    fieldStage.releasePointerCapture?.(pointerId);
  }
  pointerId=null;
  ix=0;
  iy=0;
  return true;
}

function endFieldMove(e){
  if(e.pointerId!==pointerId)return;
  const distance=Math.hypot(e.clientX-dragStartX,e.clientY-dragStartY);
  const elapsed=performance.now()-pointerDownAt;
  const wasTap=!dragMoved&&distance<=TAP_MAX_DISTANCE&&elapsed<=TAP_MAX_MS;
  const clientX=e.clientX;
  const clientY=e.clientY;
  clearFieldPointer(e);
  if(wasTap)setTapDestination(clientX,clientY);
}

function cancelFieldMove(e=null){
  if(!clearFieldPointer(e))return;
  autoTarget=null;
}

if(fieldStage){
  fieldStage.addEventListener('pointerdown',beginFieldMove,{passive:false});
  fieldStage.addEventListener('pointermove',moveFieldMove,{passive:false});
  fieldStage.addEventListener('pointerup',endFieldMove);
  fieldStage.addEventListener('pointercancel',cancelFieldMove);
}

miniBtn.addEventListener('click',()=>{cancelFieldMove();overlay.hidden=false;drawWorldMap(worldMap,game.world,markpoints);});
closeMap.addEventListener('click',()=>{overlay.hidden=true;});
item.addEventListener('click',()=>{cancelFieldMove();setActiveGame(game);location.href='./desertsurvival_item.html';});

window.addEventListener('blur',()=>cancelFieldMove());
window.addEventListener('resize',()=>{resize();drawHud();maps();updateCamera();});
window.addEventListener('pagehide',()=>{cancelFieldMove();setActiveGame(game);});

buildPlacedObjects();
buildMarkpoints();
updateCells(true);
resize();
drawHud();
discoverNearbyMarkpoints();
maps();
updateCamera();
updateLight();
requestAnimationFrame(frame);
