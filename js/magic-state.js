(()=>{
  'use strict';
  const KEY='magicSchoolGameState_v3';
  const fresh={
    year:1,month:8,day:1,weekday:1,hour:7,minute:0,
    hp:5,maxHp:5,mp:5,maxMp:5,supply:5,maxSupply:5,
    stats:{PE:2,science:2,history:2,math:2,art:2},
    dailyBuff:{},inventory:[],money:0,currentQuest:null,
    dailyStage:'date',weather:null,fruit:null,egg:false,eggTaken:false,
    lunch:null,dinner:null,lastPlace:'HOME'
  };
  function clone(x){return JSON.parse(JSON.stringify(x))}
  function normalize(raw){
    const s={...clone(fresh),...(raw||{})};
    s.stats={...fresh.stats,...(raw?.stats||{})};
    s.dailyBuff={...(raw?.dailyBuff||{})};
    s.inventory=Array.isArray(raw?.inventory)?raw.inventory:[];
    return s;
  }
  function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){return clone(fresh)}}
  function save(state){localStorage.setItem(KEY,JSON.stringify(normalize(state)))}
  function reset(){localStorage.removeItem(KEY);return clone(fresh)}
  window.MagicGameState={KEY,fresh:clone(fresh),load,save,reset};
})();
