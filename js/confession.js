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
  const pick=list=>list[Math.floor(Math.random()*list.length)];
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
  const currentGroup=studyGroup(progress.step);

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
    return pick(pool);
  };

  // 人物は年齢・性別だけ。学習内容とは独立して決める。
  const requester=chooseWithCooldown(requesterData.requesters,store.state.recentLetterRequesterIds,5);
  if(!requester)return;

  // Step1〜現在のStepまでに習った単語だけで作れる「1文」を全部候補にする。
  const usableLines=contentData.lines.filter(line=>
    line&&
    line.grade===progress.grade&&
    line.term===progress.term&&
    line.step<=progress.step&&
    Array.isArray(line.words)&&
    line.words.every(word=>learnedSet.has(normalize(word)))
  );

  const matchesSlot=(line,slotTags)=>slotTags.some(tag=>line.tags.includes(tag));

  // 同じ英文を重ねず、事情の3つの役割に合う文を1文ずつ選ぶ。
  const buildLinesForSituation=situation=>{
    const used=new Set();
    const result=[];
    for(const slot of situation.slots){
      const possible=usableLines.filter(line=>!used.has(line.id)&&matchesSlot(line,slot));
      if(!possible.length)return null;

      // 今習っている範囲の文は少し出やすくするが、以前の文も常に候補に残す。
      const weighted=[];
      for(const line of possible){
        const weight=studyGroup(line.step)===currentGroup?3:1;
        for(let i=0;i<weight;i++)weighted.push(line);
      }
      const chosen=pick(weighted);
      used.add(chosen.id);
      result.push(chosen);
    }
    return result;
  };

  // 現在の学習範囲で成立する事情だけを候補にする。
  const usableSituations=[];
  for(const situation of contentData.situations){
    if(situation.minStep>progress.step)continue;
    const sample=buildLinesForSituation(situation);
    if(sample)usableSituations.push(situation);
  }
  if(!usableSituations.length)return;

  // 新しく習った表現を使える事情は少し出やすい。それ以外も復習として出る。
  const weightedSituations=[];
  for(const situation of usableSituations){
    const hasCurrent=usableLines.some(line=>
      studyGroup(line.step)===currentGroup&&situation.slots.some(slot=>matchesSlot(line,slot))
    );
    const weight=hasCurrent?3:1;
    for(let i=0;i<weight;i++)weightedSituations.push(situation);
  }

  const recentCombos=Array.isArray(store.state.recentLetterContentIds)?store.state.recentLetterContentIds:[];
  let situation=null;
  let conversationLines=null;
  let comboId='';

  // 同じ「事情＋3文」の組み合わせをすぐ繰り返さない。
  for(let attempt=0;attempt<30;attempt++){
    const candidateSituation=pick(weightedSituations);
    const candidateLines=buildLinesForSituation(candidateSituation);
    if(!candidateLines)continue;
    const candidateId=`${candidateSituation.id}:${candidateLines.map(line=>line.id).join('|')}`;
    if(!recentCombos.includes(candidateId)||attempt===29){
      situation=candidateSituation;
      conversationLines=candidateLines;
      comboId=candidateId;
      break;
    }
  }
  if(!situation||!conversationLines)return;

  // 人物・内容の履歴を別々に保存する。
  if(typeof store.rememberLetterRequester==='function')store.rememberLetterRequester(requester.id,5);
  else{
    const recent=[...(store.state.recentLetterRequesterIds||[]).filter(id=>id!==requester.id),requester.id];
    store.state.recentLetterRequesterIds=recent.slice(-5);
  }
  store.state.recentLetterContentIds=[...recentCombos.filter(id=>id!==comboId),comboId].slice(-8);
  store.save();

  intro.textContent=`本日訪れたのは『${requester.age}』『${requester.gender}』。\n『${requester.pronoun}』は、${situation.label}と話しました。`;

  let round=0;
  let selected=[];
  const completed=[];
  const currentLine=()=>conversationLines[round];

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
    const opening=pick(situation.openings);
    const closing=pick(situation.closings);
    const body=conversationLines.map(line=>line.jp).join('');
    letterText.textContent=`${opening}${body}${closing}`;
    letterPanel.classList.remove('hidden');
    letterPanel.setAttribute('aria-hidden','false');
  });

  buildRound();
})();
