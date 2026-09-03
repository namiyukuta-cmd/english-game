(()=>{
  'use strict';

  // Main quest data only. Change requirements here without rewriting dungeon logic.
  window.MAGIC_MAIN_QUESTS={
    1:{
      id:'open_b2',
      floor:1,
      nextFloor:2,
      titleEn:'Open the way to B2F',
      titleJa:'B2Fへの道を開け',
      requirements:[
        {
          type:'discover',
          floor:1,
          count:8,
          labelEn:'Explore all 8 areas on B1F',
          labelJa:'B1Fの8マスをすべて発見する'
        },
        {
          type:'boss_capture',
          floor:1,
          labelEn:'Capture the B1F boss',
          labelJa:'B1Fのボスを捕まえる'
        }
      ]
    }
  };
})();
