(()=>{
  const data=window.CONFESSION_DATA;
  const wordData=window.WordData;
  const store=window.GameStore;
  if(!data||!wordData||!store)return;

  const intro=document.getElementById('confessionText');
  const progressText=document.getElementById('confessionProgress');
  const rain=document.getElementById('wordRain');
  const answer=document.getElementById('confessionAnswer');
  const submit=document.getElementById('submitConfession');
  const reset=document.getElementById('resetConfession');
  const feedback=document.getElementById('confessionFeedback');
  const storyPanel=document.getElementById('confessionStoryPanel');
  const storyText=document.getElementById('confessionStoryText');

  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const shuffle=list=>{
    const copy=[...list];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
  const normalize=value=>String(value).trim().toLowerCase();

  const progress=store.state.studyProgress||{grade:1,term:1,step:1};
  const learnedSet=new Set(
    wordData.getCurrentStudyWords(progress).map(word=>normalize(word.en))
  );

  const isUsableCase=item=>
    item.grade===progress.grade&&
    item.term===progress.term&&
    item.step<=progress.step&&
    item.confessions.every(sentence=>sentence.every(word=>learnedSet.has(normalize(word))));

  let candidates=data.cases.filter(isUsableCase);
  if(!candidates.length)return;

  // 教科書の現在位置に一番近い、事前作成済みの人物セットから選ぶ。
  const newestStep=Math.max(...candidates.map(item=>item.step));
  candidates=candidates.filter(item=>item.step===newestStep);
  const confessionCase=pick(candidates);

  intro.textContent=`本日訪れたのは『${confessionCase.age}』『${confessionCase.gender}』。\n『${confessionCase.pronoun}』は貴女を見ると、頭を垂れ、ポツポツと語り始めました。`;

  let round=0;
  let selected=[];

  const currentTarget=()=>confessionCase.confessions[round];

  const renderAnswer=()=>{
    answer.textContent=selected.length?selected.join(' '):'';
  };

  const renderProgress=()=>{
    progressText.textContent=`懺悔 ${round+1} / ${confessionCase.confessions.length}`;
  };

  const makeToken=(word,index,total)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='falling-word';
    button.textContent=word;

    const columns=Math.min(3,total);
    const rows=Math.ceil(total/columns);
    const col=index%columns;
    const row=Math.floor(index/columns);
    const x=((col+.5)/columns)*100;
    const y=12+((row+.5)/rows)*70;

    button.style.setProperty('--x',`${x}%`);
    button.style.setProperty('--y',`${y}%`);
    button.style.setProperty('--delay',`${(index*.16).toFixed(2)}s`);
    button.style.setProperty('--duration',`${(1.5+Math.random()*.55).toFixed(2)}s`);

    button.addEventListener('click',()=>{
      if(button.classList.contains('caught'))return;
      selected.push(word);
      button.classList.add('caught');
      renderAnswer();
      feedback.textContent='';
      feedback.className='confession-feedback';
    });
    return button;
  };

  const buildRound=()=>{
    const target=currentTarget();
    rain.innerHTML='';
    selected=[];
    renderAnswer();
    renderProgress();
    feedback.textContent='';
    feedback.className='confession-feedback';

    // 正解となる1文の単語だけを、順番を崩して一度だけ落とす。
    const words=shuffle(target);
    words.forEach((word,index)=>rain.appendChild(makeToken(word,index,words.length)));
  };

  const revealStory=()=>{
    storyText.textContent=confessionCase.story;
    storyPanel.classList.remove('hidden');
    storyPanel.setAttribute('aria-hidden','false');
  };

  submit.addEventListener('click',()=>{
    const target=currentTarget();
    const correct=selected.length===target.length&&selected.every((word,index)=>normalize(word)===normalize(target[index]));

    if(!correct){
      feedback.textContent='言葉の順番が違うようです。';
      feedback.className='confession-feedback bad';
      return;
    }

    feedback.textContent='聞き取った言葉を神に渡しました。';
    feedback.className='confession-feedback good';

    if(round<confessionCase.confessions.length-1){
      round+=1;
      setTimeout(buildRound,650);
    }else{
      setTimeout(revealStory,650);
    }
  });

  reset.addEventListener('click',buildRound);
  buildRound();
})();
