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

  window.EIKEN5Vocabulary={load,parse,difficultyFor,SOURCE};
})();
