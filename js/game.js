window.EnglishGame = (()=>{
  let mode=null,round=0,rounds=[],firstPick=null,picked=[];
  const $=id=>document.getElementById(id);
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  const norm=s=>String(s).toLowerCase();

  function start(nextMode){mode=nextMode;round=0;firstPick=null;picked=[];rounds=mode==='word'?makeWordRounds():makeSentenceRounds();renderRound()}

  function makeWordRounds(){
    const studyPool=WordData.getCurrentStudyWords(GameStore.state.studyProgress);
    const pool=studyPool.filter(w=>GameStore.state.unlockedWordIds.includes(w.id));
    return [0,1,2].map(()=>shuffle(pool).slice(0,6));
  }

  function makeSentenceRounds(){
    const available=SENTENCES.filter(s=>s.level<=2);
    const chosen=shuffle(available).slice(0,Math.min(5,available.length));
    return chosen.map((s,i)=>({target:s,distractors:makeDistractors(s,i<2?1:3)}));
  }

  function makeDistractors(sentence,count){
    const answerLower=sentence.answer.map(norm);
    return shuffle(WORDS.map(w=>w.en).filter(w=>!answerLower.includes(norm(w)))).slice(0,count);
  }

  function renderRound(){
    $('roundNow').textContent=round+1;$('roundTotal').textContent=rounds.length;
    $('feedback').textContent='';$('feedback').className='feedback';
    $('resetSelection').classList.add('hidden');$('selectionArea').innerHTML='';
    if(mode==='word')renderWordRound();else renderSentenceRound();
  }

  function renderWordRound(){
    $('gameLabel').textContent='WORD PUZZLE';$('gameTitle').textContent='単語パズル';
    $('promptCard').innerHTML='<div class="jp">英語と日本語のペアを消そう</div><div class="hint">英語6＋日本語6。全部消せたらクリア</div>';
    $('selectionArea').classList.add('hidden');
    const words=rounds[round];
    const tiles=shuffle(words.flatMap(w=>[
      {key:w.id,type:'en',main:w.en,sub:'English'},
      {key:w.id,type:'ja',main:w.ja,sub:'日本語'}
    ]));
    const board=$('board');board.innerHTML='';
    for(const t of tiles){const b=document.createElement('button');b.className='tile';b.dataset.key=t.key;b.dataset.type=t.type;b.innerHTML=`<span class="en">${t.main}</span><span class="ja">${t.sub}</span>`;b.addEventListener('click',()=>pickWord(b,t));board.appendChild(b)}
  }

  function pickWord(el,t){
    if(el.classList.contains('matched'))return;
    if(!firstPick){firstPick={el,t};el.classList.add('selected');return}
    if(firstPick.el===el){el.classList.remove('selected');firstPick=null;return}
    const ok=firstPick.t.key===t.key&&firstPick.t.type!==t.type;
    if(ok){firstPick.el.classList.remove('selected');firstPick.el.classList.add('matched');el.classList.add('matched');firstPick=null;$('feedback').textContent='ぴったり！';$('feedback').className='feedback good';if([...$('board').children].every(x=>x.classList.contains('matched')))winRound(12)}
    else{firstPick.el.classList.remove('selected');firstPick=null;$('feedback').textContent='ちがう組み合わせです';$('feedback').className='feedback bad'}
  }

  function renderSentenceRound(){
    const r=rounds[round],s=r.target;
    $('selectionArea').classList.remove('hidden');
    $('gameLabel').textContent='SENTENCE PUZZLE';$('gameTitle').textContent='英文パズル';
    $('promptCard').innerHTML=`<div class="jp">「${s.jp}」</div><div class="hint">正しい英文になるように単語を選ぼう</div>`;
    const tokens=shuffle([...s.answer,...r.distractors]);
    const board=$('board');board.innerHTML='';picked=[];updatePicked();
    tokens.forEach((word,index)=>{const b=document.createElement('button');b.className='tile';b.dataset.index=index;b.innerHTML=`<span class="en">${word}</span><span class="ja">${lookupJa(word)}</span>`;b.addEventListener('click',()=>pickSentence(b,word,index));board.appendChild(b)});
    $('resetSelection').classList.remove('hidden');
  }

  function lookupJa(word){
    const target=norm(word)==='cats'?'cat':norm(word);
    const found=WORDS.find(w=>norm(w.en)===target);
    return found?found.ja:'—';
  }
  function pickSentence(el,word,index){if(picked.some(p=>p.index===index))return;picked.push({word,index,el});el.classList.add('matched');updatePicked();const target=rounds[round].target;if(picked.length===target.answer.length)checkSentence()}
  function updatePicked(){$('selectionArea').innerHTML=picked.length?picked.map(p=>`<span class="picked">${p.word}</span>`).join(''):'<span class="hint">ここに英文ができます</span>'}
  function resetSentence(){for(const p of picked)p.el.classList.remove('matched');picked=[];updatePicked();$('feedback').textContent='';}
  function checkSentence(){const s=rounds[round].target;const answer=picked.map(p=>p.word);const ok=answer.every((w,i)=>norm(w)===norm(s.answer[i]));if(ok){GameStore.seeSentence(s.id);$('feedback').textContent=`正解！ ${s.answer.join(' ')}.`;$('feedback').className='feedback good';const first=GameStore.seeGrammar(s.grammar);if(first)setTimeout(()=>showGrammar(s.grammar),350);setTimeout(()=>winRound(20),first?1200:650)}else{$('feedback').textContent='語順がちがいます。選びなおしてみよう';$('feedback').className='feedback bad';setTimeout(resetSentence,700)}}

  function showGrammar(id){const g=GRAMMAR[id];if(!g)return;$('grammarTitle').textContent=g.title;$('grammarText').textContent=g.text;$('grammarExample').innerHTML=g.example.split('\n').map(x=>`<div>${x}</div>`).join('');$('grammarModal').classList.add('open');$('grammarModal').setAttribute('aria-hidden','false')}
  function closeGrammar(){$('grammarModal').classList.remove('open');$('grammarModal').setAttribute('aria-hidden','true')}

  function winRound(coins){GameStore.addCoins(coins);window.AppUI.refreshHeader();setTimeout(()=>{round++;if(round>=rounds.length){$('promptCard').innerHTML='<div class="jp">クリア！</div><div class="hint">お金を手に入れました</div>';$('board').innerHTML='';$('selectionArea').innerHTML='';$('resetSelection').classList.add('hidden');$('feedback').textContent=`🪙 +${coins}　ホームへ戻れます`;return}renderRound()},500)}

  return {start,resetSentence,showGrammar,closeGrammar};
})();