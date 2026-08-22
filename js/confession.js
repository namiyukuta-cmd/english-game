(()=>{
  const data=window.CONFESSION_DATA;
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
    if(!dictionary.has(key))dictionary.set(key,word.ja);
  });

  const jaWord=word=>{
    const key=normalize(word);
    const fixed={
      sweets:'甘いお菓子',sports:'スポーツ',soccer:'サッカー',basketball:'バスケットボール',
      hungry:'お腹が空いています',tired:'疲れています',sad:'悲しいです',red:'赤',black:'黒',picture:'絵',
      summer:'夏',blue:'青',wonderful:'素晴らしいです',fishing:'釣り',hiking:'ハイキング',vacation:'休み',
      food:'食べ物',fruit:'果物',baseball:'野球',milk:'牛乳',fish:'魚',jump:'ジャンプ',volleyball:'バレーボール',
      student:'学生',japan:'日本',friend:'友達',lost:'道に迷っています',math:'数学',winter:'冬',happy:'幸せ',
      swim:'泳ぐ',music:'音楽',flute:'フルート',school:'学校',anime:'アニメ',practice:'練習',magazine:'雑誌',
      class:'授業',radio:'ラジオ',pencil:'鉛筆',computer:'コンピュータ',home:'家',team:'チーム',australia:'オーストラリア'
    };
    if(fixed[key])return fixed[key];
    const raw=dictionary.get(key);
    return raw?String(raw).split(/[、［\[]/)[0]:word;
  };

  const toJapanese=words=>{
    const k=words.map(normalize);
    const same=(...parts)=>k.length===parts.length&&parts.every((part,i)=>k[i]===part);
    const tail=(start,end=words.length)=>words.slice(start,end).map(jaWord).join('');

    if(k[0]==="i'm"){
      if(k[1]==='a'&&words[2])return `私は${jaWord(words[2])}です。`;
      if(k[1]==='from'&&words[2])return `私は${jaWord(words[2])}出身です。`;
      if(k[1]==='interested'&&k[2]==='in')return `私は${jaWord(words[3])}に興味があります。`;
      if(k[1]==='not'&&k[2]==='interested'&&k[3]==='in')return `私は${jaWord(words[4])}に興味がありません。`;
      if(k[1]==='not'&&words[2])return `私は${jaWord(words[2]).replace(/です$/,'')}ではありません。`;
      if(k[1]==='lost')return '私は道に迷っています。';
      if(words[1])return `私は${jaWord(words[1])}。`;
    }

    if(k[0]==='i'&&k[1]==='like')return `私は${tail(2)}が好きです。`;
    if(k[0]==='i'&&k[1]==="don't"&&k[2]==='like')return `私は${tail(3)}が好きではありません。`;
    if(k[0]==='i'&&k[1]==='make')return `私は${tail(2)}を作ります。`;
    if(k[0]==='i'&&k[1]==='play')return `私は${tail(k[2]==='the'?3:2)}をします。`;
    if(same('i','understand','you'))return '私はあなたのことが分かります。';
    if(same('i','thank','you'))return '私はあなたに感謝しています。';
    if(same('i','went','fishing'))return '私は釣りに行きました。';
    if(same('i','went','hiking'))return '私はハイキングに行きました。';
    if(same('i','went','home'))return '私は家に帰りました。';
    if(k[0]==='i'&&k[1]==='went'&&k[2]==='to'&&k[3]==='the')return `私は${jaWord(words[4])}へ行きました。`;
    if(k[0]==='i'&&k[1]==='was'&&words[2])return `私は${jaWord(words[2]).replace(/です$/,'')}でした。`;
    if(k[0]==='i'&&k[1]==='want')return `私は${tail(2)}がほしいです。`;
    if(k[0]==='i'&&k[1]==='enjoy')return `私は${tail(2)}を楽しみます。`;
    if(k[0]==='i'&&k[1]==='can')return `私は${tail(2)}ことができます。`;
    if(k[0]==='i'&&k[1]==="can't"&&k[2]==='swim')return '私は泳げません。';
    if(k[0]==='i'&&k[1]==="can't"&&k[2]==='play')return `私は${jaWord(words[words.length-1])}を演奏できません。`;
    if(k[0]==='i'&&k[1]==='never'&&k[2]==='practice')return '私はまったく練習しません。';
    if(k[0]==='i'&&k[1]==='read'&&k.includes('during')&&k.includes('class'))return '私は授業中に雑誌を読みます。';
    if(k[0]==='i'&&k[1]==='listen'&&k[2]==='to'&&k.includes('during')&&k.includes('class'))return '私は授業中にラジオを聞きます。';
    if(k[0]==='i'&&k[1]==='say'&&words[2])return `私は「${words[2]}」と言います。`;
    if(same('i','try','again'))return '私はもう一度やってみます。';
    if(k[0]==='i'&&k[1]==='write'&&k[2]==='with')return `私は${jaWord(words[4]||words[3])}で書きます。`;
    if(k[0]==='i'&&k[1]==='use'&&words[2])return `私は${jaWord(words[2])}を使います。`;
    if(k[0]==='i'&&k[1]==='get'&&k[2]==='up'&&k[3]==='late')return '私は遅く起きます。';
    if(k[0]==='i'&&k[1]==="don't"&&k[2]==='go'&&k[3]==='to')return `私は${jaWord(words[words.length-1])}へ行きません。`;

    return `「${words.join(' ')}」という内容です。`;
  };

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

  const newestStep=Math.max(...candidates.map(item=>item.step));
  candidates=candidates.filter(item=>item.step===newestStep);
  const letterCase=pick(candidates);

  intro.textContent=`本日訪れたのは『${letterCase.age}』『${letterCase.gender}』。\n『${letterCase.pronoun}』は貴女に、手紙を書いてほしいと頼みました。`;

  let round=0;
  let selected=[];
  const completed=[];

  const currentTarget=()=>letterCase.confessions[round];

  const renderAnswer=()=>{
    answer.textContent=selected.length?selected.join(' '):'';
  };

  const renderCompleted=()=>{
    completedSentences.innerHTML=completed.map(line=>`<div class="completed-line">✓ ${line}</div>`).join('');
  };

  const renderProgress=()=>{
    progressText.textContent=`会話 ${Math.min(round+1,3)} / ${letterCase.confessions.length}`;
  };

  const renderSpeaker=()=>{
    speakerLine.textContent=`「${toJapanese(currentTarget())}」`;
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
    const target=currentTarget();
    wordBank.innerHTML='';
    selected=[];
    renderAnswer();
    renderProgress();
    renderSpeaker();
    renderCompleted();
    feedback.textContent='';
    feedback.className='confession-feedback';

    shuffle(target).forEach(word=>wordBank.appendChild(makeToken(word)));
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
    const target=currentTarget();
    const correct=selected.length===target.length&&selected.every((word,index)=>normalize(word)===normalize(target[index]));

    if(!correct){
      feedback.textContent='語順が違います。';
      feedback.className='confession-feedback bad';
      return;
    }

    completed.push(`${target.join(' ')}.`);
    renderCompleted();

    if(round<letterCase.confessions.length-1){
      feedback.textContent='聞き取れました。';
      feedback.className='confession-feedback good';
      round+=1;
      setTimeout(buildRound,450);
    }else{
      finishConversation();
    }
  });

  reset.addEventListener('click',buildRound);
  buildRound();
})();
