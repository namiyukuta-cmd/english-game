window.GameStore = (()=>{
  const KEY='englishPuzzleSaveV1';
  const defaultProgress={grade:1,term:1,step:1};
  const defaultWordIds=()=>WordData.getCurrentStudyWords(defaultProgress).map(w=>w.id);
  const initial={
    coins:0,
    unlockedWordIds:defaultWordIds(),
    studyProgress:{...defaultProgress},
    seenSentenceIds:[],
    seenGrammarIds:[],
    letterRequesterIndex:0,
    passedUnitTests:[]
  };

  const unitTestKey=(grade,term,unit)=>`g${grade}t${term}_unit${unit}`;

  function clampLockedProgress(progress,passedTests=[]){
    const next={...defaultProgress,...progress};
    // 中1・1学期 Unit1 = Step 7〜9。Unit2 (Step 10〜) は Unit1テスト合格後だけ解放。
    if(next.grade===1&&next.term===1&&next.step>=10&&!passedTests.includes(unitTestKey(1,1,1))){
      next.step=9;
    }
    return next;
  }

  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
      const passedUnitTests=Array.isArray(saved.passedUnitTests)?saved.passedUnitTests:[];
      const state={...initial,...saved,passedUnitTests};
      state.studyProgress=clampLockedProgress(saved.studyProgress||defaultProgress,passedUnitTests);
      const required=WordData.getCurrentStudyWords(state.studyProgress).map(w=>w.id);
      state.unlockedWordIds=[...new Set([...(saved.unlockedWordIds||[]),...required])];
      if(!Number.isInteger(state.letterRequesterIndex)||state.letterRequesterIndex<0)state.letterRequesterIndex=0;
      return state;
    }catch(e){return {...initial,studyProgress:{...defaultProgress},passedUnitTests:[]}}
  }

  let state=load();
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function addCoins(n){state.coins+=n;save()}
  function unlockWords(ids){for(const id of ids){if(!state.unlockedWordIds.includes(id))state.unlockedWordIds.push(id)}save()}
  function hasPassedUnitTest(grade,term,unit){return state.passedUnitTests.includes(unitTestKey(grade,term,unit))}
  function setStudyProgress(progress){
    state.studyProgress=clampLockedProgress({...state.studyProgress,...progress},state.passedUnitTests);
    unlockWords(WordData.getCurrentStudyWords(state.studyProgress).map(w=>w.id));
    save();
  }
  function unlockNextStudyStep(){
    const p=state.studyProgress;
    const max=WordData.getMaxStep(p.grade,p.term);
    if(p.step>=max)return p.step;

    // Unit1-3の次はテストに合格するまでUnit2へ進まない。
    if(p.grade===1&&p.term===1&&p.step===9&&!hasPassedUnitTest(1,1,1))return p.step;

    setStudyProgress({step:p.step+1});
    return state.studyProgress.step;
  }
  function passUnitTest(grade,term,unit){
    const key=unitTestKey(grade,term,unit);
    if(!state.passedUnitTests.includes(key))state.passedUnitTests.push(key);

    // Unit1テスト合格でUnit2-1 (Step 10) を解放。
    if(grade===1&&term===1&&unit===1&&state.studyProgress.grade===1&&state.studyProgress.term===1&&state.studyProgress.step<=9){
      state.studyProgress={grade:1,term:1,step:10};
      const required=WordData.getCurrentStudyWords(state.studyProgress).map(w=>w.id);
      state.unlockedWordIds=[...new Set([...state.unlockedWordIds,...required])];
    }
    save();
    return state.studyProgress;
  }
  function advanceLetterRequester(){
    state.letterRequesterIndex=(state.letterRequesterIndex||0)+1;
    save();
    return state.letterRequesterIndex;
  }
  function seeSentence(id){if(!state.seenSentenceIds.includes(id)){state.seenSentenceIds.push(id);save()}}
  function seeGrammar(id){const first=!state.seenGrammarIds.includes(id);if(first){state.seenGrammarIds.push(id);save()}return first}
  return {get state(){return state},save,addCoins,unlockWords,setStudyProgress,unlockNextStudyStep,hasPassedUnitTest,passUnitTest,advanceLetterRequester,seeSentence,seeGrammar};
})();