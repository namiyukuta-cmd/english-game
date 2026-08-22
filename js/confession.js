(()=>{
  const data=window.CONFESSION_DATA;
  const wordData=window.WordData;
  const store=window.GameStore;
  if(!data||!wordData||!store)return;

  const intro=document.getElementById('confessionText');
  const rain=document.getElementById('wordRain');
  const answer=document.getElementById('confessionAnswer');
  const submit=document.getElementById('submitConfession');
  const reset=document.getElementById('resetConfession');
  const feedback=document.getElementById('confessionFeedback');

  const weightedPick=list=>{
    const total=list.reduce((sum,item)=>sum+(item.weight||1),0);
    let roll=Math.random()*total;
    for(const item of list){
      roll-=item.weight||1;
      if(roll<0)return item;
    }
    return list[list.length-1];
  };

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
  const learnedWords=wordData.getCurrentStudyWords(progress);
  const learnedSet=new Set(learnedWords.map(word=>normalize(word.en)));

  const age=weightedPick(data.ages);
  const gender=weightedPick(data.genders);
  const severity=weightedPick(age.adult?data.sinWeights.adult:data.sinWeights.minor);

  const isUsable=lesson=>
    lesson.grade===progress.grade&&
    lesson.term===progress.term&&
    lesson.step<=progress.step&&
    lesson.words.every(word=>learnedSet.has(normalize(word)));

  let candidates=data.lessons.filter(lesson=>isUsable(lesson)&&lesson.severity===severity.id);
  if(!candidates.length)candidates=data.lessons.filter(lesson=>isUsable(lesson)&&lesson.severity==='small');
  if(!candidates.length)candidates=data.lessons.filter(isUsable);
  if(!candidates.length)return;

  // 現在の教科書Stepに最も近い英文を優先する。
  const newestStep=Math.max(...candidates.map(lesson=>lesson.step));
  candidates=candidates.filter(lesson=>lesson.step===newestStep);
  const lesson=pick(candidates);
  const target=[...lesson.words];

  intro.textContent=`本日訪れたのは『${age.label}』『${gender.label}』。\n『${gender.pronoun}』は貴女を見ると、頭を垂れ、ポツポツと語り始めました。`;

  const selected=[];
  const renderAnswer=()=>{
    answer.textContent=selected.length?selected.join(' '):'';
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
    button.style.setProperty('--delay',`${(index*.18).toFixed(2)}s`);
    button.style.setProperty('--duration',`${(1.7+Math.random()*.7).toFixed(2)}s`);

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

  const buildRain=()=>{
    rain.innerHTML='';
    selected.length=0;
    renderAnswer();
    feedback.textContent='';
    feedback.className='confession-feedback';

    // 現在の教科書進度で作れる正解1文の単語だけを、一度だけ落とす。
    const words=shuffle(target);
    words.forEach((word,index)=>rain.appendChild(makeToken(word,index,words.length)));
  };

  submit.addEventListener('click',()=>{
    const correct=selected.length===target.length&&selected.every((word,index)=>normalize(word)===normalize(target[index]));
    if(correct){
      feedback.textContent='聞き取った言葉を神に渡しました。';
      feedback.className='confession-feedback good';
    }else{
      feedback.textContent='言葉の順番が違うようです。';
      feedback.className='confession-feedback bad';
    }
  });

  reset.addEventListener('click',buildRain);
  buildRain();
})();
