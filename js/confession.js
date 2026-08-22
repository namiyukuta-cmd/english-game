(()=>{
  const requesterData=window.LETTER_REQUESTERS;
  const contentData=window.LETTER_CONTENT;
  const wordData=window.WordData;
  const store=window.GameStore;
  if(!requesterData||!contentData||!wordData||!store)return;

  const intro=document.getElementById('confessionText');
  const speakerLine=document.getElementById('speakerLine');
  const progressText=document.getElementById('confessionProgress');
  const wordBank=document.getElementById('wordRain');
  const answer=document.getElementById('confessionAnswer');
  const completedSentences=document.getElementById('completedSentences');
  const submit=document.getElementById('submitConfession');
  const reset=document.getElementById('resetConfession');
  const feedback=document.getElementById('confessionFeedback');
  const writeLetterButton=document.getElementById('writeLetterButton');
  const letterPanel=document.getElementById('letterPanel');
  const letterText=document.getElementById('letterText');

  const shuffle=list=>{
    const copy=[...list];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
  const normalize=value=>String(value).trim().toLowerCase().replace(/[.!?]$/,'');

  const progress=store.state.studyProgress||{grade:1,term:1,step:1};
  const learnedSet=new Set(wordData.getCurrentStudyWords(progress).map(word=>normalize(word.en)));

  const studyGroup=step=>{
    if(step<=6)return 'friends';
    if(step<=9)return 'unit1';
    if(step<=13)return 'unit2';
    if(step===14)return 'worldtour1';
    return 'unit3';
  };

  const chooseWithCooldown=(items,recentIds,limit)=>{
    if(!items.length)return null;
    const recent=Array.isArray(recentIds)?recentIds:[];
    const cooldown=Math.min(limit,Math.max(0,items.length-1));
    const blocked=new Set(recent.slice(-cooldown));
    let pool=items.filter(item=>!blocked.has(item.id));
    if(!pool.length){
      const last=recent[recent.length-1]||'';
      pool=items.filter(item=>item.id!==last);
      if(!pool.length)pool=[...items];
    }
    return pool[Math.floor(Math.random()*pool.length)];
  };

  // 依頼人は年齢・性別だけのプロフィール。英単語・英文・手紙内容とは無関係に抽選する。
  const requester=chooseWithCooldown(
    requesterData.requesters,
    store.state.recentLetterRequesterIds,
    5
  );
  if(!requester)return;

  // 学習済み単語だけで作れる内容を候補にする。
  const usableCases=contentData.cases.filter(item=>
    item&&
    item.grade===progress.grade&&
    item.term===progress.term&&
    item.step<=progress.step&&
    Array.isArray(item.lines)&&item.lines.length===3&&
    item.lines.every(line=>line.words.every(word=>learnedSet.has(normalize(word))))
  );
  if(!usableCases.length)return;

  // 現在の学習範囲を多めにしつつ、以前の内容も復習として残す。
  const currentGroup=studyGroup(progress.step);
  const recentContent=Array.isArray(store.state.recentLetterContentIds)?store.state.recentLetterContentIds:[];
  const contentCooldown=Math.min(5,Math.max(0,usableCases.length-1));
  const blockedContent=new Set(recentContent.slice(-contentCooldown));
  let contentCandidates=usableCases.filter(item=>!blockedContent.has(item.id));
  if(!contentCandidates.length){
    const last=recentContent[recentContent.length-1]||'';
    contentCandidates=usableCases.filter(item=>item.id!==last);
    if(!contentCandidates.length)contentCandidates=[...usableCases];
  }

  const weightedContent=[];
  for(const item of contentCandidates){
    const weight=studyGroup(item.step)===currentGroup?5:1;
    for(let i=0;i<weight;i++)weightedContent.push(item);
  }
  const contentCase=weightedContent[Math.floor(Math.random()*weightedContent.length)];

  // 人物履歴と内容履歴は別々に保存する。
  if(typeof store.rememberLetterRequester==='function')store.rememberLetterRequester(requester.id,5);
  else{
    const recent=[...(store.state.recentLetterRequesterIds||[]).filter(id=>id!==requester.id),requester.id];
    store.state.recentLetterRequesterIds=recent.slice(-5);
  }
  const contentRecent=[...(store.state.recentLetterContentIds||[]).filter(id=>id!==contentCase.id),contentCase.id];
  store.state.recentLetterContentIds=contentRecent.slice(-5);
  store.save();

  intro.textContent=`本日訪れたのは『${requester.age}』『${requester.gender}』。\n『${requester.pronoun}』は貴女に、手紙を書いてほしいと頼みました。`;

  let round=0;
  let selected=[];
  const completed=[];
  const currentLine=()=>contentCase.lines[round];

  const renderAnswer=()=>{
    answer.textContent=selected.length?selected.join(' '):'';
  };

  const renderCompleted=()=>{
    completedSentences.innerHTML=completed.map(line=>`<div class="completed-line">✓ ${line}</div>`).join('');
  };

  const renderProgress=()=>{
    progressText.textContent=`会話 ${Math.min(round+1,3)} / 3`;
  };

  const renderSpeaker=()=>{
    speakerLine.textContent=`「${currentLine().jp}」`;
  };

  const makeToken=word=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='word-token';
    button.textContent=word;
    button.addEventListener('click',()=>{
      if(button.classList.contains('picked'))return;
      selected.push(word);
      button.classList.add('picked');
      renderAnswer();
      feedback.textContent='';
      feedback.className='confession-feedback';
    });
    return button;
  };

  const buildRound=()=>{
    const line=currentLine();
    wordBank.innerHTML='';
    selected=[];
    renderAnswer();
    renderProgress();
    renderSpeaker();
    renderCompleted();
    feedback.textContent='';
    feedback.className='confession-feedback';
    shuffle(line.words).forEach(word=>wordBank.appendChild(makeToken(word)));
  };

  const finishConversation=()=>{
    progressText.textContent='会話 3 / 3';
    speakerLine.textContent='3つの話を聞き取りました。';
    wordBank.innerHTML='';
    answer.textContent='';
    feedback.textContent='手紙を書く準備ができました。';
    feedback.className='confession-feedback good';
    reset.classList.add('hidden');
    submit.classList.add('hidden');
    writeLetterButton.classList.remove('hidden');
  };

  submit.addEventListener('click',()=>{
    const line=currentLine();
    const correct=selected.length===line.words.length&&selected.every((word,index)=>normalize(word)===normalize(line.words[index]));
    if(!correct){
      feedback.textContent='語順が違います。';
      feedback.className='confession-feedback bad';
      return;
    }

    completed.push(line.sentence);
    renderCompleted();

    if(round<2){
      feedback.textContent='聞き取れました。';
      feedback.className='confession-feedback good';
      round+=1;
      setTimeout(buildRound,450);
    }else{
      finishConversation();
    }
  });

  reset.addEventListener('click',buildRound);

  writeLetterButton.addEventListener('click',()=>{
    letterText.textContent=contentCase.letter;
    letterPanel.classList.remove('hidden');
    letterPanel.setAttribute('aria-hidden','false');
  });

  buildRound();
})();
