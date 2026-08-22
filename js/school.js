(()=>{
  const scene=window.SCENE_SCHOOL;
  const store=window.GameStore;
  if(!scene||!store)return;

  const $=id=>document.getElementById(id);
  const progress=store.state.studyProgress||{grade:1,term:1,step:1};
  const shuffle=list=>{
    const copy=[...list];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
  const norm=value=>String(value).trim().toLowerCase().replace(/[.!?]$/,'');

  const available=scene.conversations.filter(item=>
    item.grade===progress.grade&&
    item.term===progress.term&&
    item.requiredStep<=progress.step
  );
  if(!available.length)return;

  // 現在の学習位置で使える中から、一番新しい学校会話を使う。
  const newestStep=Math.max(...available.map(item=>item.requiredStep));
  const conversation=available.find(item=>item.requiredStep===newestStep)||available[0];

  const place=scene.places.find(item=>item.id===conversation.place);
  $('sceneTitle').textContent=conversation.title;
  $('scenePlace').textContent=place?place.name:'';

  let turnIndex=0;
  let selected=[];

  const currentTurn=()=>conversation.turns[turnIndex];

  const renderSelected=()=>{
    const area=$('selectedWords');
    if(!selected.length){
      area.innerHTML='<span class="empty-selection">ここに返事ができます</span>';
      return;
    }
    area.innerHTML=selected.map(item=>`<span class="selected-token">${item.word}</span>`).join('');
  };

  const renderHistory=()=>{
    const history=$('conversationHistory');
    history.scrollTop=history.scrollHeight;
  };

  const appendHistory=(en,ja,isPlayer=false,name='')=>{
    const div=document.createElement('div');
    div.className=`history-line${isPlayer?' player':''}`;
    div.innerHTML=`${name?`<strong>${name}</strong>`:''}<span class="en">${en}</span>${ja?`<span class="ja">（${ja}）</span>`:''}`;
    $('conversationHistory').appendChild(div);
    renderHistory();
  };

  const makeToken=(word,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='word-token';
    button.textContent=word;
    button.addEventListener('click',()=>{
      if(button.classList.contains('picked'))return;
      button.classList.add('picked');
      selected.push({word,index,button});
      renderSelected();
      $('schoolFeedback').textContent='';
      $('schoolFeedback').className='school-feedback';
    });
    return button;
  };

  const renderTurn=()=>{
    const turn=currentTurn();
    selected=[];
    $('schoolProgress').textContent=`${turnIndex+1} / ${conversation.turns.length}`;
    $('npcName').textContent=turn.speakerName||turn.speaker;
    $('npcEnglish').textContent=turn.en;
    $('npcJapanese').textContent=`（${turn.ja}）`;
    $('responsePrompt').textContent=turn.response.jp;
    $('schoolFeedback').textContent='';
    $('schoolFeedback').className='school-feedback';
    $('wordBank').innerHTML='';
    renderSelected();

    shuffle(turn.response.words).forEach((word,index)=>{
      $('wordBank').appendChild(makeToken(word,index));
    });
  };

  const resetSelection=()=>{
    selected=[];
    [...$('wordBank').children].forEach(button=>button.classList.remove('picked'));
    renderSelected();
    $('schoolFeedback').textContent='';
    $('schoolFeedback').className='school-feedback';
  };

  const finish=()=>{
    $('npcName').textContent='';
    $('npcEnglish').textContent='School life continues.';
    $('npcJapanese').textContent='（学校生活は続きます。）';
    $('responsePrompt').textContent='今日の会話はここまでです。';
    $('selectedWords').classList.add('hidden');
    $('wordBank').classList.add('hidden');
    $('resetWords').classList.add('hidden');
    $('sayResponse').classList.add('hidden');
    $('schoolFeedback').textContent='';
    $('schoolFinish').classList.remove('hidden');
  };

  $('resetWords').addEventListener('click',resetSelection);

  $('sayResponse').addEventListener('click',()=>{
    const turn=currentTurn();
    const answer=turn.response.answer;
    const spoken=selected.map(item=>item.word);
    const correct=spoken.length===answer.length&&spoken.every((word,index)=>norm(word)===norm(answer[index]));

    if(!correct){
      $('schoolFeedback').textContent='語順が違います。';
      $('schoolFeedback').className='school-feedback bad';
      return;
    }

    appendHistory(turn.en,turn.ja,false,turn.speakerName||turn.speaker);
    appendHistory(turn.response.sentence,turn.response.jp,true,'You');
    $('schoolFeedback').textContent='伝わりました。';
    $('schoolFeedback').className='school-feedback good';

    if(turnIndex<conversation.turns.length-1){
      turnIndex+=1;
      setTimeout(renderTurn,450);
    }else{
      setTimeout(finish,450);
    }
  });

  renderTurn();
})();
