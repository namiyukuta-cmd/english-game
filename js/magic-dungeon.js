(()=>{
  'use strict';

  const Store=window.MagicGameState;
  const state=Store.load();
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const months=['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
  const weekdays=['Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'];
  const weekShort=['1st wk.','2nd wk.','3rd wk.','4th wk.','5th wk.'];

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

  function render(){
    const quest=state.currentQuest;
    $('dailyContent').innerHTML=quest
      ? `<div class="dialogue-card"><span class="speaker">JOB / 依頼</span><div class="en dialogue-en">${esc(quest.en)}</div><p class="jp">${esc(quest.ja)}</p></div><p class="jp">ダンジョン入口です。探索内容はまだ未設定です。</p>`
      : `<div class="dialogue-card"><span class="speaker">DUNGEON</span><div class="en dialogue-en">No job.</div><p class="jp">受けている依頼がありません。</p></div>`;
    $('dailyActions').innerHTML='';
  }

  $('saveBtn').onclick=()=>{
    Store.save(state);
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>{$('saveMessage').textContent='';},900);
  };

  updateHud();
  render();
})();
