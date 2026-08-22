(()=>{
  const sourceSets=[
    ...(window.WORD_DATA_G1_T1||[])
  ];

  const sortWords=(a,b)=>(a.grade-b.grade)||(a.term-b.term)||(a.step-b.step)||(a.order-b.order);
  const keyOf=w=>`${String(w.en).trim().toLowerCase()}\u0000${String(w.ja).trim()}`;

  function uniqueWords(list){
    const seen=new Set();
    return list.filter(word=>{
      const key=keyOf(word);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }

  function getWords(options={}){
    const {grade,term,step,minStep,maxStep,section,kind,unique=true}=options;
    let list=sourceSets.filter(word=>
      (grade==null||word.grade===grade)&&
      (term==null||word.term===term)&&
      (step==null||word.step===step)&&
      (minStep==null||word.step>=minStep)&&
      (maxStep==null||word.step<=maxStep)&&
      (section==null||word.section===section)&&
      (kind==null||word.kind===kind)
    ).sort(sortWords);
    if(unique)list=uniqueWords(list);
    return list;
  }

  function getCurrentStudyWords(progress={grade:1,term:1,step:1}){
    return getWords({grade:progress.grade,term:progress.term,maxStep:progress.step});
  }

  function getMaxStep(grade,term){
    return getWords({grade,term,unique:false}).reduce((max,word)=>Math.max(max,word.step),0);
  }

  function getById(id){return sourceSets.find(word=>word.id===id)||null}

  window.WordData={
    all:[...sourceSets].sort(sortWords),
    getWords,
    getCurrentStudyWords,
    getMaxStep,
    getById
  };

  // Existing game code can continue using WORDS.
  window.WORDS=getWords();
})();
