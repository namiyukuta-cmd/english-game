(()=>{
  const SOURCE='data/english-word-oracle.md';

  const EASY=new Set([
    'dog','cat','bird','fish','book','pen','pencil','school','father','mother','dad','mom','boy','girl','man','woman','friend',
    'house','home','room','door','bed','table','box','cup','phone','shirt','hat','cap','food','bread','rice','meat','beef','pork','fish','egg','cake','fruit','apple','banana','orange','lemon','water','milk','tea','juice',
    'park','city','town','sea','car','bus','train','ship','taxi','tree','flower','sun','moon','star','sky','rain','snow','red','blue','green','white','black','pink',
    'time','year','week','day','today','night','go','come','run','walk','swim','fly','jump','sit','stand','stop','turn','open','close','push','pull','get','take','put','eat','drink','cook','sleep','wash','buy','use','talk','say','tell','ask','look','see','read','write','play','work','help','want','like','love','know','make','meet','live','need',
    'good','bad','big','small','new','old','long','short','tall','high','low','hot','cold','warm','cool','fast','slow','happy','sad','nice','easy','hard','kind','now','then','soon','again','here','there','very','too','well',
    'what','who','where','when','why','how','this','that','in','on','at','by','to','and','but','or','one','two','three','four','five','six','seven','eight','nine','ten'
  ]);

  const HARD=new Set([
    'as','of','for','from','with','about','before','after','because','whose','which','these','those','under',
    'eraser','dictionary','classroom','textbook','homework','computer','umbrella','restaurant','supermarket','hospital','library','museum','bicycle',
    'grandfather','grandmother','parents','children','police officer','strawberry','elephant','weather',
    'wednesday','thursday','saturday','february','september','october','november','december','afternoon','evening','yesterday','tomorrow',
    'beautiful','usually','sometimes','always','never','quiet','dirty','answer','listen','speak','think','feel','finish','carry','bring','teach','learn'
  ]);

  function cleanEnglish(raw){
    return raw.replace(/[`*_]/g,'').trim();
  }

  function alternatives(raw){
    return cleanEnglish(raw).split(/\s*[・/]\s*/).map(v=>v.trim()).filter(Boolean);
  }

  function difficultyFor(word){
    const w=word.toLowerCase().trim();
    if(HARD.has(w)) return 'hard';
    if(EASY.has(w)) return 'easy';
    const letters=(w.match(/[a-z]/g)||[]).length;
    if(w.includes(' ') || letters>=9) return 'hard';
    if(letters<=4) return 'easy';
    return 'normal';
  }

  function parse(text){
    const rows=[];
    const re=/^\s*\d+\.\s+(.+?)（(.+?)）\s*$/gm;
    let m;
    let serial=0;
    while((m=re.exec(text))!==null){
      const raw=cleanEnglish(m[1]);
      const ja=m[2].trim();
      const alts=alternatives(raw);
      if(!alts.length) continue;
      const word=alts[0];
      const key=word.toLowerCase()+'|'+ja+'|'+serial++;
      rows.push({word,ja,alternatives:alts,difficulty:difficultyFor(word),key,raw});
    }
    return rows;
  }

  async function load(){
    const res=await fetch(SOURCE,{cache:'no-store'});
    if(!res.ok) throw new Error('vocabulary load failed: '+res.status);
    return parse(await res.text());
  }

  function isTypingBattle(){
    let path='';
    try{path=decodeURIComponent(location.pathname)}catch(e){path=location.pathname}
    return path.endsWith('/タイピング.html');
  }

  function enableTypingBattleSmoothApproach(){
    if(!isTypingBattle()) return;
    const style=document.createElement('style');
    style.id='typingSmoothEnemyStyle';
    style.textContent=`
      #enemy.enemy{
        transition:transform 4.8s linear,margin-top 4.8s linear,filter .15s ease,opacity .18s ease !important;
        will-change:transform,margin-top;
      }
      #enemy.enemy.step0{
        animation:typingEnemyFirstApproach 4.8s linear both;
      }
      #enemy.enemy.hit{
        transition:transform .22s ease-out,margin-top .22s ease-out,filter .15s ease,opacity .18s ease !important;
      }
      @keyframes typingEnemyFirstApproach{
        from{transform:scale(.58);margin-top:-8px}
        to{transform:scale(.72);margin-top:2px}
      }
    `;
    document.head.appendChild(style);
  }

  function enableTypingBattleGameOverChoice(){
    if(!isTypingBattle()) return;

    const setup=()=>{
      const heroHp=document.getElementById('heroHp');
      if(!heroHp) return;
      let shown=false;

      const showChoice=()=>{
        if(shown) return;
        const hearts=(heroHp.textContent.match(/♥/g)||[]).length;
        if(hearts>0) return;
        shown=true;

        const overlay=document.createElement('div');
        overlay.id='typingGameOverChoice';
        Object.assign(overlay.style,{
          position:'fixed',inset:'0',zIndex:'1000',display:'flex',alignItems:'center',justifyContent:'center',
          padding:'24px',background:'rgba(3,8,15,.82)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
        });

        const card=document.createElement('div');
        Object.assign(card.style,{
          width:'min(360px,100%)',padding:'24px 18px 18px',border:'1px solid #4a607d',borderRadius:'20px',
          background:'#111e30',color:'#fff',textAlign:'center',boxShadow:'0 18px 50px rgba(0,0,0,.45)'
        });

        const title=document.createElement('div');
        title.textContent='GAME OVER';
        Object.assign(title.style,{fontSize:'32px',fontWeight:'950',marginBottom:'18px',color:'#ff8c8c'});

        const buttons=document.createElement('div');
        Object.assign(buttons.style,{display:'grid',gap:'10px'});

        const restart=document.createElement('button');
        restart.type='button';
        restart.textContent='再開';
        Object.assign(restart.style,{
          minHeight:'56px',border:'0',borderRadius:'14px',background:'#ffd54f',color:'#172033',fontSize:'19px',fontWeight:'950'
        });
        restart.addEventListener('click',()=>location.reload());

        const top=document.createElement('button');
        top.type='button';
        top.textContent='トップに戻る';
        Object.assign(top.style,{
          minHeight:'56px',border:'1px solid #49627f',borderRadius:'14px',background:'#1b2b42',color:'#fff',fontSize:'18px',fontWeight:'900'
        });
        top.addEventListener('click',()=>location.href='シューティングtop.html');

        buttons.append(restart,top);
        card.append(title,buttons);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
      };

      new MutationObserver(showChoice).observe(heroHp,{childList:true,characterData:true,subtree:true});
      showChoice();
    };

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
    else setup();
  }

  window.EIKEN5Vocabulary={load,parse,difficultyFor,SOURCE};
  enableTypingBattleSmoothApproach();
  enableTypingBattleGameOverChoice();
})();
