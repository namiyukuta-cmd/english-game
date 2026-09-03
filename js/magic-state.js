(()=>{
  'use strict';

  const KEY='magicSchoolGameState_v4';
  const fresh={
    year:1,
    month:8,
    day:1,
    weekday:1,
    hour:7,
    minute:0,

    hp:5,
    maxHp:5,
    mp:5,
    maxMp:5,
    supply:5,
    maxSupply:5,

    stats:{PE:2,science:2,history:2,math:2,art:2},
    dailyBuff:{},
    inventory:[],
    money:0,

    dailyStage:'month',
    egg:false,
    eggTaken:false,
    eggRoll:null,
    fruit:null,
    weather:null,
    morningComplete:false,
    lastPlace:'HOME'
  };

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function normalize(raw){
    const source=raw||{};
    const state={...clone(fresh),...source};
    state.stats={...fresh.stats,...(source.stats||{})};
    state.dailyBuff={...(source.dailyBuff||{})};
    state.inventory=Array.isArray(source.inventory)?source.inventory:[];
    return state;
  }

  function load(){
    try{
      return normalize(JSON.parse(localStorage.getItem(KEY)||'null'));
    }catch(error){
      return clone(fresh);
    }
  }

  function save(state){
    localStorage.setItem(KEY,JSON.stringify(normalize(state)));
  }

  function reset(){
    localStorage.removeItem(KEY);
    return clone(fresh);
  }

  window.MagicGameState={KEY,fresh:clone(fresh),load,save,reset};
})();
