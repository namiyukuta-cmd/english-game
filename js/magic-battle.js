(()=>{
  'use strict';

  const Store=window.MagicGameState;
  const state=Store.load();
  const $=id=>document.getElementById(id);

  const WORDS=[
    ['apple','りんご'],['banana','バナナ'],['egg','たまご'],['milk','牛乳'],['water','水'],['juice','ジュース'],
    ['dog','犬'],['cat','猫'],['fish','魚'],['bird','鳥'],['book','本'],['pen','ペン'],['pencil','鉛筆'],['desk','机'],
    ['chair','いす'],['school','学校'],['morning','朝'],['night','夜'],['red','赤'],['blue','青'],['green','緑'],['yellow','黄色'],
    ['walk','歩く'],['run','走る'],['open','開ける'],['close','閉める'],['take','取る'],['put','置く'],['eat','食べる'],['drink','飲む']
  ];

  let battle=state.magicBattle||null;
  let quizIndex=0;
  let currentWord=null;
  let captureComplete=false;

  function save(){Store.save(state)}
  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function shuffle(list){
    const a=[...list];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a;
  }

  function dungeonFloor(){
    const d=state.magicDungeon;
    if(!d||!d.floors)return null;
    return d.floors[battle?.floorNumber||d.activeFloor]||null;
  }

  function returnToDungeon(){
    save();
    location.href='magic-dungeon.html?v=20260903-3';
  }

  function flee(){
    if(!battle||battle.enemyHp<=0)return;
    const floor=dungeonFloor();
    if(floor&&battle.returnTileId!==undefined&&battle.returnTileId!==null){
      floor.current=battle.returnTileId;
    }
    state.magicBattle=null;
    save();
    returnToDungeon();
  }

  function totalStat(key){
    return Number(state.stats?.[key]||0)+Number(state.dailyBuff?.[key]||0);
  }

  function enemyTurn(){
    if(!battle||battle.enemyHp<=0)return;
    const damage=Math.max(1,Number(battle.enemyAttack||1));
    state.hp=clamp(Number(state.hp||0)-damage,0,Number(state.maxHp||5));
    if(state.hp<=0){
      state.hp=1;
      state.magicBattle=null;
      state.lastPlace='MAGIC SCHOOL';
      save();
      $('battleMessage').textContent='You were defeated. Return Magic takes you back to Magic School.';
      $('commandGrid').innerHTML='<button id="defeatReturn" type="button" style="grid-column:1/-1">Return Magic<small>帰還魔法</small></button>';
      $('defeatReturn').onclick=()=>{location.href='magic-school.html?v=20260903-9'};
      renderHud();
      return;
    }
    $('battleMessage').textContent=`${battle.enemyName} attacks. -${damage} HP`;
    save();
    renderHud();
  }

  function afterPlayerAction(message){
    battle.enemyHp=clamp(battle.enemyHp,0,battle.enemyMaxHp);
    state.magicBattle=battle;
    save();
    renderHud();
    if(battle.enemyHp<=0){
      $('battleMessage').textContent=`${battle.enemyName} can no longer resist. Capture it!`;
      $('commandGrid').classList.add('hidden');
      $('captureBtn').classList.remove('hidden');
      $('backBtn').disabled=true;
      return;
    }
    $('battleMessage').textContent=message;
    setTimeout(enemyTurn,220);
  }

  function attack(){
    if(!battle||battle.enemyHp<=0)return;
    const damage=totalStat('PE')>=3?2:1;
    battle.enemyHp-=damage;
    afterPlayerAction(`Attack! ${battle.enemyName} takes ${damage} damage.`);
  }

  function magic(){
    if(!battle||battle.enemyHp<=0)return;
    if(Number(state.mp||0)<=0){$('battleMessage').textContent='Not enough MP.';return}
    state.mp=Math.max(0,Number(state.mp)-1);
    const damage=totalStat('art')>=3?3:2;
    battle.enemyHp-=damage;
    afterPlayerAction(`Magic! ${battle.enemyName} takes ${damage} damage.`);
  }

  function item(){
    if(!battle||battle.enemyHp<=0)return;
    if(Number(state.supply||0)<=0){$('battleMessage').textContent='No items left.';return}
    state.supply=Math.max(0,Number(state.supply)-1);
    state.hp=clamp(Number(state.hp||0)+2,0,Number(state.maxHp||5));
    state.magicBattle=battle;
    save();
    renderHud();
    $('battleMessage').textContent='Item used. +2 HP';
    setTimeout(enemyTurn,220);
  }

  function renderHud(){
    if(!battle)return;
    $('playerHp').textContent=`${state.hp} / ${state.maxHp}`;
    $('enemyHpTop').textContent=`${battle.enemyHp} / ${battle.enemyMaxHp}`;
    $('enemyHpText').textContent=`${battle.enemyHp} / ${battle.enemyMaxHp}`;
    $('enemyHpFill').style.width=`${battle.enemyMaxHp?Math.round((battle.enemyHp/battle.enemyMaxHp)*100):0}%`;
    $('enemyVisual').textContent=battle.visual||'👺';
    $('enemyName').textContent=battle.enemyName||'Monster';
    $('enemyText').textContent=battle.description||'A monster blocks the way.';
  }

  function nextQuestion(){
    currentWord=WORDS[Math.floor(Math.random()*WORDS.length)];
    $('wordProgress').textContent=`${quizIndex+1} / 3`;
    $('wordQuestion').innerHTML=`<small>この意味の英単語は？</small>${currentWord[1]}`;
    $('wordResult').textContent='';
    $('wordResult').className='word-result';

    const wrong=shuffle(WORDS.filter(word=>word[0]!==currentWord[0])).slice(0,3).map(word=>word[0]);
    const options=shuffle([currentWord[0],...wrong]);
    $('wordOptions').innerHTML='';
    options.forEach(word=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='word-option';
      button.textContent=word;
      button.onclick=()=>answerWord(word);
      $('wordOptions').appendChild(button);
    });
  }

  function answerWord(answer){
    if(captureComplete)return;
    if(answer!==currentWord[0]){
      $('wordResult').textContent='× もう一度';
      $('wordResult').className='word-result wrong';
      return;
    }
    quizIndex+=1;
    $('wordResult').textContent='○ Correct!';
    $('wordResult').className='word-result correct';
    if(quizIndex>=3){
      completeCapture();
      return;
    }
    setTimeout(nextQuestion,320);
  }

  function completeCapture(){
    captureComplete=true;
    const floor=dungeonFloor();
    if(floor){
      const tile=floor.tiles?.find(tile=>tile.id===battle.tileId);
      if(tile)tile.encounterResolved=true;
    }
    if(!Array.isArray(state.capturedMonsters))state.capturedMonsters=[];
    state.capturedMonsters.push({name:battle.enemyName,floor:battle.floorNumber});
    state.magicBattle=null;
    state.lastPlace='DUNGEON';
    save();

    $('wordProgress').textContent='3 / 3';
    $('wordQuestion').innerHTML='<small>CAPTURE SUCCESS</small>Captured!';
    $('wordOptions').innerHTML='';
    $('wordResult').textContent=`${battle.enemyName} を捕まえた！`;
    $('wordResult').className='word-result correct';
    $('captureDone').classList.remove('hidden');
  }

  function startCapture(){
    if(!battle||battle.enemyHp>0)return;
    $('captureBtn').classList.add('hidden');
    $('capturePanel').classList.remove('hidden');
    $('backBtn').disabled=true;
    quizIndex=0;
    nextQuestion();
  }

  if(!battle){
    location.href='magic-dungeon.html?v=20260903-3';
    return;
  }

  $('attackBtn').onclick=attack;
  $('magicBtn').onclick=magic;
  $('itemBtn').onclick=item;
  $('runBtn').onclick=flee;
  $('backBtn').onclick=flee;
  $('captureBtn').onclick=startCapture;
  $('captureDone').onclick=returnToDungeon;

  renderHud();
  if(battle.enemyHp<=0){
    $('commandGrid').classList.add('hidden');
    $('captureBtn').classList.remove('hidden');
    $('backBtn').disabled=true;
    $('battleMessage').textContent=`${battle.enemyName} can no longer resist. Capture it!`;
  }
})();
