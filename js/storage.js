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
    letterRequesterIndex:0
  };

  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
      const state={...initial,...saved};
      state.studyProgress={...defaultProgress,...(saved.studyProgress||{})};
      const required=WordData.getCurrentStudyWords(state.studyProgress).map(w=>w.id);
      state.unlockedWordIds=[...new Set([...(saved.unlockedWordIds||[]),...required])];
      if(!Number.isInteger(state.letterRequesterIndex)||state.letterRequesterIndex<0)state.letterRequesterIndex=0;
      return state;
    }catch(e){return {...initial,studyProgress:{...defaultProgress}}}
  }

  let state=load();
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function addCoins(n){state.coins+=n;save()}
  function unlockWords(ids){for(const id of ids){if(!state.unlockedWordIds.includes(id))state.unlockedWordIds.push(id)}save()}
  function setStudyProgress(progress){
    state.studyProgress={...state.studyProgress,...progress};
    unlockWords(WordData.getCurrentStudyWords(state.studyProgress).map(w=>w.id));
    save();
  }
  function unlockNextStudyStep(){
    const p=state.studyProgress;
    const max=WordData.getMaxStep(p.grade,p.term);
    if(p.step<max)setStudyProgress({step:p.step+1});
    return state.studyProgress.step;
  }
  function advanceLetterRequester(){
    state.letterRequesterIndex=(state.letterRequesterIndex||0)+1;
    save();
    return state.letterRequesterIndex;
  }
  function seeSentence(id){if(!state.seenSentenceIds.includes(id)){state.seenSentenceIds.push(id);save()}}
  function seeGrammar(id){const first=!state.seenGrammarIds.includes(id);if(first){state.seenGrammarIds.push(id);save()}return first}
  return {get state(){return state},save,addCoins,unlockWords,setStudyProgress,unlockNextStudyStep,advanceLetterRequester,seeSentence,seeGrammar};
})();