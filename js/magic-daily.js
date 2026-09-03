(()=>{
  'use strict';

  const Store=window.MagicGameState;
  let state=Store.load();
  let overlay=null;

  const months=[
    {full:'January',short:'Jan.',ja:'1月'},
    {full:'February',short:'Feb.',ja:'2月'},
    {full:'March',short:'Mar.',ja:'3月'},
    {full:'April',short:'Apr.',ja:'4月'},
    {full:'May',short:'May',ja:'5月'},
    {full:'June',short:'Jun.',ja:'6月'},
    {full:'July',short:'Jul.',ja:'7月'},
    {full:'August',short:'Aug.',ja:'8月'},
    {full:'September',short:'Sep.',ja:'9月'},
    {full:'October',short:'Oct.',ja:'10月'},
    {full:'November',short:'Nov.',ja:'11月'},
    {full:'December',short:'Dec.',ja:'12月'}
  ];

  const weekdays=[
    {full:'Sunday',short:'Sun.',ja:'日曜日'},
    {full:'Monday',short:'Mon.',ja:'月曜日'},
    {full:'Tuesday',short:'Tue.',ja:'火曜日'},
    {full:'Wednesday',short:'Wed.',ja:'水曜日'},
    {full:'Thursday',short:'Thu.',ja:'木曜日'},
    {full:'Friday',short:'Fri.',ja:'金曜日'},
    {full:'Saturday',short:'Sat.',ja:'土曜日'}
  ];

  const weekWords=['first','second','third','fourth','fifth'];
  const weekShort=['1st wk.','2nd wk.','3rd wk.','4th wk.','5th wk.'];

  const fruits=[
    ['apple','リンゴ'],
    ['banana','バナナ'],
    ['orange','オレンジ'],
    ['strawberry','イチゴ'],
    ['lemon','レモン']
  ];

  const weather=[
    {word:'sunny',en:'It is sunny.',ja:'晴れです。'},
    {word:'rainy',en:'It is rainy.',ja:'雨です。'},
    {word:'windy',en:'It is windy.',ja:'風があります。'},
    {word:'cloudy',en:'It is cloudy.',ja:'曇りです。'},
    {word:'hot',en:'It is hot.',ja:'暑いです。'},
    {word:'cold',en:'It is cold.',ja:'寒いです。'},
    {word:'warm',en:'It is warm.',ja:'暖かいです。'},
    {word:'cool',en:'It is cool.',ja:'涼しいです。'},
    {word:'sky',en:'The sky is blue.',ja:'空は青いです。'}
  ];

  const $=id=>document.getElementById(id);
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const reEsc=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

  function ordinal(n){
    const v=n%100;
    if(v>=11&&v<=13)return n+'th';
    if(n%10===1)return n+'st';
    if(n%10===2)return n+'nd';
    if(n%10===3)return n+'rd';
    return n+'th';
  }

  function ordinalWord(n){
    const words=['','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth','twenty-first','twenty-second','twenty-third','twenty-fourth','twenty-fifth','twenty-sixth','twenty-seventh','twenty-eighth','twenty-ninth','thirtieth','thirty-first'];
    return words[n]||String(n);
  }

  function seasonInfo(monthIndex){
    if([2,3,4].includes(monthIndex))return {word:'spring',label:'Spring',ja:'春',magic:'Spring Magic',magicJa:'春魔法'};
    if([5,6,7].includes(monthIndex))return {word:'summer',label:'Summer',ja:'夏',magic:'Summer Magic',magicJa:'夏魔法'};
    if([8,9,10].includes(monthIndex))return {word:'fall',label:'Fall',ja:'秋',magic:'Fall Magic',magicJa:'秋魔法'};
    return {word:'winter',label:'Winter',ja:'冬',magic:'Winter Magic',magicJa:'冬魔法'};
  }

  function weekIndex(){return Math.min(4,Math.floor((state.day-1)/7))}

  function clock(){
    const h=state.hour;
    const shown=h===0?12:h>12?h-12:h;
    return `${shown}:${String(state.minute).padStart(2,'0')} ${h>=12?'p.m.':'a.m.'}`;
  }

  function save(){Store.save(state)}

  function setTime(hour,minute=0){
    state.hour=hour;
    state.minute=minute;
    save();
    updateHud();
  }

  function statText(key){
    const base=Number(state.stats[key]||0);
    const buff=Number(state.dailyBuff[key]||0);
    return buff?`${base}+${buff}`:String(base);
  }

  function updateHud(){
    const month=months[state.month];
    const weekday=weekdays[state.weekday];
    const season=seasonInfo(state.month);
    const wi=weekIndex();
    $('dateMain').textContent=`${month.short} ${ordinal(state.day)}`;
    $('dateSub').textContent=`${weekday.short} · ${season.label} · ${weekShort[wi]}`;
    $('clockMain').textContent=clock();
    $('timeValue').textContent=clock();
    $('hourValue').textContent=state.hour;
    $('minuteValue').textContent=String(state.minute).padStart(2,'0');
    $('hpValue').textContent=state.hp;
    $('mpValue').textContent=state.mp;
    $('supplyValue').textContent=state.supply;
    $('peValue').textContent=statText('PE');
    $('scienceValue').textContent=statText('science');
    $('historyValue').textContent=statText('history');
    $('mathValue').textContent=statText('math');
    $('artValue').textContent=statText('art');
  }

  function setHeader(kicker,title,place='HOME'){
    $('stageKicker').textContent=kicker;
    $('stageTitle').textContent=title;
    $('placeLabel').textContent=place;
  }

  function clearActions(){
    const area=$('dailyActions');
    area.innerHTML='';
    area.classList.remove('one');
  }

  function one(){$('dailyActions').classList.add('one')}

  function action(en,ja,fn,opt={}){
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML=`${esc(en)}<br><small>${esc(ja)}</small>`;
    if(opt.primary)button.classList.add('primary');
    button.onclick=fn;
    $('dailyActions').appendChild(button);
    return button;
  }

  function highlightEnglish(text,words=[]){
    const terms=words.map(x=>x.en).filter(Boolean).sort((a,b)=>b.length-a.length);
    if(!terms.length)return esc(text);
    const pattern=new RegExp(`(${terms.map(reEsc).join('|')})`,'gi');
    return esc(text).replace(pattern,'<mark class="learn-word">$1</mark>');
  }

  function studyStrip(words=[]){
    if(!words.length)return '';
    return `<section class="study-strip"><div class="study-title">MEMORIZE / 覚える</div><div class="study-list">${words.map(w=>`<div class="study-item"><b>${esc(w.en)}</b><span>${esc(w.ja)}</span></div>`).join('')}</div></section>`;
  }

  function dialogue(speaker,en,ja,words=[],extra=''){
    $('dailyContent').innerHTML=`
      ${studyStrip(words)}
      <div class="dialogue-card">
        <span class="speaker">${esc(speaker)}</span>
        <div class="en dialogue-en">${highlightEnglish(en,words)}</div>
        <p class="jp">${esc(ja)}</p>
        ${extra}
      </div>`;
  }

  function next(stage){
    overlay=null;
    state.dailyStage=stage;
    save();
    render();
  }

  function nextButton(stage,en='Next',ja='次へ'){
    clearActions();
    one();
    action(en,ja,()=>next(stage),{primary:true});
  }

  function render(){
    updateHud();
    document.querySelectorAll('[data-jump]').forEach(button=>button.classList.toggle('on',button.dataset.jump===overlay));
    if(overlay==='today')return renderToday();
    if(overlay==='home')return renderHome();
    if(overlay==='bag')return renderBag();
    if(overlay==='status')return renderStatus();
    const valid=Object.prototype.hasOwnProperty.call(stages,state.dailyStage);
    if(!valid){state.dailyStage='month';save()}
    stages[state.dailyStage]();
  }

  function renderToday(){
    const m=months[state.month],w=weekdays[state.weekday],s=seasonInfo(state.month);
    setHeader('TODAY','Today');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">TODAY</span><div class="en">${esc(m.full)} ${ordinal(state.day)}</div><p class="jp">${esc(w.full)} / ${esc(s.label)} / ${esc(weekShort[weekIndex()])}</p></div>`;
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()},{primary:true});
  }

  function renderHome(){
    setHeader('HOME / 家','Home');
    dialogue('HOME','Home','家',[{en:'Home',ja:'家'}]);
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()},{primary:true});
  }

  function renderBag(){
    setHeader('BAG / かばん','Bag');
    const items=[];
    if(state.egg)items.push('egg / 卵');
    items.push(...state.inventory);
    $('dailyContent').innerHTML=`${studyStrip([{en:'bag',ja:'かばん'}])}<div class="dialogue-card"><span class="speaker">BAG</span>${items.length?items.map(item=>`<p>${esc(item)}</p>`).join(''):'<p class="jp">empty / 空</p>'}</div>`;
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()},{primary:true});
  }

  function renderStatus(){
    setHeader('STATUS / ステータス','Status');
    $('dailyContent').innerHTML=`<div class="dialogue-card"><span class="speaker">STATUS</span><p><b>PE</b> ${esc(statText('PE'))}</p><p><b>SCIENCE</b> ${esc(statText('science'))}</p><p><b>HISTORY</b> ${esc(statText('history'))}</p><p><b>MATH</b> ${esc(statText('math'))}</p><p><b>ART</b> ${esc(statText('art'))}</p></div>`;
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()},{primary:true});
  }

  const stages={
    month(){
      setTime(7,0);
      const m=months[state.month];
      setHeader('DATE / 日付','Today');
      dialogue('NARRATION',`It is ${m.full}.`,`${m.ja}です。`,[{en:m.full,ja:m.ja}]);
      nextButton('date');
    },

    date(){
      const m=months[state.month];
      dialogue('NARRATION',`It is ${m.full} ${ordinalWord(state.day)}.`,`${m.ja}${state.day}日です。`,[
        {en:m.full,ja:m.ja},{en:ordinalWord(state.day),ja:`${state.day}日 / ${ordinal(state.day)}`}
      ]);
      nextButton('weekday');
    },

    weekday(){
      const w=weekdays[state.weekday];
      dialogue('NARRATION',`Today is ${w.full}.`,`今日は${w.ja}です。`,[{en:'Today',ja:'今日'},{en:w.full,ja:w.ja}]);
      nextButton('week');
    },

    week(){
      const wi=weekIndex();
      dialogue('NARRATION',`It is the ${weekWords[wi]} week.`,`第${wi+1}週です。`,[{en:'week',ja:'週'},{en:weekWords[wi],ja:`第${wi+1}`}]);
      nextButton('season');
    },

    season(){
      const s=seasonInfo(state.month);
      dialogue('NARRATION',`It is ${s.word}.`,`${s.ja}です。`,[{en:s.word,ja:s.ja}]);
      nextButton('seasonMagic');
    },

    seasonMagic(){
      const s=seasonInfo(state.month);
      dialogue('NARRATION',`I can use ${s.magic}.`,`${s.magicJa}を使えます。`,[{en:s.magic,ja:s.magicJa}]);
      nextButton('timeQuestion');
    },

    timeQuestion(){
      dialogue('NARRATION','What time is it?','今何時ですか？',[{en:'time',ja:'時間'}]);
      nextButton('timeAnswer');
    },

    timeAnswer(){
      dialogue('NARRATION',"It is seven o'clock a.m.",'午前7時です。',[{en:"o'clock",ja:'〜時'}]);
      nextButton('morning');
    },

    morning(){
      dialogue('NARRATION','It is morning.','朝です。',[{en:'morning',ja:'朝'}]);
      nextButton('goodMorning');
    },

    goodMorning(){
      dialogue('YOU','Good morning.','おはよう。',[{en:'morning',ja:'朝'}]);
      nextButton('wake');
    },

    wake(){
      dialogue('YOU','I get up.','起きます。',[{en:'get up',ja:'起きる'}]);
      nextButton('egg');
    },

    egg(){
      setTime(7,10);
      dialogue('YOU','I take an egg.','卵を取ります。',[{en:'take',ja:'取る'},{en:'egg',ja:'卵'}],'<div id="eggResult"></div>');
      clearActions();
      if(state.eggTaken){one();action('Next','次へ',()=>next('breakfast'),{primary:true});return}
      action('Roll','判定する',()=>{
        const d=1+Math.floor(Math.random()*6);
        const ok=d>=3;
        state.eggTaken=true;
        state.egg=ok;
        save();
        const result=$('eggResult');
        if(result)result.innerHTML=`<div class="roll-result"><b>1d6 → ${d}</b><br>${ok?'Success! I get an egg. / 卵を手に入れました。':'Fail. No egg today. / 今日は卵を取れませんでした。'}</div>`;
        clearActions();one();action('Next','次へ',()=>next('breakfast'),{primary:true});
      },{primary:true});
      action('Skip','取らない',()=>{state.eggTaken=true;state.egg=false;save();next('breakfast')});
    },

    breakfast(){
      setTime(7,30);
      dialogue('NARRATION','It is breakfast time.','朝食の時間です。',[{en:'breakfast',ja:'朝食'}]);
      nextButton('fruit');
    },

    fruit(){
      if(!state.fruit){state.fruit=pick(fruits);save()}
      dialogue('YOU',`I use ${state.fruit[0]}.`,`${state.fruit[1]}を使います。`,[{en:state.fruit[0],ja:state.fruit[1]}]);
      clearActions();
      action('Fruit Oracle','果物を変える',()=>{state.fruit=pick(fruits);save();render()});
      action('Next','次へ',()=>next('juice'),{primary:true});
    },

    juice(){
      dialogue('YOU',`I make ${state.fruit[0]} juice.`,`${state.fruit[1]}ジュースを作ります。`,[{en:state.fruit[0],ja:state.fruit[1]},{en:'juice',ja:'ジュース'}],'<div class="effect">MP + FULL</div>');
      nextButton('drinkJuice');
    },

    drinkJuice(){
      dialogue('YOU','I drink juice.','ジュースを飲みます。',[{en:'drink',ja:'飲む'},{en:'juice',ja:'ジュース'}]);
      clearActions();one();action('Drink','飲む',()=>{state.mp=state.maxMp;save();next(state.egg?'eatEgg':'weatherQuestion')},{primary:true});
    },

    eatEgg(){
      dialogue('YOU','I eat an egg.','卵を食べます。',[{en:'eat',ja:'食べる'},{en:'egg',ja:'卵'}],'<div class="effect">PE +1 TODAY</div>');
      clearActions();one();action('Eat','食べる',()=>{state.dailyBuff.PE=1;state.egg=false;save();next('weatherQuestion')},{primary:true});
    },

    weatherQuestion(){
      setTime(8,0);
      dialogue('YOU','How is the weather?','天気はどうですか？',[{en:'weather',ja:'天気'}]);
      nextButton('weatherResult','Weather Oracle','天気を見る');
    },

    weatherResult(){
      if(!state.weather){state.weather=pick(weather);save()}
      const w=state.weather;
      dialogue('NARRATION',w.en,w.ja,[{en:w.word,ja:w.ja.replace('です。','').replace('があります。','')}]);
      clearActions();
      action('Weather Oracle','天気を変える',()=>{state.weather=pick(weather);save();render()});
      action('Next','次へ',()=>next('ready'),{primary:true});
    },

    ready(){
      setTime(8,15);
      dialogue('YOU','I am ready.','準備できました。',[{en:'ready',ja:'準備ができた'}]);
      clearActions();one();action('Morning again','朝を最初から見る',resetMorning,{primary:true});
    }
  };

  function resetMorning(){
    state.hour=7;
    state.minute=0;
    state.dailyStage='month';
    state.weather=null;
    state.fruit=null;
    state.egg=false;
    state.eggTaken=false;
    state.dailyBuff={};
    save();
    overlay=null;
    render();
  }

  document.querySelectorAll('[data-jump]').forEach(button=>{
    button.onclick=()=>{overlay=button.dataset.jump;render()};
  });

  $('saveBtn').onclick=()=>{
    save();
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>$('saveMessage').textContent='',900);
  };

  if(!Object.prototype.hasOwnProperty.call(stages,state.dailyStage)){
    state.dailyStage='month';
    save();
  }
  updateHud();
  render();
})();
