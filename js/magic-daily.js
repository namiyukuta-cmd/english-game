(()=>{
  'use strict';
  const Store=window.MagicGameState;
  let state=Store.load();
  let overlay=null;

  const months=[['January','1月'],['February','2月'],['March','3月'],['April','4月'],['May','5月'],['June','6月'],['July','7月'],['August','8月'],['September','9月'],['October','10月'],['November','11月'],['December','12月']];
  const weekdays=[['Sunday','日曜日'],['Monday','月曜日'],['Tuesday','火曜日'],['Wednesday','水曜日'],['Thursday','木曜日'],['Friday','金曜日'],['Saturday','土曜日']];
  const weeks=[['First week','第1週'],['Second week','第2週'],['Third week','第3週'],['Fourth week','第4週'],['Fifth week','第5週']];
  const fruits=[['apple','リンゴ'],['banana','バナナ'],['orange','オレンジ'],['strawberry','イチゴ'],['lemon','レモン']];
  const weather=[['sunny','晴れ'],['rainy','雨'],['windy','風'],['cloudy','曇り'],['hot','暑い'],['cold','寒い'],['warm','暖かい'],['cool','涼しい'],['blue sky','青空']];
  const lunches=[['salad','サラダ'],['soup','スープ'],['bread','パン'],['rice','ご飯'],['fish','魚'],['cake','ケーキ']];
  const dinners=[['meat','肉'],['beef','牛肉'],['pork','豚肉'],['chicken','鶏肉'],['fish','魚'],['salad','サラダ'],['soup','スープ'],['bread','パン'],['rice','ご飯']];
  const drinks=[['water','水'],['milk','牛乳'],['tea','お茶'],['coffee','コーヒー'],['juice','ジュース']];
  const quests=[
    {en:'Drive back monsters',ja:'遺跡から上がってくるモンスターを退治する',stat:'PE'},
    {en:'Investigate the ruins',ja:'地下遺跡の未調査区画を調べる',stat:'history'},
    {en:'Open an old door',ja:'古い扉と仕掛けを調べる',stat:'science'},
    {en:'Recover an old item',ja:'遺跡から古代の品を回収する',stat:'history'},
    {en:'Map a new passage',ja:'新しい通路を調査して地図に記録する',stat:'math'},
    {en:'Repair a magic seal',ja:'壊れた魔法の封印を描き直す',stat:'art'}
  ];

  const $=id=>document.getElementById(id);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function ordinal(n){const v=n%100;if(v>=11&&v<=13)return n+'th';return n+(n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th')}
  function season(m){if([2,3,4].includes(m))return ['spring','春'];if([5,6,7].includes(m))return ['summer','夏'];if([8,9,10].includes(m))return ['fall / autumn','秋'];return ['winter','冬']}
  function daysInMonth(m){return [31,28,31,30,31,30,31,31,30,31,30,31][m]}
  function weekIndex(){return Math.min(4,Math.floor((state.day-1)/7))}
  function clock(){const h=state.hour,hr=h===0?12:h>12?h-12:h;return `${hr}:${String(state.minute).padStart(2,'0')} ${h>=12?'p.m.':'a.m.'}`}
  function setTime(h,m=0){state.hour=h;state.minute=m;save();updateHud()}
  function save(){Store.save(state)}

  function updateHud(){
    const s=season(state.month);
    $('dateMain').textContent=`${months[state.month][0]} ${ordinal(state.day)}, ${weekdays[state.weekday][0]}`;
    $('dateSub').textContent=`Year ${state.year} · ${weeks[weekIndex()][0]} · ${s[0]}`;
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
  function statText(k){const base=Number(state.stats[k]||0),buff=Number(state.dailyBuff[k]||0);return buff?`${base}+${buff}`:String(base)}
  function effectiveStat(k){return Number(state.stats[k]||0)+Number(state.dailyBuff[k]||0)}

  function setHeader(kicker,title,place){$('stageKicker').textContent=kicker;$('stageTitle').textContent=title;$('placeLabel').textContent=place}
  function content(html){$('dailyContent').innerHTML=html}
  function clearActions(){const a=$('dailyActions');a.innerHTML='';a.classList.remove('one')}
  function action(en,ja,fn,opt={}){const b=document.createElement('button');b.type='button';b.innerHTML=`${esc(en)}<br><small>${esc(ja)}</small>`;if(opt.primary)b.classList.add('primary');if(opt.disabled)b.disabled=true;b.onclick=fn;$('dailyActions').appendChild(b);return b}
  function one(){ $('dailyActions').classList.add('one') }
  function go(stage){overlay=null;state.dailyStage=stage;save();render()}

  function render(){
    updateHud();
    document.querySelectorAll('[data-jump]').forEach(b=>b.classList.toggle('on',b.dataset.jump===overlay));
    if(overlay==='home')return renderHomePanel();
    if(overlay==='school')return renderSchoolPanel();
    if(overlay==='bag')return renderBag();
    if(overlay==='status')return renderStatus();
    const fn=stages[state.dailyStage]||stages.date;
    fn();
  }

  function renderHomePanel(){
    setHeader('HOME / 家','Home','HOME');
    content(`<h2>Home</h2><p class="jp">主人公の家です。朝食と休息を行います。</p><div class="card"><span class="label">TODAY</span><p><b>${esc(months[state.month][0])} ${ordinal(state.day)}</b></p><p>${state.egg?'egg × 1':'egg × 0'} / ${state.fruit?esc(state.fruit[0])+' juice':'juice —'}</p></div>`);
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()}, {primary:true});
  }
  function renderSchoolPanel(){
    setHeader('MAGIC SCHOOL','Magic School','MAGIC SCHOOL');
    content(`<h2>Public Ruins Survey Corps</h2><p class="jp">学校という名前が残っていますが、実際には遺跡調査とモンスター対策を行う公的組織です。</p><div class="card"><span class="label">MAGIC CLASSROOM</span><p>依頼の受付・斡旋を行います。</p>${state.currentQuest?`<div class="quest"><b>${esc(state.currentQuest.en)}</b><br>${esc(state.currentQuest.ja)}</div>`:'<p class="muted">現在受けている依頼はありません。</p>'}</div>`);
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()}, {primary:true});
  }
  function renderBag(){
    setHeader('BAG / かばん','Bag','BAG');
    const items=[];if(state.egg)items.push('egg / 卵');if(state.inventory.length)items.push(...state.inventory);
    content(`<h2>Bag</h2><div class="card">${items.length?items.map(x=>`<p>・${esc(x)}</p>`).join(''):'<p class="muted">empty / 空</p>'}</div>`);
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()}, {primary:true});
  }
  function renderStatus(){
    setHeader('STATUS','Status','STATUS');
    content(`<h2>Status</h2><div class="card"><p><b>PE</b> ${effectiveStat('PE')}</p><p><b>science</b> ${effectiveStat('science')}</p><p><b>history</b> ${effectiveStat('history')}</p><p><b>math</b> ${effectiveStat('math')}</p><p><b>art</b> ${effectiveStat('art')}</p></div><p class="muted">egg などの一時効果は「基本値＋補正」で上部にも表示されます。</p>`);
    clearActions();one();action('Back','今の場面へ戻る',()=>{overlay=null;render()}, {primary:true});
  }

  const stages={
    date(){
      setTime(7,0);const s=season(state.month);
      setHeader('DATE / 日付','Today','HOME');
      content(`<div class="card"><span class="label">CALENDAR</span><div class="en">${months[state.month][0]} ${ordinal(state.day)}, ${weekdays[state.weekday][0]}</div><p class="jp">${months[state.month][1]} ${state.day}日・${weekdays[state.weekday][1]}</p><p><span class="word">year</span> Year ${state.year}<br><span class="word">week</span> ${weeks[weekIndex()][0]}<br><span class="word">season</span> ${s[0]}</p></div><p><b>Morning</b> — 朝から始まります。</p>`);
      clearActions();one();action('Morning','朝を始める',()=>go('egg'),{primary:true});
    },
    egg(){
      setTime(7,0);setHeader('MORNING / 朝','Get an egg','HOME');
      content(`<div class="en">I take an egg.</div><p class="jp">鶏から卵を取ります。</p><div class="card"><span class="label">EGG</span><p>egg / 卵</p><p class="muted">取れた egg は breakfast で食べると、その日だけ PE に補正がつきます。</p><div id="eggResult"></div></div>`);
      clearActions();
      if(state.eggTaken){one();action('Breakfast','朝食へ',()=>go('breakfast'),{primary:true});return}
      action('Roll','判定する',()=>{
        const d=1+Math.floor(Math.random()*6),ok=d>=3;state.eggTaken=true;state.egg=ok;save();
        $('eggResult').innerHTML=`<p><b>1d6 → ${d}</b><br>${ok?'Success — egg を手に入れました。':'Fail — 今日は egg を取れませんでした。'}</p>`;
        clearActions();one();action('Breakfast','朝食へ',()=>go('breakfast'),{primary:true});
      },{primary:true});
      action('Skip','取らずに進む',()=>{state.eggTaken=true;state.egg=false;save();go('breakfast')});
    },
    breakfast(){
      setTime(7,30);if(!state.fruit){state.fruit=pick(fruits);save()}
      setHeader('BREAKFAST / 朝食','Breakfast','HOME');
      content(`<div class="card"><span class="label">FRUIT JUICE</span><div class="en">I make ${esc(state.fruit[0])} juice.</div><p class="jp">${esc(state.fruit[1])}ジュースを作ります。</p><p>apple / banana / orange / strawberry / lemon</p><div class="effect">juice → MP recovery / MP回復</div></div><div class="card"><span class="label">EGG</span>${state.egg?'<p>egg があります。</p><div class="effect">egg → PE +1 until evening / 夕方までPE+1</div>':'<p class="muted">今日は egg がありません。</p>'}</div>`);
      clearActions();action('Fruit Oracle','果物を引き直す',()=>{state.fruit=pick(fruits);save();render()});action('Eat breakfast','朝食を食べる',()=>{state.mp=state.maxMp;if(state.egg){state.dailyBuff.PE=1;state.egg=false}save();go('weather')},{primary:true});
    },
    weather(){
      setTime(8,0);if(!state.weather){state.weather=pick(weather);save()}
      setHeader('WEATHER / 天気','Weather','HOME');
      content(`<div class="en">How is the weather?</div><p class="jp">天気はどうですか？</p><div class="card"><span class="label">WEATHER ORACLE</span><div class="en">${esc(state.weather[0])}</div><p class="jp">${esc(state.weather[1])}</p></div>`);
      clearActions();action('Weather Oracle','天気を引き直す',()=>{state.weather=pick(weather);save();render()});action('Go to Magic School','Magic Schoolへ行く',()=>go('school'),{primary:true});
    },
    school(){
      setTime(9,0);setHeader('MORNING','Magic School','MAGIC SCHOOL');
      content(`<div class="en">I go to Magic School.</div><p class="jp">Magic Schoolへ出勤します。</p><div class="card"><h2>Magic School</h2><p>遺跡調査・モンスター対策を担当する公的組織。</p><p><b>Magic Classroom</b> は依頼の受付・斡旋所です。</p></div>`);
      clearActions();one();action('Magic Classroom','依頼受付へ',()=>go('classroom'),{primary:true});
    },
    classroom(){
      setTime(9,15);if(!state.currentQuest){state.currentQuest={...pick(quests),status:'offered'};save()}
      const q=state.currentQuest;
      setHeader('MAGIC CLASSROOM','Quest','MAGIC SCHOOL');
      content(`<div class="card quest"><span class="label">QUEST OFFER</span><div class="en">${esc(q.en)}</div><p class="jp">${esc(q.ja)}</p><p>Related status / 関連ステータス：<b>${esc(q.stat)}</b></p></div>`);
      clearActions();action('Another quest','別の依頼を見る',()=>{state.currentQuest={...pick(quests),status:'offered'};save();render()});action('Accept','依頼を受ける',()=>{state.currentQuest.status='accepted';save();go('lunch')},{primary:true});
    },
    lunch(){
      setTime(12,0);if(!state.lunch){state.lunch={food:pick(lunches),drink:pick(drinks)};save()}
      setHeader('AFTERNOON / 昼','Lunch','MAGIC SCHOOL');
      content(`<div class="card"><span class="label">LUNCH</span><p><b>food</b>：${esc(state.lunch.food[0])} / ${esc(state.lunch.food[1])}</p><p><b>drink</b>：${esc(state.lunch.drink[0])} / ${esc(state.lunch.drink[1])}</p></div><p class="muted">昼食後、依頼のため地下遺跡へ向かいます。</p>`);
      clearActions();action('Lunch Oracle','昼食を引き直す',()=>{state.lunch={food:pick(lunches),drink:pick(drinks)};save();render()});action('To the ruins','遺跡へ向かう',()=>go('dungeonGate'),{primary:true});
    },
    dungeonGate(){
      setTime(13,0);setHeader('AFTERNOON','Ruins entrance','RUINS');
      content(`<div class="card"><span class="label">NEXT HTML</span><div class="en">Enter the ruins.</div><p class="jp">ここから先は別の「ダンジョンHTML」に移動します。</p></div><p class="muted">今は日常HTMLだけを作っているため、仮の帰還ボタンだけ置いています。</p>`);
      clearActions();action('TEMP: Return','仮に遺跡から帰還する',()=>go('report'));action('Dungeon HTML','次に作る画面',()=>{}, {disabled:true,primary:true});
    },
    report(){
      setTime(17,30);setHeader('MAGIC CLASSROOM','Report','MAGIC SCHOOL');
      content(`<div class="en">I report the result.</div><p class="jp">Magic Classroomへ結果を報告します。</p>${state.currentQuest?`<div class="card quest"><b>${esc(state.currentQuest.en)}</b><br>${esc(state.currentQuest.ja)}</div>`:''}`);
      clearActions();one();action('Evening','夕方へ',()=>{if(state.currentQuest)state.currentQuest.status='reported';save();go('evening')},{primary:true});
    },
    evening(){
      setTime(18,0);state.dailyBuff={};save();setHeader('EVENING / 夕方','Evening','TOWN');
      content(`<div class="en">I go back to town.</div><p class="jp">仕事を終えて街へ戻ります。</p><div class="card"><p>egg の一時補正はここで終了します。</p></div>`);
      clearActions();one();action('Dinner','夕食へ',()=>go('dinner'),{primary:true});
    },
    dinner(){
      setTime(19,0);if(!state.dinner){state.dinner={food:pick(dinners),drink:pick(drinks)};save()}
      setHeader('EVENING','Dinner','RESTAURANT');
      content(`<div class="card"><span class="label">DINNER</span><p><b>food</b>：${esc(state.dinner.food[0])} / ${esc(state.dinner.food[1])}</p><p><b>drink</b>：${esc(state.dinner.drink[0])} / ${esc(state.dinner.drink[1])}</p></div>`);
      clearActions();action('Dinner Oracle','夕食を引き直す',()=>{state.dinner={food:pick(dinners),drink:pick(drinks)};save();render()});action('Night','夜へ',()=>go('night'),{primary:true});
    },
    night(){
      setTime(21,0);setHeader('NIGHT / 夜','Night','HOME');
      content(`<div class="en">I go home. I sleep.</div><p class="jp">家へ帰り、眠ります。</p><div class="card"><p><b>today</b> 今日</p><p><b>tomorrow</b> 明日</p><p><b>yesterday</b> 昨日</p></div>`);
      clearActions();one();action('Sleep','眠って明日へ',nextDay,{primary:true});
    }
  };

  function nextDay(){
    state.day++;state.weekday=(state.weekday+1)%7;
    if(state.day>daysInMonth(state.month)){state.day=1;state.month++;if(state.month>11){state.month=0;state.year++}}
    state.hour=7;state.minute=0;state.dailyStage='date';state.weather=null;state.fruit=null;state.egg=false;state.eggTaken=false;state.lunch=null;state.dinner=null;state.dailyBuff={};state.currentQuest=null;state.lastPlace='HOME';
    save();overlay=null;render();
  }

  document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{overlay=b.dataset.jump;render()});
  $('saveBtn').onclick=()=>{save();$('saveMessage').textContent='保存しました';setTimeout(()=>$('saveMessage').textContent='',900)};
  updateHud();render();
})();
