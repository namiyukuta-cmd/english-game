import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

import {getActiveGame,setActiveGame,createNewGameState} from './save.js';
import {normalizePlayer,advancePlayer} from './player.js';
import {advanceTime,TIME_SCALE,formatTime} from './time.js';
import {getAmbientTemperature} from './temperature.js';
import {updateWeather} from './weather.js';
import {moveWorldPosition} from './world.js';
import {markpoints} from './markpoints.js';
import {getNearbyMarkpoint} from './markpoint-common.js';
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
const interact=$('interactBtn');
const item=$('itemBtn');
const run=$('runBtn');
const pad=$('movePad');
const knob=$('moveKnob');

let game=getActiveGame()||createNewGameState();
normalizePlayer(game.player);
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

  g.userData.robe=robe;
  g.userData.head=head;
  return g;
}

const player=makePlayer();
player.position.set(game.world.x,0,game.world.z);
scene.add(player);

/* ---------- continuous world cells ---------- */
const CELL=18;
const RADIUS_X=8;
const RADIUS_Z=10;
const cells=new Map();

const duneGeo=new THREE.SphereGeometry(1,10,6);
const duneMatA=new THREE.MeshLambertMaterial({color:0xd9bf8d});
const duneMatB=new THREE.MeshLambertMaterial({color:0xc9a973});
const rockGeo=new THREE.DodecahedronGeometry(1,0);
const rockMat=new THREE.MeshLambertMaterial({color:0x71614f});
const scrubGeo=new THREE.ConeGeometry(1,1,5);
const scrubMat=new THREE.MeshLambertMaterial({color:0x746a43});

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
      scene.remove(group);
      cells.delete(key);
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

/* ---------- HUD / map ---------- */
function bar(name,value){
  const safe=Math.max(0,Math.min(100,Number(value||0)));
  return `<div class="hud-row"><b>${name}</b><span class="hud-bar"><i style="width:${safe}%"></i></span><span>${Math.round(value)}</span></div>`;
}
function drawHud(){
  const ambient=getAmbientTemperature(game.time,game.weather.type);
  const status=game.player.status?.length?game.player.status.join(' / '):'正常';
  hud.innerHTML=`${bar('体力',game.player.health)}${bar('水',game.player.water)}${bar('食',game.player.food)}${bar('睡眠',game.player.sleep)}<div class="hud-row"><b>体温</b><span>${game.player.bodyTemp.toFixed(1)}℃</span><span></span></div><div class="hud-row"><b>外気</b><span>${ambient.toFixed(1)}℃</span><span></span></div><div class="hud-row"><b>状態</b><span>${status}</span><span></span></div><div class="hud-clock-row"><canvas id="clockCanvas" width="84" height="84"></canvas><span>${formatTime(game.time)}</span></div>`;
  const cc=$('clockCanvas');
  if(cc){cc.style.width='72px';cc.style.height='72px';drawClock(cc,game.time);}
}
function maps(){
  drawMiniMap(mini,game.world,markpoints);
  if(!overlay.hidden)drawWorldMap(worldMap,game.world,markpoints);
}
function nearby(){
  const p=getNearbyMarkpoint(game.world,markpoints);
  interact.disabled=!p;
  interact.title=p?.name||'';
  if(p&&!game.world.discoveredMarkpoints.includes(p.id)){
    game.world.discoveredMarkpoints.push(p.id);
    maps();
  }
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

/* ---------- movement ---------- */
let ix=0,iy=0,pointerId=null,last=performance.now(),timeAcc=0,saveAcc=0,walkPhase=0;

function minuteTick(){
  advanceTime(game.time,1);
  updateWeather(game.weather,game.time);
  advancePlayer(game.player,{ambientTemp:getAmbientTemperature(game.time,game.weather.type),weather:game.weather.type,running:game.world.running,sheltered:game.world.sheltered},1);
  drawHud();maps();updateLight();
}

function updateMovement(dt){
  if(!overlay.hidden)return;
  const mag=Math.hypot(ix,iy);
  if(mag<.05)return;
  const nx=ix/mag;
  const nz=iy/mag;
  const speed=game.world.running?20:11.5;
  const moved=moveWorldPosition(game.world,nx*speed*dt,nz*speed*dt);
  if(!moved.moved)return;

  player.position.x=game.world.x;
  player.position.z=game.world.z;
  player.rotation.y=Math.atan2(-nx,-nz);
  walkPhase+=dt*(game.world.running?13:8);
  player.position.y=Math.abs(Math.sin(walkPhase))*.055;
  timeAcc+=moved.gameMinutes;
  updateCells();nearby();maps();updateCamera();
}

function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));
  last=now;
  updateMovement(dt);
  if(Math.hypot(ix,iy)<.05)player.position.y+=(0-player.position.y)*.2;
  timeAcc+=dt*(1000/TIME_SCALE.realMillisecondsPerGameMinute);
  while(timeAcc>=1){minuteTick();timeAcc-=1;}
  saveAcc+=dt;
  if(saveAcc>=3){setActiveGame(game);saveAcc=0;}
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}

function stick(e){
  const r=pad.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top+r.height/2,max=Math.max(20,r.width*.32);
  let dx=e.clientX-cx,dy=e.clientY-cy;
  const d=Math.hypot(dx,dy);
  if(d>max){dx=dx/d*max;dy=dy/d*max;}
  ix=dx/max;iy=dy/max;
  knob.style.transform=`translate(${dx}px,${dy}px)`;
}
pad.addEventListener('pointerdown',e=>{pointerId=e.pointerId;pad.setPointerCapture(pointerId);stick(e);});
pad.addEventListener('pointermove',e=>{if(e.pointerId===pointerId)stick(e);});
function release(e){if(e&&pointerId!==null&&e.pointerId!==pointerId)return;pointerId=null;ix=0;iy=0;knob.style.transform='translate(0,0)';}
pad.addEventListener('pointerup',release);
pad.addEventListener('pointercancel',release);

function stopRun(){game.world.running=false;run.textContent='RUN';}
run.addEventListener('pointerdown',()=>{game.world.running=true;run.textContent='RUNNING';});
run.addEventListener('pointerup',stopRun);
run.addEventListener('pointercancel',stopRun);
run.addEventListener('pointerleave',stopRun);

miniBtn.addEventListener('click',()=>{release();stopRun();overlay.hidden=false;drawWorldMap(worldMap,game.world,markpoints);});
closeMap.addEventListener('click',()=>{overlay.hidden=true;});
item.addEventListener('click',()=>{setActiveGame(game);location.href='./desertsurvival_menu.html';});
interact.addEventListener('click',()=>{const p=getNearbyMarkpoint(game.world,markpoints);if(p)alert(p.name||'地点');});

window.addEventListener('resize',()=>{resize();drawHud();maps();updateCamera();});
window.addEventListener('pagehide',()=>setActiveGame(game));

buildMarkpoints();
updateCells(true);
resize();
drawHud();
nearby();
maps();
updateCamera();
updateLight();
requestAnimationFrame(frame);
