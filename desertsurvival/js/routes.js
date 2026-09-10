// Desert Survival 全体マップ用の主要ルート。
// 座標はゲーム世界（WORLD 12000 x 12000）上の配置用。
// 史料上の厳密な緯度経度ではなく、ゲーム内で歩ける地図として見やすく圧縮している。

export const IBN_BATTUTA_ROUTE = Object.freeze([
  { id:'sijilmasa', name:'シジルマサ', x:6000, z:1200, type:'town' },
  { id:'taghaza', name:'タガーザー', x:5400, z:3500, type:'resource', note:'シジルマサから25日' },
  { id:'walata', name:'ワラータ', x:5000, z:6200, type:'town' },
  { id:'mali_capital', name:'マーリー王都', x:4200, z:9000, type:'town' },
  { id:'timbuktu', name:'トンブクトゥ', x:6100, z:7900, type:'town' },
  { id:'gao', name:'ガオ', x:7600, z:8100, type:'town' },
  { id:'takedda', name:'タケッダ', x:9000, z:6500, type:'resource' },
  { id:'tuat', name:'トゥアート', x:7700, z:3000, type:'oasis' },
  { id:'sijilmasa_return', name:'シジルマサ', x:6000, z:1200, type:'town', returnPoint:true }
]);

export const MAP_REGION_LABELS = Object.freeze([
  { name:'アトラス山地', x:6000, z:550 },
  { name:'サハラ砂漠', x:6000, z:4700 },
  { name:'サヘル', x:6000, z:10300 }
]);
