(() => {
  'use strict';

  window.DD_WORLD_DATA = Object.freeze({
    schemaVersion: 2,
    startSettlementId: 'brackenford',
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
        description: 'ブラッケンフォードを中心に、村、森、湖、洞窟、農場が点在する地方。街道を使って各地へ移動できる。',
        mapImageKey: 'brackenfordVale',
        townId: 'brackenford',
        landmarks: [
          {id:'brackenford', name:'Brackenford', nameJa:'ブラッケンフォード', x:51.5, y:53, playable:true, kind:'settlement', settlementId:'brackenford', travelMinutes:0},
          {id:'village_mill', name:'Mill Village', nameJa:'ミル村', x:67, y:67, playable:true, kind:'settlement', settlementId:'village_mill', travelMinutes:120},
          {id:'village_north', name:'North Village', nameJa:'ノース村', x:54, y:27, playable:true, kind:'settlement', settlementId:'village_north', travelMinutes:150},
          {id:'greenwhisper_forest', name:'Greenwhisper Forest', nameJa:'グリーンウィスパーの森', x:18, y:31, playable:true, kind:'area', travelMinutes:90},
          {id:'echohold_cave', name:'Echohold Cave', nameJa:'エコーホールド洞窟', x:10, y:61, playable:true, kind:'area', travelMinutes:135},
          {id:'lake_calmwater', name:'Lake Calmwater', nameJa:'カームウォーター湖', x:56, y:18, playable:true, kind:'area', travelMinutes:105},
          {id:'stonehelm_pass', name:'Stonehelm Pass', nameJa:'ストーンヘルム峠', x:82, y:19, playable:false, kind:'area'},
          {id:'fallenwatch_ruins', name:'Fallenwatch Ruins', nameJa:'フォールンウォッチ遺跡', x:75, y:47, playable:false, kind:'area'},
          {id:'goldenfield_farm', name:'Goldenfield Farm', nameJa:'ゴールデンフィールド農場', x:78, y:78, playable:true, kind:'area', travelMinutes:75}
        ]
      }
    },
    towns: {
      brackenford: {
        id:'brackenford', name:'Brackenford', nameJa:'ブラッケンフォード', type:'town', regionId:'brackenford_vale', startPlaceId:'town_square',
        description:'旅人や商人が行き交う地方の中心都市。中央広場から酒場、店、教会、宿へ向かえる。',
        places:{
          town_square:{id:'town_square',nameJa:'中央広場',type:'square',description:'ブラッケンフォードの中心。石畳の広場を囲むように店や公共施設が並んでいる。',exits:['tavern','general_store','blacksmith','apothecary','church','inn']},
          tavern:{id:'tavern',nameJa:'酒場',type:'tavern',description:'食事と酒、噂や仕事を求める者が集まるにぎやかな酒場。',exits:['town_square']},
          general_store:{id:'general_store',nameJa:'雑貨店',type:'shop',description:'旅に必要な日用品や雑貨を扱う店。',exits:['town_square']},
          blacksmith:{id:'blacksmith',nameJa:'鍛冶屋',type:'shop',description:'武器、防具、金属製の道具を扱う鍛冶屋。',exits:['town_square']},
          apothecary:{id:'apothecary',nameJa:'薬屋',type:'apothecary',description:'薬草、軟膏、治療用品を扱う小さな薬屋。',exits:['town_square']},
          church:{id:'church',nameJa:'教会',type:'church',description:'祈りや相談のために人々が訪れる小さな教会。',exits:['town_square']},
          inn:{id:'inn',nameJa:'宿屋',type:'inn',description:'旅人が宿泊し、休息を取るための宿屋。',exits:['town_square']}
        }
      },
      village_mill: {
        id:'village_mill', name:'Mill Village', nameJa:'ミル村', type:'village', regionId:'brackenford_vale', startPlaceId:'village_square',
        description:'水車と畑に囲まれた小さな村。旅人向けの小さな酒場と雑貨店がある。',
        places:{
          village_square:{id:'village_square',nameJa:'村の広場',type:'square',description:'水車の音が遠くに聞こえる静かな広場。',exits:['tavern','general_store','church']},
          tavern:{id:'tavern',nameJa:'村の酒場',type:'tavern',description:'村人と旅人が集まる小さな酒場。',exits:['village_square']},
          general_store:{id:'general_store',nameJa:'雑貨店',type:'shop',description:'生活用品と簡単な旅道具を扱っている。',exits:['village_square']},
          church:{id:'church',nameJa:'祈りの堂',type:'church',description:'村人が祈りを捧げる小さな礼拝所。',exits:['village_square']}
        }
      },
      village_north: {
        id:'village_north', name:'North Village', nameJa:'ノース村', type:'village', regionId:'brackenford_vale', startPlaceId:'village_square',
        description:'北の街道沿いにある古い村。石造りの家と古井戸が残っている。',
        places:{
          village_square:{id:'village_square',nameJa:'村の広場',type:'square',description:'中央に古い掲示板が立つ小さな広場。',exits:['tavern','general_store','church']},
          tavern:{id:'tavern',nameJa:'村の酒場',type:'tavern',description:'暖炉のある簡素な酒場。',exits:['village_square']},
          general_store:{id:'general_store',nameJa:'雑貨店',type:'shop',description:'保存食や日用品を扱う小さな店。',exits:['village_square']},
          church:{id:'church',nameJa:'小教会',type:'church',description:'村外れに建つ古い小教会。',exits:['village_square']}
        }
      }
    },
    areas: {
      greenwhisper_forest:{id:'greenwhisper_forest',nameJa:'グリーンウィスパーの森',type:'wilderness',description:'木々が密生する東の森。薬草や獣の痕跡を探せそうだ。'},
      echohold_cave:{id:'echohold_cave',nameJa:'エコーホールド洞窟',type:'dungeon',description:'岩肌に口を開ける洞窟。奥から冷たい空気が流れてくる。'},
      lake_calmwater:{id:'lake_calmwater',nameJa:'カームウォーター湖',type:'wilderness',description:'静かな水面が広がる湖。街道から少し外れた休息地でもある。'},
      goldenfield_farm:{id:'goldenfield_farm',nameJa:'ゴールデンフィールド農場',type:'wilderness',description:'穀物畑と牧草地が広がる大きな農場。'}
    }
  });
})();
