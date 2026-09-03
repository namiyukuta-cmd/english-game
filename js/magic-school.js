(()=>{
  'use strict';

  const Store=window.MagicGameState;
  const Quest=window.MagicQuestEngine;
  let state=Store.load();
  let stage='menu';
  let overlay=null;
  let offeredQuest=null;
  let lastRewardQuest=null;

  const sideQuests=Array.isArray(window.MAGIC_SIDE_QUESTS)?window.MAGIC_SIDE_QUESTS:[];

  const months=['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
  const monthFull=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekdays=['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'];
  const weekdayFull=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const weekShort=['1st wk.','2nd wk.','3rd wk.','4th wk.','5th wk.'];

  const $=id=>document.getElementById(id);
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

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
    const base=Number(state.stats?.[key]||0);
    const buff=Number(state.dailyBuff?.[key]||0);
    return buff?`${base}+${buff}`:String(base);
  }

  function save(){Store.save(state)}

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

  function setHeader(kicker,title,place='WORK'){
    $('stageKicker').textContent=kicker;
    $('stageTitle').textContent=title;
    $('placeLabel').textContent=place;
  }

  function clearActions(one=false){
    const area=$('dailyActions');
    area.innerHTML='';
    area.classList.toggle('one',one);
  }

  function action(en,ja,fn,primary=false){
    const b=document.createElement('button');
    b.type='button';
    b.innerHTML=`${esc(en)}<br><small>${esc(ja)}</small>`;
    if(primary)b.classList.add('primary');
    b.onclick=fn;
    $('dailyActions').appendChild(b);
  }

  function highlighted(text,words=[]){
    let html=esc(text);
    words.forEach(([en])=>{
      const safe=esc(en);
      html=html.split(safe).join(`<mark class="learn-word">${safe}</mark>`);
      const capital=safe.charAt(0).toUpperCase()+safe.slice(1);
      if(capital!==safe)html=html.split(capital).join(`<mark class="learn-word">${capital}</mark>`);
    });
    return html;
  }

  function study(words=[]){
    if(!words.length)return '';
    return `<section class="study-strip"><div class="study-title">MEMORIZE / 覚える</div><div class="study-list">${words.map(([en,ja])=>`<div class="study-item"><b>${esc(en)}</b><span>${esc(ja)}</span></div>`).join('')}</div></section>`;
  }

  function dialogue(speaker,en,ja,words=[]){
    $('dailyContent').innerHTML=`${study(words)}<div class="dialogue-card"><span class="speaker">${esc(speaker)}</span><div class="en dialogue-en">${highlighted(en,words)}</div><p class="jp">${esc(ja)}</p></div>`;
  }

  function showMenu(){overlay=null;stage='menu';render()}
  function openClassroom(){overlay=null;stage='greeting';render()}

  function newQuest(){
    if(!sideQuests.length)return;
    if(sideQuests.length===1){offeredQuest=sideQuests[0]}
    else{
      const choices=sideQuests.filter(quest=>quest.id!==offeredQuest?.id);
      offeredQuest=pick(choices.length?choices:sideQuests);
    }
    stage='quest';
    render();
  }

  function goDungeon(){
    state.lastPlace='DUNGEON';
    save();
    location.href='magic-dungeon.html?v=20260903-4';
  }

  function acceptQuest(){
    if(!offeredQuest)return;
    state.sideQuest={id:offeredQuest.id,status:'accepted'};
    state.currentQuest=null;
    save();
    goDungeon();
  }

  function activeQuestDef(){
    return state.sideQuest?.id?Quest.sideQuestById(state.sideQuest.id):null;
  }

  function progressRows(status){
    return status.details.map(item=>{
      const req=item.req;
      const label=req.type==='capture'
        ? `${req.target} × ${item.required}`
        : (req.labelEn||req.id||req.type);
      return `<div class="quest-progress-row"><span>${esc(label)}</span><strong>${item.current} / ${item.required}</strong></div>`;
    }).join('');
  }

  function renderActiveQuest(){
    const quest=activeQuestDef();
    if(!quest){
      state.sideQuest=null;
      save();
      stage='jobIntro';
      return render();
    }

    const status=Quest.sideQuestStatus(state,quest);
    $('dailyContent').innerHTML=`
      ${study(quest.words||[])}
      <div class="quest-card">
        <small>SIDE QUEST / 依頼</small>
        <strong>${esc(quest.en)}</strong>
        <p>${esc(quest.ja)}</p>
        <div class="quest-progress">${progressRows(status)}</div>
        <p><b>REWARD</b> ${esc(Quest.rewardText(quest.reward))}</p>
      </div>`;

    clearActions(false);
    if(status.met){
      action('Report','報告する',()=>{
        const result=Quest.turnInSideQuest(state,quest);
        if(!result.ok)return;
        lastRewardQuest=quest;
        state.sideQuest=null;
        save();
        stage='reward';
        render();
      },true);
    }else{
      action('Go to dungeon','遺跡へ行く',goDungeon,true);
    }
    action('Back','戻る',showMenu,false);
  }

  function renderToday(){
    setHeader('TODAY','Today','WORK');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">TODAY</span><div class="en">${esc(monthFull[state.month])} ${ordinal(state.day)}</div><p class="jp">${esc(weekdayFull[state.weekday])} / ${seasonLabel(state.month)} / ${clock()}</p></div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }

  function renderBag(){
    setHeader('BAG / かばん','Bag','WORK');
    const captured=Array.isArray(state.capturedMonsters)?state.capturedMonsters:[];
    const counts={};
    captured.forEach(monster=>{if(monster?.name)counts[monster.name]=(counts[monster.name]||0)+1});
    const capturedHtml=Object.entries(counts).map(([name,count])=>`<p>${esc(name)} × ${count}</p>`).join('');
    const items=Array.isArray(state.inventory)?state.inventory:[];
    $('dailyContent').innerHTML=`${study([['bag','かばん']])}<div class="dialogue-card"><span class="speaker">BAG</span>${capturedHtml||items.length?capturedHtml+items.map(item=>`<p>${esc(item)}</p>`).join(''):'<p class="jp">empty / 空</p>'}</div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }

  function renderStatus(){
    setHeader('STATUS / ステータス','Status','WORK');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">STATUS</span><p><b>PE</b> ${esc(statText('PE'))}</p><p><b>SCIENCE</b> ${esc(statText('science'))}</p><p><b>HISTORY</b> ${esc(statText('history'))}</p><p><b>MATH</b> ${esc(statText('math'))}</p><p><b>ART</b> ${esc(statText('art'))}</p><p><b>MONEY</b> ${Number(state.money||0)}</p></div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }

  function render(){
    updateHud();
    document.querySelectorAll('[data-jump]').forEach(button=>{
      button.classList.toggle('on',button.dataset.jump===overlay || (button.dataset.jump==='school'&&!overlay));
    });

    if(overlay==='today')return renderToday();
    if(overlay==='bag')return renderBag();
    if(overlay==='status')return renderStatus();

    if(stage==='menu'){
      setHeader('MAGIC SCHOOL','Magic School','WORK');
      $('dailyContent').innerHTML=`<div class="school-place-list"><button id="classroomBtn" class="place-button" type="button">Magic Classroom<small>魔法教室</small></button></div>`;
      clearActions();
      $('classroomBtn').onclick=openClassroom;
      return;
    }

    setHeader('MAGIC CLASSROOM','Magic Classroom','MAGIC SCHOOL');

    if(stage==='greeting'){
      dialogue('RECEPTION','Good morning.','おはようございます。',[['morning','朝']]);
      clearActions(true);
      action('Next','次へ',()=>{stage=state.sideQuest?'activeQuest':'jobIntro';render()},true);
      return;
    }

    if(stage==='jobIntro'){
      dialogue('RECEPTION','I have a job for you.','あなたに依頼があります。',[['job','仕事・依頼']]);
      clearActions(true);
      action('Next','次へ',newQuest,true);
      return;
    }

    if(stage==='activeQuest')return renderActiveQuest();

    if(stage==='reward'){
      const quest=lastRewardQuest;
      const reward=quest?Quest.rewardText(quest.reward):'Reward';
      dialogue('RECEPTION','Good job. Here is your reward.','依頼達成です。報酬をどうぞ。',[['job','仕事・依頼'],['reward','報酬']]);
      $('dailyContent').insertAdjacentHTML('beforeend',`<div class="quest-card"><small>REWARD</small><strong>${esc(reward)}</strong></div>`);
      clearActions(false);
      action('Another job','次の依頼',()=>{lastRewardQuest=null;newQuest()},true);
      action('Back','戻る',showMenu,false);
      return;
    }

    if(stage==='quest'){
      if(!offeredQuest)offeredQuest=sideQuests.length?pick(sideQuests):null;
      if(!offeredQuest){
        dialogue('RECEPTION','There are no jobs now.','今は依頼がありません。',[]);
        clearActions(true);
        action('Back','戻る',showMenu,true);
        return;
      }
      $('dailyContent').innerHTML=`${study(offeredQuest.words||[])}<div class="dialogue-card"><span class="speaker">RECEPTION</span><div class="en dialogue-en">${highlighted(offeredQuest.en,offeredQuest.words||[])}</div><p class="jp">${esc(offeredQuest.ja)}</p></div><div class="quest-card"><small>SIDE QUEST / 依頼</small><strong>${esc(offeredQuest.en)}</strong><p>${esc(offeredQuest.ja)}</p><p><b>REWARD</b> ${esc(Quest.rewardText(offeredQuest.reward))}</p></div>`;
      clearActions(false);
      action('Another job','別の依頼',newQuest,false);
      action('Accept','受ける',acceptQuest,true);
    }
  }

  document.querySelectorAll('[data-jump]').forEach(button=>{
    button.onclick=()=>{
      if(button.dataset.jump==='school')return showMenu();
      overlay=button.dataset.jump;
      render();
    };
  });

  $('saveBtn').onclick=()=>{
    save();
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>{$('saveMessage').textContent='';},900);
  };

  const initialButton=$('classroomBtn');
  if(initialButton)initialButton.onclick=openClassroom;

  updateHud();
  render();
})();
