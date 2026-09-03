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
    {key:'sunny',en:'It is sunny.',ja:'晴れです。'},
    {key:'rainy',en:'It is rainy.',ja:'雨です。'},
    {key:'windy',en:'It is windy.',ja:'風があります。'},
    {key:'cloudy',en:'It is cloudy.',ja:'曇りです。'},
    {key:'hot',en:'It is hot.',ja:'暑いです。'},
    {key:'cold',en:'It is cold.',ja:'寒いです。'},
    {key:'warm',en:'It is warm.',ja:'暖かいです。'},
    {key:'cool',en:'It is cool.',ja:'涼しいです。'},
    {key:'blue sky',en:'The sky is blue.',ja:'空は青いです。'}
  ];

  const $=id=>document.getElementById(id);
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  function ordinal(n){
    const v=n%100;
    if(v>=11&&v<=13)return n+'th';
    if(n%10===1)return n+'st';
    if(n%10===2)return n+'nd';
    if(n%10===3)return n+'rd';
    return n+'th';
  }

  function ordinalWord(n){
    if(n===1)return 'first';
    if(n===2)return 'second';
    if(n===3)return 'third';
    if(n===4)return 'fourth';
    if(n===5)return 'fifth';
    if(n===6)return 'sixth';
    if(n===7)return 'seventh';
    if(n===8)return 'eighth';
    if(n===9)return 'ninth';
    if(n===10)return 'tenth';
    if(n===11)return 'eleventh';
    if(n===12)return 'twelfth';
    if(n===13)return 'thirteenth';
    if(n===14)return 'fourteenth';
    if(n===15)return 'fifteenth';
    if(n===16)return 'sixteenth';
    if(n===17)return 'seventeenth';
    if(n===18)return 'eighteenth';
    if(n===19)return 'nineteenth';
    if(n===20)return 'twentieth';
    if(n===21)return 'twenty-first';
    if(n===22)return 'twenty-second';
    if(n===23)return 'twenty-third';
    if(n===24)return 'twenty-fourth';
    if(n===25)return 'twenty-fifth';
    if(n===26)return 'twenty-sixth';
    if(n===27)return 'twenty-seventh';
    if(n===28)return 'twenty-eighth';
    if(n===29)return 'twenty-ninth';
    if(n===30)return 'thirtieth';
    return 'thirty-first';
  }

  function seasonInfo(monthIndex){
    if([2,3,4].includes(monthIndex))return {word:'spring',label:'Spring',ja:'春',magic:'Spring Magic',magicJa:'春魔法'};
    if([5,6,7].includes(monthIndex))return {word:'summer',label:'Summer',ja:'夏',magic:'Summer Magic',magicJa:'夏魔法'};
    if([8,9,10].includes(monthIndex))return {word:'fall',label:'Fall',ja:'秋',magic:'Fall Magic',magicJa:'秋魔法'};
    return {word:'winter',label:'Winter',ja:'冬',magic:'Winter Magic',magicJa:'冬魔法'};
  }

  function weekIndex(){
    return Math.min(4,Math.floor((state.day-1)/7));
  }

  function clock(){
    const h=state.hour;
    const shown=h===0?12:h>12?h-12:h;
    return `${shown}:${String(state.minute).padStart(2,'0')} ${h>=12?'p.m.':'a.m.'}`;
  }

  function save(){
    Store.save(state);
  }

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

  function one(){
    $('dailyActions').classList.add('one');
  }

  function action(en,ja,fn,opt={}){
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML=`${esc(en)}<br><small>${esc(ja)}</small>`;
    if(opt.primary)button.classList.add('primary');
    button.onclick=fn;
    $('dailyActions').appendChild(button);
    return button;
  }

  function dialogue(speaker,en,ja,extra=''){
    $('dailyContent').innerHTML=`
      <div class="card">
        <span class="label">${esc(speaker)}</span>
        <div class="en">${esc(en)}</div>
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
    document.querySelectorAll('[data-jump]').forEach(button=>{
      button.classList.toggle('on',button.dataset.jump===overlay);
    });

    if(overlay==='home')return renderHome();
    if(overlay==='bag')return renderBag();
    if(overlay==='status')return renderStatus();

    const stage=stages[state.dailyStage]||stages.month;
    stage();
  }

  function renderHome(){
    setHeader('HOME / 家','Home');
    dialogue('HOME','Home','家',`<p class="muted">朝の日常を進めています。</p>`);
    clearActions();
    one();
    action('Back','今の場面へ戻る',()=>{overlay=null;render();},{primary:true});
  }

  function renderBag(){
    setHeader('BAG / かばん','Bag');
    const items=[];
    if(state.egg)items.push('egg / 卵');
    items.push(...state.inventory);
    $('dailyContent').innerHTML=`<div class="card"><span class="label">BAG</span>${items.length?items.map(item=>`<p>${esc(item)}</p>`).join(''):'<p class="muted">empty / 空</p>'}</div>`;
    clearActions();
    one();
    action('Back','今の場面へ戻る',()=>{overlay=null;render();},{primary:true});
  }

  function renderStatus(){
    setHeader('STATUS / ステータス','Status');
    $('dailyContent').innerHTML=`
      <div class="card">
        <p><b>PE</b> ${esc(statText('PE'))}</p>
        <p><b>SCIENCE</b> ${esc(statText('science'))}</p>
        <p><b>HISTORY</b> ${esc(statText('history'))}</p>
        <p><b>MATH</b> ${esc(statText('math'))}</p>
        <p><b>ART</b> ${esc(statText('art'))}</p>
      </div>`;
    clearActions();
    one();
    action('Back','今の場面へ戻る',()=>{overlay=null;render();},{primary:true});
  }

  const stages={
    month(){
      setTime(7,0);
      const month=months[state.month];
      setHeader('DATE / 日付','Today');
      dialogue('NARRATION / 地の文',`It is ${month.full}.`,`${month.ja}です。`);
      nextButton('day');
    },

    day(){
      const month=months[state.month];
      setHeader('DATE / 日付','Today');
      dialogue('NARRATION / 地の文',`It is ${month.full} ${ordinalWord(state.day)}.`,`${month.ja}${state.day}日です。`);
      nextButton('weekday');
    },

    weekday(){
      const weekday=weekdays[state.weekday];
      setHeader('DATE / 日付','Today');
      dialogue('NARRATION / 地の文',`Today is ${weekday.full}.`,`今日は${weekday.ja}です。`);
      nextButton('week');
    },

    week(){
      const wi=weekIndex();
      setHeader('DATE / 日付','Today');
      dialogue('NARRATION / 地の文',`It is the ${weekWords[wi]} week.`,`第${wi+1}週です。`);
      nextButton('season');
    },

    season(){
      const season=seasonInfo(state.month);
      setHeader('SEASON / 季節','Season');
      dialogue('NARRATION / 地の文',`It is ${season.word}.`,`${season.ja}です。`);
      nextButton('seasonMagic');
    },

    seasonMagic(){
      const season=seasonInfo(state.month);
      setHeader('SEASON MAGIC / 季節魔法',season.magic);
      dialogue('YOU / 主人公',`I can use ${season.magic}.`,`${season.magicJa}を使えます。`);
      nextButton('time');
    },

    time(){
      setTime(7,0);
      setHeader('TIME / 時間','Morning');
      dialogue('NARRATION / 地の文','It is seven o’clock in the morning.','朝7時です。');
      nextButton('greeting');
    },

    greeting(){
      setHeader('MORNING / 朝','Morning');
      dialogue('YOU / 主人公','Good morning.','おはよう。');
      nextButton('wake');
    },

    wake(){
      setHeader('MORNING / 朝','Morning');
      dialogue('YOU / 主人公','I get up.','起きます。');
      nextButton('egg');
    },

    egg(){
      setTime(7,10);
      setHeader('MORNING / 朝','Egg');
      dialogue('YOU / 主人公','I take an egg.','鶏から卵を取ります。');
      clearActions();
      one();
      action('Roll','判定する',()=>{
        const roll=1+Math.floor(Math.random()*6);
        state.eggRoll=roll;
        state.eggTaken=true;
        state.egg=roll>=3;
        save();
        next('eggResult');
      },{primary:true});
    },

    eggResult(){
      setHeader('MORNING / 朝','Egg');
      const success=!!state.egg;
      dialogue(
        'YOU / 主人公',
        success?'I get an egg.':"I don't get an egg.",
        success?'卵を手に入れました。':'卵を取れませんでした。',
        `<p class="muted">1d6 → ${esc(state.eggRoll??'—')}</p>`
      );
      nextButton('breakfast');
    },

    breakfast(){
      setTime(7,30);
      setHeader('BREAKFAST / 朝食','Breakfast');
      dialogue('NARRATION / 地の文','It is breakfast time.','朝食の時間です。');
      nextButton('fruit');
    },

    fruit(){
      if(!state.fruit){
        state.fruit=pick(fruits);
        save();
      }
      setHeader('BREAKFAST / 朝食','Fruit juice');
      dialogue('YOU / 主人公',`I make ${state.fruit[0]} juice.`,`${state.fruit[1]}ジュースを作ります。`);
      clearActions();
      action('Fruit Oracle','果物を引き直す',()=>{
        state.fruit=pick(fruits);
        save();
        render();
      });
      action('Next','次へ',()=>next('drinkJuice'),{primary:true});
    },

    drinkJuice(){
      setHeader('BREAKFAST / 朝食','Fruit juice');
      dialogue('YOU / 主人公',`I drink ${state.fruit[0]} juice.`,`${state.fruit[1]}ジュースを飲みます。`,`<div class="effect">MP → ${state.maxMp}/${state.maxMp}</div>`);
      state.mp=state.maxMp;
      save();
      nextButton(state.egg?'eatEgg':'weatherQuestion');
    },

    eatEgg(){
      setHeader('BREAKFAST / 朝食','Egg');
      dialogue('YOU / 主人公','I eat the egg.','卵を食べます。','<div class="effect">PE +1 / today</div>');
      state.egg=false;
      state.dailyBuff.PE=1;
      save();
      updateHud();
      nextButton('weatherQuestion');
    },

    weatherQuestion(){
      setTime(8,0);
      setHeader('WEATHER / 天気','Weather');
      dialogue('YOU / 主人公','How is the weather?','天気はどうですか？');
      clearActions();
      one();
      action('Weather Oracle','天気を見る',()=>{
        state.weather=pick(weather);
        save();
        next('weatherAnswer');
      },{primary:true});
    },

    weatherAnswer(){
      const current=state.weather||pick(weather);
      state.weather=current;
      save();
      setHeader('WEATHER / 天気','Weather');
      dialogue('NARRATION / 地の文',current.en,current.ja,`<p class="muted">weather: ${esc(current.key)}</p>`);
      clearActions();
      action('Weather Oracle','天気を引き直す',()=>{
        state.weather=pick(weather);
        save();
        render();
      });
      action('Next','次へ',()=>next('ready'),{primary:true});
    },

    ready(){
      setTime(8,10);
      state.morningComplete=true;
      save();
      setHeader('MORNING / 朝','Ready');
      dialogue('YOU / 主人公','I am ready.','出かける準備ができました。','<p class="muted">朝の日常はここまでです。</p>');
      clearActions();
    }
  };

  document.querySelectorAll('[data-jump]').forEach(button=>{
    button.onclick=()=>{
      if(button.dataset.jump==='today'){
        overlay=null;
      }else{
        overlay=button.dataset.jump;
      }
      render();
    };
  });

  $('saveBtn').onclick=()=>{
    save();
    $('saveMessage').textContent='保存しました';
    setTimeout(()=>{$('saveMessage').textContent='';},900);
  };

  updateHud();
  render();
})();
