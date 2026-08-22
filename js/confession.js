(()=>{
  const data=window.CONFESSION_DATA;
  const wordData=window.WordData;
  if(!data||!wordData)return;

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
  const normalize=value=>String(value).trim().toLowerCase();
  const dictionary=new Map();
  wordData.all.forEach(word=>{
    const key=normalize(word.en);
    if(!dictionary.has(key))dictionary.set(key,word);
  });

  const age=weightedPick(data.ages);
  const gender=weightedPick(data.genders);
  const severity=weightedPick(age.adult?data.sinWeights.adult:data.sinWeights.minor);
  const sentencePool=data.sentences[severity.id]||data.sentences.small;
  let target=pick(sentencePool);

  // 念のため、英単語JSに存在する単語だけを使う。
  if(!target.every(word=>dictionary.has(normalize(word)))){
    target=pick(data.sentences.small.filter(sentence=>sentence.every(word=>dictionary.has(normalize(word)))));
  }

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
    const lane=(index+Math.random()*.7)/Math.max(total,1);
    button.style.setProperty('--x',`${Math.min(91,Math.max(2,lane*94))}%`);
    button.style.setProperty('--delay',`${-(Math.random()*8).toFixed(2)}s`);
    button.style.setProperty('--duration',`${(7+Math.random()*6).toFixed(2)}s`);
    button.addEventListener('click',()=>{
      selected.push(word);
      button.classList.add('caught');
      renderAnswer();
      feedback.textContent='';
    });
    return button;
  };

  const buildRain=()=>{
    rain.innerHTML='';
    selected.length=0;
    renderAnswer();
    feedback.textContent='';

    const targetWords=[...target];
    const targetKeys=new Set(targetWords.map(normalize));
    const distractorPool=wordData.all
      .map(word=>word.en)
      .filter(en=>!targetKeys.has(normalize(en))&&!String(en).includes(' ')&&!/[.!?]/.test(en));

    const distractors=[];
    while(distractors.length<Math.min(7,distractorPool.length)){
      const candidate=pick(distractorPool);
      if(!distractors.includes(candidate))distractors.push(candidate);
    }

    const words=[...targetWords,...distractors].sort(()=>Math.random()-.5);
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
