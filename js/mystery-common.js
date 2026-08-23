(()=>{
  const touchCss=document.createElement('link');
  touchCss.rel='stylesheet';
  touchCss.href='css/mystery-touch.css?v=20260823-2224';
  document.head.appendChild(touchCss);

  const SAVE_KEY='mystery_cleaner_save_v1';
  const STAGE_URLS={room:'mystery-room.html',discovery:'mystery-discovery.html',questioning:'mystery-questioning.html',deduction:'mystery-deduction.html',hint:'mystery-scene.html?phase=hint',later:'mystery-later.html',complete:'mystery-start.html'};

  function listCases(){return (window.MYSTERY_CASES||[]).slice().sort((a,b)=>(a.unit||0)-(b.unit||0));}
  function firstCase(){return listCases()[0]||null;}
  function loadState(){
    try{return JSON.parse(localStorage.getItem(SAVE_KEY))||null;}catch(e){return null;}
  }
  function saveState(next){localStorage.setItem(SAVE_KEY,JSON.stringify(next));return next;}
  function startNew(){
    const c=firstCase();
    if(!c)return null;
    return saveState({caseId:c.id,stage:'room',completed:false,completedAll:false});
  }
  function currentCase(){
    const state=loadState();
    const list=listCases();
    return list.find(c=>c.id===(state&&state.caseId))||firstCase();
  }
  function nextCase(caseId){
    const list=listCases();
    const i=list.findIndex(c=>c.id===caseId);
    return i>=0&&i<list.length-1?list[i+1]:null;
  }
  function setStage(stage,extra){
    const c=currentCase();
    const prev=loadState()||{caseId:c?c.id:null};
    return saveState(Object.assign({},prev,{caseId:c?c.id:prev.caseId,stage},extra||{}));
  }
  function finishCurrentCase(){
    const c=currentCase();
    if(!c)return null;
    const n=nextCase(c.id);
    if(n){
      return saveState({caseId:n.id,stage:'room',completed:false,completedAll:false,lastCompletedCaseId:c.id,lastCompletedUnit:c.unit});
    }
    return saveState({caseId:c.id,stage:'complete',completed:true,completedAll:true,lastCompletedCaseId:c.id,lastCompletedUnit:c.unit});
  }
  function stageUrl(stage){return STAGE_URLS[stage]||STAGE_URLS.room;}
  function continueUrl(){const s=loadState();return stageUrl(s&&s.stage?s.stage:'room');}
  function sentenceCard(item,speaker){
    const grammar=item.grammar?`<button class="grammar-toggle" type="button">文法を見る</button><div class="grammar-card"><div class="grammar-title">${escapeHtml(item.grammar)}</div><div class="grammar-text">${escapeHtml(item.explain||'')}</div></div>`:'';
    return `<section class="dialogue-card">${speaker?`<div class="speaker">${escapeHtml(speaker)}</div>`:''}<div class="en">${escapeHtml(item.en||'')}</div><div class="ja">${escapeHtml(item.ja||'')}</div>${grammar}</section>`;
  }
  function storyCard(en,ja){return `<section class="story-card"><div class="en">${escapeHtml(en||'')}</div><div class="ja">${escapeHtml(ja||'')}</div></section>`;}
  function bindGrammar(root=document){
    root.querySelectorAll('.grammar-toggle').forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.nextElementSibling;if(!card)return;
      card.classList.toggle('open');
      btn.textContent=card.classList.contains('open')?'文法を閉じる':'文法を見る';
    }));
  }
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}

  window.MysteryGame={SAVE_KEY,loadState,saveState,startNew,currentCase,nextCase,setStage,finishCurrentCase,stageUrl,continueUrl,sentenceCard,storyCard,bindGrammar,escapeHtml,listCases};
})();