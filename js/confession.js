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
  const shuffle=list=>{
    const copy=[...list];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
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

  // 必ず英単語JSに存在する単語だけで1文を作る。
  if(!target.every(word=>dictionary.has(normalize(word)))){
    const usable=data.sentences.small.filter(sentence=>sentence.every(word=>dictionary.has(normalize(word))));
    target=pick(usable);
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

    // この回の正解となる1文の単語だけを、順番を混ぜて一度だけ落とす。
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
