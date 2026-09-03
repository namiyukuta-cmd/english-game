(()=>{
  'use strict';

  const Store=window.MagicGameState;
  const state=Store.load();
  const $=id=>document.getElementById(id);

  const DUNGEON_VERSION=2;
  const FLOOR_SIZE=8;
  const DIRS={
    up:{dx:0,dy:-1,opposite:'down'},
    down:{dx:0,dy:1,opposite:'up'},
    left:{dx:-1,dy:0,opposite:'right'},
    right:{dx:1,dy:0,opposite:'left'}
  };

  const templates=[
    [[0,0],[0,-1],[0,-2],[-1,-1],[1,-1],[1,-2],[2,-1],[1,0]],
    [[0,0],[0,-1],[0,-2],[0,-3],[1,-1],[1,-2],[-1,-2],[-2,-2]],
    [[0,0],[1,0],[2,0],[1,-1],[1,1],[2,-1],[3,-1],[1,2]],
    [[0,0],[0,-1],[-1,-1],[1,-1],[-1,-2],[1,-2],[1,-3],[2,-2]]
  ];

  const ENEMIES=[
    {enemyName:'Goblin',ja:'ゴブリン',visual:'👺',hp:4,attack:1,description:'A goblin blocks the way.'},
    {enemyName:'Red Slime',ja:'赤いスライム',visual:'🔴',hp:3,attack:1,description:'A red slime appears.'},
    {enemyName:'Blue Slime',ja:'青いスライム',visual:'🔵',hp:3,attack:1,description:'A blue slime appears.'},
    {enemyName:'Skeleton',ja:'骸骨兵',visual:'💀',hp:4,attack:1,description:'A skeleton raises its weapon.'}
  ];

  const months=['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
  const weekdays=['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'];
  const weekShort=['1st wk.','2nd wk.','3rd wk.','4th wk.','5th wk.'];

  let message='道がある方向へ進めます。未探索の枝道は消えません。';

  function ordinal(n){
    const v=n%100;
    if(v>=11&&v<=13)return n+'th';
    if(n%10===1)return n+'st';
    if(n%10===2)return n+'nd';
    if(n%10===3)return n+'rd';
    return n+'th';
  }

  function seasonLabel(month){
    if([2,3,4].includes(month))return 'Spring';
    if([5,6,7].includes(month))return 'Summer';
    if([8,9,10].includes(month))return 'Fall';
    return 'Winter';
  }

  function weekIndex(){return Math.min(4,Math.floor((state.day-1)/7))}

  function clock(){
    const h=Number(state.hour||0);
    const shown=h===0?12:h>12?h-12:h;
    return `${shown}:${String(state.minute||0).padStart(2,'0')} ${h>=12?'p.m.':'a.m.'}`;
  }

  function statText(key){
    const base=Number((state.stats&&state.stats[key])||0);
    const buff=Number((state.dailyBuff&&state.dailyBuff[key])||0);
    return buff?`${base}+${buff}`:String(base);
  }

  function updateHud(){
    $('dateMain').textContent=`${months[state.month]} ${ordinal(state.day)}`;
    $('dateSub').textContent=`${weekdays[state.weekday]} · ${seasonLabel(state.month)} · ${weekShort[weekIndex()]}`;
    $('clockMain').textContent=clock();
    $('timeValue').textContent=clock();
    $('hourValue').textContent=state.hour;
    $('minuteValue').textContent=String(state.minute||0).padStart(2,'0');
    $('hpValue').textContent=state.hp;
    $('mpValue').textContent=state.mp;
    $('supplyValue').textContent=state.supply;
    $('peValue').textContent=statText('PE');
    $('scienceValue').textContent=statText('science');
    $('historyValue').textContent=statText('history');
    $('mathValue').textContent=statText('math');
    $('artValue').textContent=statText('art');
  }

  function save(){Store.save(state)}

  function transformedCoords(source){
    const rotations=Math.floor(Math.random()*4);
    const mirror=Math.random()<0.5;
    return source.map(([originalX,originalY])=>{
      let x=mirror?-originalX:originalX;
      let y=originalY;
      for(let i=0;i<rotations;i++){
        const oldX=x;
        x=-y;
        y=oldX;
      }
      return [x,y];
    });
  }

  function buildLinks(tiles){
    const byPosition=new Map();
    tiles.forEach(tile=>byPosition.set(`${tile.x},${tile.y}`,tile.id));
    tiles.forEach(tile=>{
      tile.links={};
      Object.entries(DIRS).forEach(([dir,delta])=>{
        const neighbor=byPosition.get(`${tile.x+delta.dx},${tile.y+delta.dy}`);
        if(neighbor!==undefined)tile.links[dir]=neighbor;
      });
    });
  }

  function farthestLeaf(tiles){
    const distance={0:0};
    const queue=[0];
    while(queue.length){
      const id=queue.shift();
      const tile=tiles[id];
      Object.values(tile.links).forEach(next=>{
        if(distance[next]!==undefined)return;
        distance[next]=distance[id]+1;
        queue.push(next);
      });
    }
    const leaves=tiles.filter(tile=>tile.id!==0&&Object.keys(tile.links).length===1);
    const pool=leaves.length?leaves:tiles.filter(tile=>tile.id!==0);
    pool.sort((a,b)=>(distance[b.id]||0)-(distance[a.id]||0));
    return pool[0].id;
  }

  function generateFloor(number){
    const base=templates[Math.floor(Math.random()*templates.length)];
    const coords=transformedCoords(base);
    const tiles=coords.map(([x,y],id)=>({id,x,y,links:{},encounterChecked:id===0,encounterResolved:id===0,enemyPending:null}));
    buildLinks(tiles);
    const stairsDown=farthestLeaf(tiles);
    return {number,tiles,discovered:[0],current:0,stairsUp:number>1?0:null,stairsDown};
  }

  function ensureDungeon(){
    if(!state.magicDungeon||state.magicDungeon.version!==DUNGEON_VERSION){
      state.magicDungeon={version:DUNGEON_VERSION,activeFloor:1,floors:{1:generateFloor(1)}};
      save();
    }
    const dungeon=state.magicDungeon;
    if(!dungeon.floors[dungeon.activeFloor]){
      dungeon.floors[dungeon.activeFloor]=generateFloor(dungeon.activeFloor);
      save();
    }
    return dungeon;
  }

  function currentFloor(){
    const dungeon=ensureDungeon();
    return dungeon.floors[dungeon.activeFloor];
  }

  function roomName(floor,tile){
    if(floor.number===1&&tile.id===0)return 'Entrance';
    if(floor.number>1&&tile.id===floor.stairsUp)return 'Stairs Up';
    if(tile.id===floor.stairsDown)return 'Stairs Down';
    const dirs=Object.keys(tile.links);
    if(dirs.length===4)return 'Crossroads';
    if(dirs.length===3)return 'T-Junction';
    if(dirs.length===1)return 'Dead End';
    if(dirs.length===2){
      const straight=(dirs.includes('up')&&dirs.includes('down'))||(dirs.includes('left')&&dirs.includes('right'));
      return straight?'Passage':'Corner';
    }
    return 'Room';
  }

  function renderMap(floor){
    const map=$('dungeonMap');
    const xs=floor.tiles.map(tile=>tile.x);
    const ys=floor.tiles.map(tile=>tile.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    map.style.gridTemplateColumns=`repeat(${maxX-minX+1},var(--tile))`;
    map.style.gridTemplateRows=`repeat(${maxY-minY+1},var(--tile))`;
    map.innerHTML='';

    const discovered=new Set(floor.discovered);
    floor.tiles.forEach(tile=>{
      if(!discovered.has(tile.id))return;
      const cell=document.createElement('div');
      cell.className='dungeon-cell'+(tile.id===floor.current?' current':'');
      cell.style.gridColumn=String(tile.x-minX+1);
      cell.style.gridRow=String(tile.y-minY+1);

      Object.entries(tile.links).forEach(([dir,target])=>{
        const path=document.createElement('span');
        path.className=`dungeon-path ${dir}${discovered.has(target)?'':' unknown'}`;
        cell.appendChild(path);
      });

      const mark=document.createElement('span');
      mark.className='cell-mark';
      if(tile.enemyPending&&!tile.encounterResolved)mark.textContent='!';
      else if(floor.number===1&&tile.id===0)mark.textContent='S';
      else if(tile.id===floor.stairsDown){mark.textContent='↓';mark.classList.add('stairs')}
      else if(floor.number>1&&tile.id===floor.stairsUp){mark.textContent='↑';mark.classList.add('stairs')}
      cell.appendChild(mark);
      map.appendChild(cell);
    });
  }

  function renderControls(floor){
    const tile=floor.tiles[floor.current];
    $('floorTitle').textContent=`B${floor.number}F`;
    $('foundText').textContent=`MAP ${floor.discovered.length} / ${FLOOR_SIZE}`;
    $('floorCount').textContent=`B${floor.number}F · ${floor.discovered.length}/${FLOOR_SIZE}`;
    $('roomName').textContent=roomName(floor,tile);
    $('dungeonMessage').textContent=message;

    document.querySelectorAll('.dir-btn').forEach(button=>{
      button.disabled=tile.links[button.dataset.dir]===undefined;
    });

    const up=$('goUpBtn');
    const down=$('goDownBtn');
    up.hidden=!(floor.number>1&&floor.current===floor.stairsUp);
    down.hidden=!(floor.current===floor.stairsDown);
  }

  function render(){
    updateHud();
    const floor=currentFloor();
    renderMap(floor);
    renderControls(floor);
  }

  function beginEncounter(enemy,floor,tile,returnTileId){
    const battle={
      floorNumber:floor.number,
      tileId:tile.id,
      returnTileId,
      enemyName:enemy.enemyName,
      enemyJa:enemy.ja,
      visual:enemy.visual,
      description:enemy.description,
      enemyHp:enemy.hp,
      enemyMaxHp:enemy.hp,
      enemyAttack:enemy.attack
    };
    tile.enemyPending={...battle};
    state.magicBattle=battle;
    save();
    showEncounter(battle);
  }

  function showEncounter(battle){
    document.querySelector('.encounter-overlay')?.remove();
    const overlay=document.createElement('div');
    overlay.className='encounter-overlay';
    overlay.innerHTML=`<section class="encounter-card"><small>ENCOUNTER!</small><div class="encounter-visual">${battle.visual||'👺'}</div><h2>${battle.enemyJa||battle.enemyName}が現れた！</h2><p>${battle.enemyName} blocks the way.</p><button id="encounterFight" type="button">Fight<br><small>戦う</small></button></section>`;
    document.body.appendChild(overlay);
    $('encounterFight').onclick=()=>{location.href='magic-battle.html?v=20260903-1'};
  }

  function maybeEncounter(floor,tile,returnTileId,isNew){
    if(tile.encounterResolved)return false;
    if(tile.enemyPending){
      state.magicBattle={...tile.enemyPending,returnTileId};
      save();
      showEncounter(state.magicBattle);
      return true;
    }
    if(!isNew||tile.id===floor.stairsDown||(floor.number>1&&tile.id===floor.stairsUp))return false;
    tile.encounterChecked=true;
    if(Math.random()>=0.45){save();return false}
    const enemy=ENEMIES[Math.floor(Math.random()*ENEMIES.length)];
    beginEncounter(enemy,floor,tile,returnTileId);
    return true;
  }

  function move(dir){
    const floor=currentFloor();
    const tile=floor.tiles[floor.current];
    const target=tile.links[dir];
    if(target===undefined)return;

    const previousId=floor.current;
    const isNew=!floor.discovered.includes(target);
    floor.current=target;
    if(isNew)floor.discovered.push(target);
    message=isNew
      ? `新しい場所を発見しました。MAP ${floor.discovered.length}/${FLOOR_SIZE}。`
      : '探索済みの場所へ戻りました。枝道はそのまま残っています。';
    save();
    render();

    const targetTile=floor.tiles[target];
    maybeEncounter(floor,targetTile,previousId,isNew);
  }

  function goDown(){
    const dungeon=ensureDungeon();
    const floor=currentFloor();
    if(floor.current!==floor.stairsDown)return;
    const nextNumber=floor.number+1;
    if(!dungeon.floors[nextNumber])dungeon.floors[nextNumber]=generateFloor(nextNumber);
    dungeon.activeFloor=nextNumber;
    dungeon.floors[nextNumber].current=0;
    message=`B${nextNumber}Fへ下りました。上の階の地図と未探索の枝道は保存されています。`;
    save();
    render();
  }

  function goUp(){
    const dungeon=ensureDungeon();
    const floor=currentFloor();
    if(floor.number<=1||floor.current!==floor.stairsUp)return;
    const previousNumber=floor.number-1;
    dungeon.activeFloor=previousNumber;
    const previous=dungeon.floors[previousNumber];
    previous.current=previous.stairsDown;
    message=`B${previousNumber}Fへ戻りました。以前の枝道を続けて探索できます。`;
    save();
    render();
  }

  function returnMagic(){
    state.lastPlace='MAGIC SCHOOL';
    state.magicBattle=null;
    save();
    location.href='magic-school.html?v=20260903-9';
  }

  document.querySelectorAll('.dir-btn').forEach(button=>{button.onclick=()=>move(button.dataset.dir)});
  $('goDownBtn').onclick=goDown;
  $('goUpBtn').onclick=goUp;
  $('returnMagicBtn').onclick=returnMagic;
  $('returnMagicTop').onclick=returnMagic;
  $('saveBtn').onclick=()=>{
    save();
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>{$('saveMessage').textContent='';},900);
  };

  ensureDungeon();
  render();

  if(state.magicBattle){
    const floor=currentFloor();
    if(state.magicBattle.floorNumber===floor.number&&state.magicBattle.tileId===floor.current){
      showEncounter(state.magicBattle);
    }
  }
})();
