(()=>{
  'use strict';

  const Store=window.MagicGameState;
  let state=Store.load();
  let stage='menu';
  let overlay=null;
  let offeredQuest=null;

  const months=[
    {full:'January',short:'Jan.'},{full:'February',short:'Feb.'},{full:'March',short:'Mar.'},{full:'April',short:'Apr.'},
    {full:'May',short:'May'},{full:'June',short:'Jun.'},{full:'July',short:'Jul.'},{full:'August',short:'Aug.'},
    {full:'September',short:'Sep.'},{full:'October',short:'Oct.'},{full:'November',short:'Nov.'},{full:'December',short:'Dec.'}
  ];
  const weekdays=[
    {full:'Sunday',short:'Sun.'},{full:'Monday',short:'Mon.'},{full:'Tuesday',short:'Tue.'},{full:'Wednesday',short:'Wed.'},
    {full:'Thursday',short:'Thu.'},{full:'Friday',short:'Fri.'},{full:'Saturday',short:'Sat.'}
  ];
  const weekShort=['1st wk.','2nd wk.','3rd wk.','4th wk.','5th wk.'];
  const quests=[
    {en:'Find a monster in the old ruins.',ja:'古い遺跡でモンスターを探す。',words:[['find','探す'],['monster','モンスター'],['old','古い']]},
    {en:'Help a worker in the ruins.',ja:'遺跡にいる作業員を助ける。',words:[['help','助ける'],['worker','作業員']]},
    {en:'Open an old door in the ruins.',ja:'遺跡にある古い扉を開ける。',words:[['open','開ける'],['old','古い'],['door','扉']]},
    {en:'Take an old book from the ruins.',ja:'遺跡から古い本を持ち帰る。',words:[['take','取る・持っていく'],['old','古い'],['book','本']]}
  ];

  const $=id=>document.getElementById(id);
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reEsc=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

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
    const h=state.hour;
    const shown=h===0?12:h>12?h-12:h;
    return `${shown}:${String(state.minute).padStart(2,'0')} ${h>=12?'p.m.':'a.m.'}`;
  }
  function statText(key){
    const base=Number(state.stats[key]||0);
    const buff=Number(state.dailyBuff[key]||0);
    return buff?`${base}+${buff}`:String(base);
  }
  function save(){Store.save(state)}

  function updateHud(){
    $('dateMain').textContent=`${months[state.month].short} ${ordinal(state.day)}`;
    $('dateSub').textContent=`${weekdays[state.weekday].short} · ${seasonLabel(state.month)} · ${weekShort[weekIndex()]}`;
    $('clockMain').textContent=clock();
    $('timeValue').textContent=clock();
    $('hourValue').textContent=state.hour;
    $('minuteValue').textContent=String(state.minute).padStart(2,'0');
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
  function highlight(text,words=[]){
    const terms=words.map(w=>w[0]).sort((a,b)=>b.length-a.length);
    if(!terms.length)return esc(text);
    const pattern=new RegExp(`(${terms.map(reEsc).join('|')})`,'gi');
    return esc(text).replace(pattern,'<mark class="learn-word">$1</mark>');
  }
  function study(words=[]){
    if(!words.length)return '';
    return `<section class="study-strip"><div class="study-title">MEMORIZE / 覚える</div><div class="study-list">${words.map(([en,ja])=>`<div class="study-item"><b>${esc(en)}</b><span>${esc(ja)}</span></div>`).join('')}</div></section>`;
  }
  function dialogue(speaker,en,ja,words=[]){
    $('dailyContent').innerHTML=`${study(words)}<div class="dialogue-card"><span class="speaker">${esc(speaker)}</span><div class="en dialogue-en">${highlight(en,words)}</div><p class="jp">${esc(ja)}</p></div>`;
  }

  function showMenu(){
    overlay=null;
    stage='menu';
    render();
  }
  function openClassroom(){
    overlay=null;
    stage='greeting';
    render();
  }
  function newQuest(){
    offeredQuest=pick(quests);
    stage='quest';
    render();
  }
  function acceptQuest(){
    state.currentQuest={en:offeredQuest.en,ja:offeredQuest.ja,status:'accepted'};
    save();
    stage='accepted';
    render();
  }

  function renderToday(){
    setHeader('TODAY','Today','WORK');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">TODAY</span><div class="en">${esc(months[state.month].full)} ${ordinal(state.day)}</div><p class="jp">${esc(weekdays[state.weekday].full)} / ${seasonLabel(state.month)} / ${clock()}</p></div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }
  function renderBag(){
    setHeader('BAG / かばん','Bag','WORK');
    const items=[];
    if(state.egg)items.push('egg / 卵');
    if(Array.isArray(state.inventory))items.push(...state.inventory);
    $('dailyContent').innerHTML=`${study([['bag','かばん']])}<div class="dialogue-card"><span class="speaker">BAG</span>${items.length?items.map(item=>`<p>${esc(item)}</p>`).join(''):'<p class="jp">empty / 空</p>'}</div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }
  function renderStatus(){
    setHeader('STATUS / ステータス','Status','WORK');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">STATUS</span><p><b>PE</b> ${esc(statText('PE'))}</p><p><b>SCIENCE</b> ${esc(statText('science'))}</p><p><b>HISTORY</b> ${esc(statText('history'))}</p><p><b>MATH</b> ${esc(statText('math'))}</p><p><b>ART</b> ${esc(statText('art'))}</p></div>`;
    clearActions(true);
    action('Back','戻る',()=>{overlay=null;render()},true);
  }

  function render(){
    updateHud();
    document.querySelectorAll('[data-jump]').forEach(button=>button.classList.toggle('on',button.dataset.jump===overlay || (button.dataset.jump==='school'&&!overlay)));

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
      action('Next','次へ',()=>{stage='jobIntro';render()},true);
      return;
    }

    if(stage==='jobIntro'){
      dialogue('RECEPTION','I have a job for you.','あなたに依頼があります。',[['job','仕事・依頼']]);
      clearActions(true);
      action('Next','次へ',newQuest,true);
      return;
    }

    if(stage==='quest'){
      if(!offeredQuest)offeredQuest=pick(quests);
      $('dailyContent').innerHTML=`${study(offeredQuest.words)}<div class="dialogue-card"><span class="speaker">RECEPTION</span><div class="en dialogue-en">${highlight(offeredQuest.en,offeredQuest.words)}</div><p class="jp">${esc(offeredQuest.ja)}</p></div><div class="quest-card"><small>JOB / 依頼</small><strong>${esc(offeredQuest.en)}</strong><p>${esc(offeredQuest.ja)}</p></div>`;
      clearActions(false);
      action('Another job','別の依頼',()=>{offeredQuest=pick(quests);render()});
      action('Accept','受ける',acceptQuest,true);
      return;
    }

    if(stage==='accepted'){
      dialogue('YOU','I take this job.','この依頼を受けます。',[['take','受ける・取る'],['job','仕事・依頼']]);
      clearActions(true);
      action('Magic School','Magic Schoolへ戻る',showMenu,true);
    }
  }

  document.querySelectorAll('[data-jump]').forEach(button=>{
    button.onclick=()=>{
      if(button.dataset.jump==='school'){
        showMenu();
        return;
      }
      overlay=button.dataset.jump;
      render();
    };
  });

  $('saveBtn').onclick=()=>{
    save();
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>$('saveMessage').textContent='',900);
  };

  updateHud();
  render();
})();
