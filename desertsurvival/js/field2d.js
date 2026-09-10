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

const g=id=>document.getElementById(id),cv=g('worldCanvas'),hud=g('playerHud'),mini=g('miniMapCanvas'),miniBtn=g('miniMapBtn'),ov=g('mapOverlay'),close=g('closeMapBtn'),wm=g('worldMapCanvas'),look=g('interactBtn'),item=g('itemBtn'),run=g('runBtn'),pad=g('movePad'),knob=g('moveKnob');
let game=getActiveGame()||createNewGameState();normalizePlayer(game.player);setActiveGame(game);
let ax=0,ay=0,pointer=null,last=performance.now(),ta=0,sa=0,dir=0,walk=0;
const CELL=72,MARGIN=150;
function hash(x,z){let h=Math.imul(x|0,374761393)^Math.imul(z|0,668265263);h=(h^(h>>>13))*1274126177;return(h^(h>>>16))>>>0}
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function fit(){const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),w=r.width|0,h=r.height|0;if(cv.width!==(w*d|0)||cv.height!==(h*d|0)){cv.width=w*d|0;cv.height=h*d|0}const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return{c,w,h}}
function pos(wx,wz,w,h){return{x:w/2+wx-game.world.x,y:h*.56+wz-game.world.z}}
function bar(n,v){return `<div class="hud-row"><b>${n}</b><span class="hud-bar"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></span><span>${Math.round(v)}</span></div>`}
function drawHud(){const t=getAmbientTemperature(game.time,game.weather.type),s=game.player.status?.length?game.player.status.join(' / '):'正常';hud.innerHTML=`${bar('体力',game.player.health)}${bar('水',game.player.water)}${bar('食',game.player.food)}${bar('睡眠',game.player.sleep)}<div class="hud-row"><b>体温</b><span>${game.player.bodyTemp.toFixed(1)}℃</span><span></span></div><div class="hud-row"><b>外気</b><span>${t.toFixed(1)}℃</span><span></span></div><div class="hud-row"><b>状態</b><span>${s}</span><span></span></div><div class="hud-clock-row"><canvas id="clockCanvas" width="84" height="84"></canvas><span>${formatTime(game.time)}</span></div>`;const c=g('clockCanvas');if(c){c.style.width='72px';c.style.height='72px';drawClock(c,game.time)}}
function maps(){drawMiniMap(mini,game.world,markpoints);if(!ov.hidden)drawWorldMap(wm,game.world,markpoints)}
function near(){const p=getNearbyMarkpoint(game.world,markpoints);look.disabled=!p;look.title=p?.name||'';if(p&&!game.world.discoveredMarkpoints.includes(p.id)){game.world.discoveredMarkpoints.push(p.id);maps()}}
function dune(c,x,y,r,rot){c.save();c.translate(x,y);c.rotate(rot);c.scale(1.8,.7);c.fillStyle='#d4bd8f';c.beginPath();c.ellipse(0,0,r,r,0,0,7);c.fill();c.restore()}
function rock(c,x,y,r){c.fillStyle='#75604a';c.beginPath();c.arc(x,y,r,0,7);c.fill()}
function scrub(c,x,y,r){c.strokeStyle='#75683f';for(let i=0;i<5;i++){const a=i*1.256;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.stroke()}}
function terrain(c,w,h){const minX=Math.floor((game.world.x-w/2-MARGIN)/CELL),maxX=Math.floor((game.world.x+w/2+MARGIN)/CELL),minZ=Math.floor((game.world.z-h/2-MARGIN)/CELL),maxZ=Math.floor((game.world.z+h/2+MARGIN)/CELL);for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){const R=rng(hash(x,z)),wx=x*CELL+10+R()*(CELL-20),wz=z*CELL+10+R()*(CELL-20),p=pos(wx,wz,w,h),k=R();if(k<.40)dune(c,p.x,p.y,12+R()*18,R()*3.14);else if(k<.82)rock(c,p.x,p.y,5+R()*9);else scrub(c,p.x,p.y,6+R()*6)}}
function mark(c,w,h){for(const p of markpoints){if(!Number.isFinite(+p.x)||!Number.isFinite(+p.z))continue;const q=pos(+p.x,+p.z,w,h);if(q.x<-60||q.x>w+60||q.y<-60||q.y>h+60)continue;c.fillStyle=p.type==='water'?'#527d8c':p.type==='town'?'#8b6844':'#594c3c';c.beginPath();c.arc(q.x,q.y,p.type==='town'?15:10,0,7);c.fill()}}
function player(c,w,h){const x=w/2,y=h*.56+Math.sin(walk)*1.2;c.save();c.translate(x,y);c.rotate(dir);c.fillStyle='#37342d';c.beginPath();c.moveTo(-10,15);c.lineTo(-8,-7);c.lineTo(8,-7);c.lineTo(10,15);c.fill();c.fillStyle='#b98a61';c.beginPath();c.arc(0,-15,9,0,7);c.fill();c.fillStyle='#e4c39b';c.beginPath();c.moveTo(-3,-24);c.lineTo(3,-24);c.lineTo(0,-30);c.fill();c.restore()}
function draw(now){const {c,w,h}=fit();c.fillStyle='#c8ae7d';c.fillRect(0,0,w,h);terrain(c,w,h);mark(c,w,h);player(c,w,h);if(game.weather.type==='sandstorm'){c.fillStyle='rgba(148,112,65,.22)';c.fillRect(0,0,w,h);c.strokeStyle='rgba(246,226,181,.3)';for(let i=0;i<25;i++){let y=(i*51+now*.07)%(h+80)-40;c.beginPath();c.moveTo(0,y);c.lineTo(w,y-50);c.stroke()}}}
function minute(){advanceTime(game.time,1);updateWeather(game.weather,game.time);advancePlayer(game.player,{ambientTemp:getAmbientTemperature(game.time,game.weather.type),weather:game.weather.type,running:game.world.running,sheltered:game.world.sheltered},1);drawHud();maps()}
function move(dt){if(!ov.hidden)return;let m=Math.hypot(ax,ay);if(m<.05)return;let x=ax/m,z=ay/m,s=game.world.running?132:76,d=moveWorldPosition(game.world,x*s*dt,z*s*dt);if(d.moved){dir=Math.atan2(x,-z);walk+=dt*(game.world.running?13:8);ta+=d.gameMinutes;near();maps()}}
function frame(now){let dt=Math.min(.05,(now-last)/1000);last=now;move(dt);ta+=dt*(1000/TIME_SCALE.realMillisecondsPerGameMinute);while(ta>=1){minute();ta--}sa+=dt;if(sa>=3){setActiveGame(game);sa=0}draw(now);requestAnimationFrame(frame)}
function stick(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.32;let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y);if(d>max){x=x/d*max;y=y/d*max}ax=x/max;ay=y/max;knob.style.transform=`translate(${x}px,${y}px)`}
pad.onpointerdown=e=>{pointer=e.pointerId;pad.setPointerCapture(pointer);stick(e)};pad.onpointermove=e=>{if(e.pointerId===pointer)stick(e)};function release(){pointer=null;ax=ay=0;knob.style.transform='translate(0,0)'}pad.onpointerup=release;pad.onpointercancel=release;
function stop(){game.world.running=false;run.textContent='RUN'}run.onpointerdown=()=>{game.world.running=true;run.textContent='RUNNING'};run.onpointerup=stop;run.onpointercancel=stop;
miniBtn.onclick=()=>{release();stop();ov.hidden=false;drawWorldMap(wm,game.world,markpoints)};close.onclick=()=>ov.hidden=true;item.onclick=()=>{setActiveGame(game);location.href='./desertsurvival_menu.html'};look.onclick=()=>{const p=getNearbyMarkpoint(game.world,markpoints);if(p)alert(p.name||'地点')};
addEventListener('resize',()=>{drawHud();maps();draw(performance.now())});addEventListener('pagehide',()=>setActiveGame(game));drawHud();near();maps();requestAnimationFrame(frame);
