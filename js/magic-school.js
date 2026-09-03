(()=>{
  'use strict';

  const Store=window.MagicGameState;
  let state=Store.load();
  let stage='menu';
  let offeredQuest=null;

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

  function save(){Store.save(state)}

  function action(en,ja,fn,primary=false){
    const b=document.createElement('button');
    b.type='button';
    b.innerHTML=`${esc(en)}<br><small>${esc(ja)}</small>`;
    if(primary)b.classList.add('primary');
    b.onclick=fn;
    $('classroomActions').appendChild(b);
  }

  function clearActions(one=false){
    const area=$('classroomActions');
    area.innerHTML='';
    area.classList.toggle('one',one);
  }

  function highlight(text,words=[]){
    const terms=words.map(w=>w[0]).sort((a,b)=>b.length-a.length);
    if(!terms.length)return esc(text);
    const pattern=new RegExp(`(${terms.map(reEsc).join('|')})`,'gi');
    return esc(text).replace(pattern,'<mark class="learn-word">$1</mark>');
  }

  function study(words=[]){
    if(!words.length)return '';
    return words.map(([en,ja])=>`<div class="study-strip"><div class="study-title">MEMORIZE / 覚える</div><div class="study-word"><b>${esc(en)}</b><span>${esc(ja)}</span></div></div>`).join('');
  }

  function dialogue(speaker,en,ja,words=[]){
    $('classroomContent').innerHTML=`${study(words)}<div class="dialogue-card"><span class="speaker">${esc(speaker)}</span><div class="english">${highlight(en,words)}</div><p class="japanese">${esc(ja)}</p></div>`;
  }

  function showSchoolMenu(){
    stage='menu';
    $('classroomView').classList.remove('active');
    $('schoolMenu').classList.remove('hidden');
  }

  function openClassroom(){
    $('schoolMenu').classList.add('hidden');
    $('classroomView').classList.add('active');
    stage='greeting';
    render();
  }

  function newQuest(){
    offeredQuest=pick(quests);
    stage='quest';
    render();
  }

  function acceptQuest(){
    state.currentQuest={
      en:offeredQuest.en,
      ja:offeredQuest.ja,
      status:'accepted'
    };
    save();
    stage='accepted';
    render();
  }

  function render(){
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
      $('classroomContent').innerHTML=`${study(offeredQuest.words)}<div class="dialogue-card"><span class="speaker">RECEPTION</span><div class="english">${highlight(offeredQuest.en,offeredQuest.words)}</div><p class="japanese">${esc(offeredQuest.ja)}</p></div><div class="quest-card"><small>JOB / 依頼</small><strong>${esc(offeredQuest.en)}</strong><p>${esc(offeredQuest.ja)}</p></div>`;
      clearActions(false);
      action('Another job','別の依頼',()=>{offeredQuest=pick(quests);render()});
      action('Accept','受ける',acceptQuest,true);
      return;
    }

    if(stage==='accepted'){
      dialogue('YOU','I take this job.','この依頼を受けます。',[['take','受ける・取る'],['job','仕事・依頼']]);
      clearActions(true);
      action('Back to Magic School','Magic Schoolへ戻る',showSchoolMenu,true);
    }
  }

  $('classroomBtn').onclick=openClassroom;
})();
