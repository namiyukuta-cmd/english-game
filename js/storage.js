window.GameStore = (()=>{
  const KEY='englishPuzzleSaveV1';
  const initial={coins:0,unlockedWordIds:['i','am','a','student','cat','dog','book','apple','like','have','you','are','happy'],seenSentenceIds:[],seenGrammarIds:[]};
  function load(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...initial}}}
  let state=load();
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function addCoins(n){state.coins+=n;save()}
  function unlockWords(ids){for(const id of ids){if(!state.unlockedWordIds.includes(id))state.unlockedWordIds.push(id)}save()}
  function seeSentence(id){if(!state.seenSentenceIds.includes(id))state.seenSentenceIds.push(id);save()}
  function seeGrammar(id){const first=!state.seenGrammarIds.includes(id);if(first){state.seenGrammarIds.push(id);save()}return first}
  return {get state(){return state},save,addCoins,unlockWords,seeSentence,seeGrammar};
})();