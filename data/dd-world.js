(() => {
  'use strict';

  window.DD_WORLD_DATA = Object.freeze({
    schemaVersion: 1,
    world: {
      id: 'world_01',
      name: '世界地図',
      mapImageKey: 'world',
      playableRegionId: 'brackenford_vale'
    },
    regions: {
      brackenford_vale: {
        id: 'brackenford_vale',
        name: 'Brackenford Vale',
        nameJa: 'ブラッケンフォードの谷',
        mapImageKey: 'brackenfordVale',
        townId: 'brackenford',
        landmarks: [
          {id:'brackenford', name:'Brackenford', nameJa:'ブラッケンフォード', x:51.5, y:53, playable:true},
          {id:'rusty_tankard', name:'The Rusty Tankard Inn', nameJa:'ラスティ・タンカード亭', x:28, y:69},
          {id:'echohold_cave', name:'Echohold Cave', nameJa:'エコーホールド洞窟', x:10, y:61},
          {id:'greenwhisper_forest', name:'Greenwhisper Forest', nameJa:'グリーンウィスパーの森', x:18, y:31},
          {id:'lake_calmwater', name:'Lake Calmwater', nameJa:'カームウォーター湖', x:56, y:18},
          {id:'stonehelm_pass', name:'Stonehelm Pass', nameJa:'ストーンヘルム峠', x:82, y:19},
          {id:'fallenwatch_ruins', name:'Fallenwatch Ruins', nameJa:'フォールンウォッチ遺跡', x:75, y:47},
          {id:'goldenfield_farm', name:'Goldenfield Farm', nameJa:'ゴールデンフィールド農場', x:78, y:78}
        ]
      }
    },
    towns: {
      brackenford: {
        id: 'brackenford',
        name: 'Brackenford',
        nameJa: 'ブラッケンフォード',
        regionId: 'brackenford_vale',
        startPlaceId: 'town_square',
        places: {
          town_square: {
            id:'town_square', nameJa:'中央広場', type:'square',
            description:'ブラッケンフォードの中心。街の各施設と門へ向かえる。',
            exits:['tavern','general_store','blacksmith','church','inn','north_gate','south_gate']
          },
          tavern: {
            id:'tavern', nameJa:'酒場', type:'tavern',
            description:'食事と酒、噂や仕事を求める者が集まるにぎやかな酒場。',
            exits:['town_square']
          },
          general_store: {
            id:'general_store', nameJa:'雑貨店', type:'shop',
            description:'旅に必要な日用品や雑貨を扱う店。',
            exits:['town_square']
          },
          blacksmith: {
            id:'blacksmith', nameJa:'鍛冶屋', type:'shop',
            description:'武器、防具、金属製の道具を扱う鍛冶屋。',
            exits:['town_square']
          },
          church: {
            id:'church', nameJa:'教会', type:'church',
            description:'祈りや相談のために人々が訪れる小さな教会。',
            exits:['town_square']
          },
          inn: {
            id:'inn', nameJa:'宿屋', type:'inn',
            description:'旅人が宿泊し、休息を取るための宿屋。',
            exits:['town_square']
          },
          north_gate: {
            id:'north_gate', nameJa:'北門', type:'gate',
            description:'街の北側の門。門の向こうには街道が続いている。',
            exits:['town_square']
          },
          south_gate: {
            id:'south_gate', nameJa:'南門', type:'gate',
            description:'街の南側の門。門の向こうには街道が続いている。',
            exits:['town_square']
          }
        }
      }
    }
  });
})();
