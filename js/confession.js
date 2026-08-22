(()=>{
  const data=window.LETTER_REQUESTERS;
  const wordData=window.WordData;
  const store=window.GameStore;
  if(!data||!wordData||!store)return;

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
  const learnedSet=new Set(
    wordData.getCurrentStudyWords(progress).map(word=>normalize(word.en))
  );

  const isUsableRequester=item=>
    item&&
    item.grade===progress.grade&&
    item.term===progress.term&&
    item.step<=progress.step&&
    item.lines.length===3&&
    item.lines.every(line=>line.words.every(word=>learnedSet.has(normalize(word))));

  // 教科書上のまとまり。学習順は固定し、来店する人物だけをランダムにする。
  const studyGroup=step=>{
    if(step<=6)return 'friends';
    if(step<=9)return 'unit1';
    if(step<=13)return 'unit2';
    if(step===14)return 'worldtour1';
    return 'unit3';
  };

  let candidates=data.requesters.filter(isUsableRequester);
  if(!candidates.length)return;

  // 同じ人が連続しにくいようにする。ただし候補が1人だけなら反復する。
  const lastId=store.state.lastLetterRequesterId||'';
  if(candidates.length>1){
    const withoutLast=candidates.filter(item=>item.id!==lastId);
    if(withoutLast.length)candidates=withoutLast;
  }

  const currentGroup=studyGroup(progress.step);
  const weighted=[];
  for(const item of candidates){
    // 現在学習中のUnit/範囲を多めに出し、過去範囲も復習として残す。
    const weight=studyGroup(item.step)===currentGroup?5:1;
    for(let i=0;i<weight;i++)weighted.push(item);
  }
  const requester=weighted[Math.floor(Math.random()*weighted.length)];

  // 次回来店時の連続出現を避けるため、今回の依頼人だけ記録する。
  store.state.lastLetterRequesterId=requester.id;
  store.save();

  intro.textContent=`本日訪れたのは『${requester.age}』『${requester.gender}』。\n『${requester.pronoun}』は貴女に、手紙を書いてほしいと頼みました。`;

  let round=0;
  let selected=[];
  const completed=[];

  const currentLine=()=>requester.lines[round];

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

    // 1文を作る単語だけを表示し、表示順だけ毎回混ぜる。
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
    letterText.textContent=requester.letter;
    letterPanel.classList.remove('hidden');
    letterPanel.setAttribute('aria-hidden','false');
  });

  buildRound();
})();