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

    // Ruins / quest progression shared by Daily, Magic School, Dungeon and Battle.
    mainQuest:{reachedFloor:1},
    sideQuest:null,
    capturedMonsters:[],
    questItems:{},
    flags:{},
    completedSideQuests:[],

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
    state.mainQuest={...fresh.mainQuest,...(source.mainQuest||{})};
    state.sideQuest=source.sideQuest&&typeof source.sideQuest==='object'?source.sideQuest:null;
    state.capturedMonsters=Array.isArray(source.capturedMonsters)?source.capturedMonsters:[];
    state.questItems=source.questItems&&typeof source.questItems==='object'?{...source.questItems}:{};
    state.flags=source.flags&&typeof source.flags==='object'?{...source.flags}:{};
    state.completedSideQuests=Array.isArray(source.completedSideQuests)?source.completedSideQuests:[];
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
