/*
 * Item data used by the D&D inventory screen.
 * Generated from the D&D item ledger; keep every existing id stable.
 * Quantities belong to inventory entries, while priceQuantity and contents retain bundle counts.
 *
 * This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1")
 * by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
 * The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
 * available at https://creativecommons.org/licenses/by/4.0/legalcode.
 */
window.DD_ITEMS = {
  "longsword": {
    "id": "longsword",
    "name": "Longsword",
    "ja": "ロングソード",
    "type": "weapon",
    "descriptionJa": "片手でも両手でも扱える、まっすぐな長剣。斬撃に向き、盾との併用もしやすい。",
    "usageJa": "近接攻撃に使用。片手では1d8、両手では1d10の斬撃ダメージ。武器習熟でSapを利用できる。",
    "price": {
      "gp": 15
    },
    "weight": 3,
    "damage": "1d8 Slashing",
    "properties": [
      "Versatile (1d10)",
      "Mastery: Sap"
    ]
  },
  "dagger": {
    "id": "dagger",
    "name": "Dagger",
    "ja": "ダガー",
    "type": "weapon",
    "descriptionJa": "短く軽い刃を持つ小型の武器。素早く取り回せ、投げても使える。",
    "usageJa": "近接または投擲攻撃に使用。1d4刺突ダメージ。Finesseで敏捷力を使え、Light武器として二刀流に向く。",
    "price": {
      "gp": 2
    },
    "weight": 1,
    "damage": "1d4 Piercing",
    "properties": [
      "Finesse",
      "Light",
      "Thrown (Range 20/60)",
      "Mastery: Nick"
    ]
  },
  "shield": {
    "id": "shield",
    "name": "Shield",
    "ja": "シールド",
    "type": "armor",
    "descriptionJa": "片腕で構えて攻撃を受け流す防具。訓練を持つ者が装備すると守りを高める。",
    "usageJa": "Utilizeアクションで装備または解除。適切なArmor TrainingがあればACに+2。盾は同時に1つだけ使える。",
    "price": {
      "gp": 10
    },
    "weight": 6,
    "acBonus": 2,
    "properties": [
      "Shield",
      "Utilize action to don or doff"
    ]
  },
  "chain_mail": {
    "id": "chain_mail",
    "name": "Chain Mail",
    "ja": "チェイン・メイル",
    "type": "armor",
    "descriptionJa": "多数の金属輪を編んだ重装鎧。全身を広く覆い、重いが高い防御力を持つ。",
    "usageJa": "装備中の基本ACは16。筋力13未満では移動速度が10フィート低下し、隠密判定には不利。",
    "price": {
      "gp": 75
    },
    "weight": 55,
    "ac": 16,
    "properties": [
      "Heavy Armor",
      "Strength 13",
      "Stealth: Disadvantage"
    ]
  },
  "javelin": {
    "id": "javelin",
    "name": "Javelin",
    "ja": "ジャヴェリン",
    "type": "weapon",
    "descriptionJa": "投げるために重心を整えた細身の槍。近接でも投擲でも刺突に使える。",
    "usageJa": "近接または30/120フィートの投擲攻撃に使用。1d6刺突ダメージ。武器習熟でSlowを利用できる。",
    "price": {
      "sp": 5
    },
    "weight": 2,
    "damage": "1d6 Piercing",
    "properties": [
      "Thrown (Range 30/120)",
      "Mastery: Slow"
    ]
  },
  "arrow": {
    "id": "arrow",
    "name": "Arrow",
    "ja": "アロー",
    "type": "ammo",
    "descriptionJa": "細い矢柄に矢じりと羽根を付けた弓用の弾薬。1本ずつ所持数を管理する。",
    "usageJa": "LongbowまたはShortbowで攻撃するたびに1本消費する。SRDの購入単位は20本で1 GP、重量1 lb。",
    "price": {
      "gp": 1
    },
    "priceQuantity": 20,
    "weight": 0.05,
    "properties": [
      "Ammunition",
      "Used by Longbow and Shortbow",
      "20 arrows weigh 1 lb"
    ]
  },
  "torch": {
    "id": "torch",
    "name": "Torch",
    "ja": "松明",
    "type": "consumable",
    "descriptionJa": "木の棒の先に燃料を含ませた布などを巻いた携帯用の明かり。使用すると燃え尽きる消耗品。",
    "usageJa": "点火すると1時間、20フィートを明るく照らし、さらに20フィートを薄暗く照らす。攻撃に使うと1 Fireダメージ。",
    "price": {
      "cp": 1
    },
    "weight": 1,
    "properties": [
      "Burns for 1 hour",
      "Bright Light 20 ft",
      "Dim Light +20 ft",
      "Improvised attack: 1 Fire"
    ]
  },
  "rations": {
    "id": "rations",
    "name": "Rations",
    "ja": "保存食",
    "type": "consumable",
    "descriptionJa": "干し肉、乾燥果物、堅パン、木の実などをまとめた、旅先で食べやすい保存食。",
    "usageJa": "食事として消費し、旅の間の栄養を確保する。ゲームでは1日分ごとにquantityを1減らして管理する。",
    "price": {
      "sp": 5
    },
    "weight": 2,
    "properties": [
      "Travel-ready food"
    ]
  },
  "rope_hempen_50": {
    "id": "rope_hempen_50",
    "name": "Hempen Rope (50 ft.)",
    "ja": "麻のロープ 50フィート",
    "type": "gear",
    "descriptionJa": "既存IDを維持した50フィートの麻ロープ。登攀、固定、荷物の結束、拘束などに使える。",
    "usageJa": "Utilizeアクションで結び目を作る。SRDのRopeとして各種DCを適用し、足を縛った対象は脱出までRestrainedになり得る。",
    "price": {
      "gp": 1
    },
    "weight": 5,
    "properties": [
      "Tie a knot: DC 10 Dexterity (Sleight of Hand)",
      "Burst: DC 20 Strength (Athletics)",
      "Escape bindings: DC 15 Dexterity (Acrobatics)"
    ],
    "aliases": [
      "Hempen Rope",
      "Rope, Hempen (50 feet)"
    ]
  },
  "holy_symbol": {
    "id": "holy_symbol",
    "name": "Holy Symbol",
    "ja": "聖印",
    "type": "gear",
    "descriptionJa": "神格や信仰を示す印。首飾り、盾や布に掲げる紋章、聖遺物容器などの形を取る。",
    "usageJa": "ClericまたはPaladinがSpellcasting Focusとして使用する。装備・保持方法は選んだ形状に従う。",
    "price": {
      "gp": 5
    },
    "weight": 1,
    "properties": [
      "Spellcasting Focus for Cleric or Paladin",
      "Representative form: Amulet"
    ]
  },
  "greataxe": {
    "id": "greataxe",
    "name": "Greataxe",
    "ja": "グレートアックス",
    "type": "weapon",
    "descriptionJa": "大きな斧頭を長い柄に付けた両手武器。振り下ろしの一撃が重い。",
    "usageJa": "両手の近接攻撃で1d12斬撃ダメージ。Heavyの条件に注意し、武器習熟でCleaveを利用できる。",
    "price": {
      "gp": 30
    },
    "weight": 7,
    "damage": "1d12 Slashing",
    "properties": [
      "Heavy",
      "Two-Handed",
      "Mastery: Cleave"
    ]
  },
  "handaxe": {
    "id": "handaxe",
    "name": "Handaxe",
    "ja": "ハンドアックス",
    "type": "weapon",
    "descriptionJa": "片手で扱える小型の斧。近接攻撃にも投擲にも使える。",
    "usageJa": "近接または20/60フィートの投擲攻撃に使用。1d6斬撃ダメージ。Light武器で、武器習熟によりVexを利用できる。",
    "price": {
      "gp": 5
    },
    "weight": 2,
    "damage": "1d6 Slashing",
    "properties": [
      "Light",
      "Thrown (Range 20/60)",
      "Mastery: Vex"
    ]
  },
  "mace": {
    "id": "mace",
    "name": "Mace",
    "ja": "メイス",
    "type": "weapon",
    "descriptionJa": "金属製の重い頭部を柄に付けた打撃武器。鎧の上から衝撃を与える。",
    "usageJa": "片手の近接攻撃で1d6殴打ダメージ。武器習熟でSapを利用できる。",
    "price": {
      "gp": 5
    },
    "weight": 4,
    "damage": "1d6 Bludgeoning",
    "properties": [
      "Mastery: Sap"
    ]
  },
  "sickle": {
    "id": "sickle",
    "name": "Sickle",
    "ja": "シックル",
    "type": "weapon",
    "descriptionJa": "内側に刃のある湾曲した小型鎌。農具に近い形で、片手で素早く扱える。",
    "usageJa": "片手の近接攻撃で1d4斬撃ダメージ。Light武器で、武器習熟によりNickを利用できる。",
    "price": {
      "gp": 1
    },
    "weight": 2,
    "damage": "1d4 Slashing",
    "properties": [
      "Light",
      "Mastery: Nick"
    ]
  },
  "greatsword": {
    "id": "greatsword",
    "name": "Greatsword",
    "ja": "グレートソード",
    "type": "weapon",
    "descriptionJa": "長く幅広い刃を両手で振るう大型剣。安定して大きな斬撃を与える。",
    "usageJa": "両手の近接攻撃で2d6斬撃ダメージ。Heavyの条件に注意し、武器習熟でGrazeを利用できる。",
    "price": {
      "gp": 50
    },
    "weight": 6,
    "damage": "2d6 Slashing",
    "properties": [
      "Heavy",
      "Two-Handed",
      "Mastery: Graze"
    ]
  },
  "flail": {
    "id": "flail",
    "name": "Flail",
    "ja": "フレイル",
    "type": "weapon",
    "descriptionJa": "柄と打撃部を鎖でつないだ武器。振り回して重い打撃を与える。",
    "usageJa": "片手の近接攻撃で1d8殴打ダメージ。武器習熟でSapを利用できる。",
    "price": {
      "gp": 10
    },
    "weight": 2,
    "damage": "1d8 Bludgeoning",
    "properties": [
      "Mastery: Sap"
    ]
  },
  "scimitar": {
    "id": "scimitar",
    "name": "Scimitar",
    "ja": "シミター",
    "type": "weapon",
    "descriptionJa": "片刃で大きく湾曲した軽量の剣。滑らかな斬りつけと素早い連撃に向く。",
    "usageJa": "片手の近接攻撃で1d6斬撃ダメージ。FinesseとLightを持ち、武器習熟でNickを利用できる。",
    "price": {
      "gp": 25
    },
    "weight": 3,
    "damage": "1d6 Slashing",
    "properties": [
      "Finesse",
      "Light",
      "Mastery: Nick"
    ]
  },
  "shortsword": {
    "id": "shortsword",
    "name": "Shortsword",
    "ja": "ショートソード",
    "type": "weapon",
    "descriptionJa": "ロングソードより短く軽い片手剣。狭い場所でも扱いやすく、刺突に向く。",
    "usageJa": "片手の近接攻撃で1d6刺突ダメージ。FinesseとLightを持ち、武器習熟でVexを利用できる。",
    "price": {
      "gp": 10
    },
    "weight": 2,
    "damage": "1d6 Piercing",
    "properties": [
      "Finesse",
      "Light",
      "Mastery: Vex"
    ]
  },
  "longbow": {
    "id": "longbow",
    "name": "Longbow",
    "ja": "ロングボウ",
    "type": "weapon",
    "descriptionJa": "背丈に近い長い弓。両手で大きく引き、遠距離へ強い矢を放つ。",
    "usageJa": "矢を1本消費して150/600フィートの遠隔攻撃を行い、1d8刺突ダメージ。HeavyとTwo-Handedを持つ。",
    "price": {
      "gp": 50
    },
    "weight": 2,
    "damage": "1d8 Piercing",
    "properties": [
      "Ammunition (Range 150/600; Arrow)",
      "Heavy",
      "Two-Handed",
      "Mastery: Slow"
    ]
  },
  "spear": {
    "id": "spear",
    "name": "Spear",
    "ja": "スピア",
    "type": "weapon",
    "descriptionJa": "長い柄の先に穂先を付けた基本的な槍。片手・両手・投擲に対応する。",
    "usageJa": "近接では片手1d6、両手1d8の刺突ダメージ。20/60フィートへ投擲でき、武器習熟でSapを利用できる。",
    "price": {
      "gp": 1
    },
    "weight": 3,
    "damage": "1d6 Piercing",
    "properties": [
      "Thrown (Range 20/60)",
      "Versatile (1d8)",
      "Mastery: Sap"
    ]
  },
  "shortbow": {
    "id": "shortbow",
    "name": "Shortbow",
    "ja": "ショートボウ",
    "type": "weapon",
    "descriptionJa": "ロングボウより短く取り回しやすい弓。両手で矢をつがえて射る。",
    "usageJa": "矢を1本消費して80/320フィートの遠隔攻撃を行い、1d6刺突ダメージ。武器習熟でVexを利用できる。",
    "price": {
      "gp": 25
    },
    "weight": 2,
    "damage": "1d6 Piercing",
    "properties": [
      "Ammunition (Range 80/320; Arrow)",
      "Two-Handed",
      "Mastery: Vex"
    ]
  },
  "quarterstaff": {
    "id": "quarterstaff",
    "name": "Quarterstaff",
    "ja": "クォータースタッフ",
    "type": "weapon",
    "descriptionJa": "両端を使って戦える丈夫な長い杖。片手でも両手でも打撃に使える。",
    "usageJa": "近接では片手1d6、両手1d8の殴打ダメージ。武器習熟でToppleを利用できる。",
    "price": {
      "sp": 2
    },
    "weight": 4,
    "damage": "1d6 Bludgeoning",
    "properties": [
      "Versatile (1d8)",
      "Mastery: Topple"
    ]
  },
  "leather_armor": {
    "id": "leather_armor",
    "name": "Leather Armor",
    "ja": "レザー・アーマー",
    "type": "armor",
    "descriptionJa": "柔らかい革を加工した軽装鎧。動きを妨げにくく、胴体を中心に守る。",
    "usageJa": "装備中の基本ACは11＋敏捷力修正値。Light Armor Trainingが必要。",
    "price": {
      "gp": 10
    },
    "weight": 10,
    "ac": 11,
    "properties": [
      "Light Armor",
      "AC 11 + Dex modifier"
    ]
  },
  "chain_shirt": {
    "id": "chain_shirt",
    "name": "Chain Shirt",
    "ja": "チェイン・シャツ",
    "type": "armor",
    "descriptionJa": "衣服の下にも着込める、胴体中心の鎖かたびら。軽装と重装の中間にあたる。",
    "usageJa": "装備中の基本ACは13＋敏捷力修正値（最大+2）。Medium Armor Trainingが必要。",
    "price": {
      "gp": 50
    },
    "weight": 20,
    "ac": 13,
    "properties": [
      "Medium Armor",
      "AC 13 + Dex modifier (max 2)"
    ]
  },
  "studded_leather_armor": {
    "id": "studded_leather_armor",
    "name": "Studded Leather Armor",
    "ja": "スタデッド・レザー",
    "type": "armor",
    "descriptionJa": "革鎧を鋲や補強材で強化した軽装鎧。柔軟さを保ちながら防御力を高める。",
    "usageJa": "装備中の基本ACは12＋敏捷力修正値。Light Armor Trainingが必要。",
    "price": {
      "gp": 45
    },
    "weight": 13,
    "ac": 12,
    "properties": [
      "Light Armor",
      "AC 12 + Dex modifier"
    ]
  },
  "explorers_pack": {
    "id": "explorers_pack",
    "name": "Explorer’s Pack",
    "ja": "探検家のパック",
    "type": "pack",
    "descriptionJa": "野外の旅と野営に必要な基本用品をまとめた探検用パック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 10
    },
    "weight": 55,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Bedroll",
        "quantity": 1
      },
      {
        "name": "Oil (flask)",
        "quantity": 2
      },
      {
        "itemId": "rations",
        "name": "Rations",
        "quantity": 10
      },
      {
        "itemId": "rope_hempen_50",
        "name": "Rope",
        "quantity": 1
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      },
      {
        "itemId": "torch",
        "name": "Torch",
        "quantity": 10
      },
      {
        "name": "Waterskin",
        "quantity": 1
      }
    ],
    "aliases": [
      "Explorer's Pack"
    ]
  },
  "entertainers_pack": {
    "id": "entertainers_pack",
    "name": "Entertainer’s Pack",
    "ja": "芸人のパック",
    "type": "pack",
    "descriptionJa": "旅芸人が巡業、演奏、変装、野営を行うための道具をまとめたパック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 40
    },
    "weight": 58.5,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Bedroll",
        "quantity": 1
      },
      {
        "name": "Bell",
        "quantity": 1
      },
      {
        "name": "Bullseye Lantern",
        "quantity": 1
      },
      {
        "name": "Costume",
        "quantity": 3
      },
      {
        "name": "Mirror",
        "quantity": 1
      },
      {
        "name": "Oil (flask)",
        "quantity": 8
      },
      {
        "itemId": "rations",
        "name": "Rations",
        "quantity": 9
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      },
      {
        "name": "Waterskin",
        "quantity": 1
      }
    ],
    "aliases": [
      "Entertainer's Pack"
    ]
  },
  "priests_pack": {
    "id": "priests_pack",
    "name": "Priest’s Pack",
    "ja": "司祭のパック",
    "type": "pack",
    "descriptionJa": "礼拝、儀式、旅先での奉仕に必要な品をまとめた司祭向けパック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 33
    },
    "weight": 29,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Blanket",
        "quantity": 1
      },
      {
        "name": "Holy Water",
        "quantity": 1
      },
      {
        "name": "Lamp",
        "quantity": 1
      },
      {
        "itemId": "rations",
        "name": "Rations",
        "quantity": 7
      },
      {
        "itemId": "robe",
        "name": "Robe",
        "quantity": 1
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      }
    ],
    "aliases": [
      "Priest's Pack"
    ]
  },
  "dungeoneers_pack": {
    "id": "dungeoneers_pack",
    "name": "Dungeoneer’s Pack",
    "ja": "地下探検家のパック",
    "type": "pack",
    "descriptionJa": "暗い地下、閉ざされた扉、罠のある通路を探索するための実用品をまとめたパック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 12
    },
    "weight": 55,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Caltrops",
        "quantity": 1
      },
      {
        "itemId": "crowbar",
        "name": "Crowbar",
        "quantity": 1
      },
      {
        "name": "Oil (flask)",
        "quantity": 2
      },
      {
        "itemId": "rations",
        "name": "Rations",
        "quantity": 10
      },
      {
        "itemId": "rope_hempen_50",
        "name": "Rope",
        "quantity": 1
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      },
      {
        "itemId": "torch",
        "name": "Torch",
        "quantity": 10
      },
      {
        "name": "Waterskin",
        "quantity": 1
      }
    ],
    "aliases": [
      "Dungeoneer's Pack"
    ]
  },
  "burglars_pack": {
    "id": "burglars_pack",
    "name": "Burglar’s Pack",
    "ja": "盗賊のパック",
    "type": "pack",
    "descriptionJa": "潜入、警戒、逃走、暗所作業に使う小道具をまとめた盗賊向けパック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 16
    },
    "weight": 42,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Ball Bearings",
        "quantity": 1
      },
      {
        "name": "Bell",
        "quantity": 1
      },
      {
        "name": "Candle",
        "quantity": 10
      },
      {
        "itemId": "crowbar",
        "name": "Crowbar",
        "quantity": 1
      },
      {
        "name": "Hooded Lantern",
        "quantity": 1
      },
      {
        "name": "Oil (flask)",
        "quantity": 7
      },
      {
        "itemId": "rations",
        "name": "Rations",
        "quantity": 5
      },
      {
        "itemId": "rope_hempen_50",
        "name": "Rope",
        "quantity": 1
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      },
      {
        "name": "Waterskin",
        "quantity": 1
      }
    ],
    "aliases": [
      "Burglar's Pack"
    ]
  },
  "scholars_pack": {
    "id": "scholars_pack",
    "name": "Scholar’s Pack",
    "ja": "学者のパック",
    "type": "pack",
    "descriptionJa": "調査、読書、記録、写本作業に必要な文具と照明をまとめた学者向けパック。",
    "usageJa": "入手時は1つのパックとして保持できる。中の品を使う段階でcontentsJSONに従って個別アイテムへ展開する。",
    "price": {
      "gp": 40
    },
    "weight": 22,
    "properties": [
      "Equipment Pack"
    ],
    "contents": [
      {
        "name": "Backpack",
        "quantity": 1
      },
      {
        "name": "Book",
        "quantity": 1
      },
      {
        "name": "Ink",
        "quantity": 1
      },
      {
        "name": "Ink Pen",
        "quantity": 1
      },
      {
        "name": "Lamp",
        "quantity": 1
      },
      {
        "name": "Oil (flask)",
        "quantity": 10
      },
      {
        "itemId": "parchment",
        "name": "Parchment (sheet)",
        "quantity": 10
      },
      {
        "name": "Tinderbox",
        "quantity": 1
      }
    ],
    "aliases": [
      "Scholar's Pack"
    ]
  },
  "quiver": {
    "id": "quiver",
    "name": "Quiver",
    "ja": "矢筒",
    "type": "gear",
    "descriptionJa": "矢をまとめて携帯し、素早く取り出すための細長い容器。背や腰に装着する。",
    "usageJa": "最大20本のArrowを収納する。LongbowやShortbowを使うキャラクターの弾薬容器として装備する。",
    "price": {
      "gp": 1
    },
    "weight": 1,
    "properties": [
      "Capacity: 20 Arrows"
    ]
  },
  "druidic_focus_quarterstaff": {
    "id": "druidic_focus_quarterstaff",
    "name": "Druidic Focus (Quarterstaff)",
    "ja": "ドルイド用焦点具（クォータースタッフ）",
    "type": "weapon",
    "descriptionJa": "自然の印を刻んだ木製の長杖。ドルイド用焦点具であり、クォータースタッフとしても戦える。",
    "usageJa": "DruidまたはRangerのSpellcasting Focusとして使用。武器としては片手1d6、両手1d8の殴打ダメージ。",
    "price": {
      "gp": 5
    },
    "weight": 4,
    "damage": "1d6 Bludgeoning",
    "properties": [
      "Spellcasting Focus for Druid or Ranger",
      "Versatile (1d8)",
      "Mastery: Topple"
    ]
  },
  "druidic_focus_mistletoe": {
    "id": "druidic_focus_mistletoe",
    "name": "Druidic Focus (sprig of mistletoe)",
    "ja": "ドルイド用焦点具（ヤドリギの小枝）",
    "type": "gear",
    "descriptionJa": "リボンや印で整えたヤドリギの小枝。自然魔法を導く小型の焦点具。",
    "usageJa": "DruidまたはRangerがSpellcasting Focusとして保持または取り出して使用する。",
    "price": {
      "gp": 1
    },
    "weight": 0,
    "properties": [
      "Spellcasting Focus for Druid or Ranger"
    ]
  },
  "arcane_focus_crystal": {
    "id": "arcane_focus_crystal",
    "name": "Arcane Focus (crystal)",
    "ja": "秘術焦点具（クリスタル）",
    "type": "gear",
    "descriptionJa": "魔力を導くために磨かれた結晶。手に持って秘術呪文の焦点とする。",
    "usageJa": "Sorcerer、Warlock、WizardがSpellcasting Focusとして使用する。",
    "price": {
      "gp": 10
    },
    "weight": 1,
    "properties": [
      "Spellcasting Focus for Sorcerer, Warlock, or Wizard"
    ]
  },
  "arcane_focus_orb": {
    "id": "arcane_focus_orb",
    "name": "Arcane Focus (orb)",
    "ja": "秘術焦点具（オーブ）",
    "type": "gear",
    "descriptionJa": "両手または片手で扱う球形の秘術焦点具。表面や内部に魔法的な意匠を持つ。",
    "usageJa": "Sorcerer、Warlock、WizardがSpellcasting Focusとして使用する。",
    "price": {
      "gp": 20
    },
    "weight": 3,
    "properties": [
      "Spellcasting Focus for Sorcerer, Warlock, or Wizard"
    ]
  },
  "arcane_focus_quarterstaff": {
    "id": "arcane_focus_quarterstaff",
    "name": "Arcane Focus (Quarterstaff)",
    "ja": "秘術焦点具（クォータースタッフ）",
    "type": "weapon",
    "descriptionJa": "宝石や彫刻で魔力の経路を作った秘術の長杖。焦点具とクォータースタッフを兼ねる。",
    "usageJa": "秘術Spellcasting Focusとして使用。武器としては片手1d6、両手1d8の殴打ダメージ。",
    "price": {
      "gp": 5
    },
    "weight": 4,
    "damage": "1d6 Bludgeoning",
    "properties": [
      "Spellcasting Focus for Sorcerer, Warlock, or Wizard",
      "Versatile (1d8)",
      "Mastery: Topple"
    ]
  },
  "herbalism_kit": {
    "id": "herbalism_kit",
    "name": "Herbalism Kit",
    "ja": "薬草師道具",
    "type": "tool",
    "descriptionJa": "植物の採取、乾燥、調合に使う小刀、乳鉢、袋、瓶などをまとめた薬草師道具。",
    "usageJa": "植物の識別（DC 10）。Antitoxin、Candle、Healer’s Kit、Potion of Healingの作成に使える。",
    "price": {
      "gp": 5
    },
    "weight": 3,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "thieves_tools": {
    "id": "thieves_tools",
    "name": "Thieves’ Tools",
    "ja": "盗賊道具",
    "type": "tool",
    "descriptionJa": "細いピック、やすり、小鏡、細身のはさみ、ペンチなど、錠前と罠を扱う精密工具。",
    "usageJa": "錠前を開ける（DC 15）、または罠を解除する（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 25
    },
    "weight": 1,
    "properties": [
      "Ability: Dexterity"
    ],
    "aliases": [
      "Thieves' Tools"
    ]
  },
  "healers_kit": {
    "id": "healers_kit",
    "name": "Healer’s Kit",
    "ja": "治療用具",
    "type": "gear",
    "descriptionJa": "包帯、軟膏、添え木などをまとめた応急手当用の携帯セット。10回分の使用量を持つ。",
    "usageJa": "Utilizeアクションで1回分を消費し、0 HPでUnconsciousのクリーチャーをMedicine判定なしで安定化する。",
    "price": {
      "gp": 5
    },
    "weight": 3,
    "properties": [
      "10 uses",
      "Stabilize at 0 HP without Wisdom (Medicine) check"
    ],
    "aliases": [
      "Healer's Kit"
    ]
  },
  "calligraphers_supplies": {
    "id": "calligraphers_supplies",
    "name": "Calligrapher’s Supplies",
    "ja": "筆写用具",
    "type": "tool",
    "descriptionJa": "上質なペン、インク、定規、紙押さえなど、美しく正確な文字を書くための用具。",
    "usageJa": "偽造を防ぐ装飾的な文字を書く（DC 15）。InkやSpell Scrollの作成に使える。",
    "price": {
      "gp": 10
    },
    "weight": 5,
    "properties": [
      "Ability: Dexterity"
    ],
    "aliases": [
      "Calligrapher's Supplies"
    ]
  },
  "musical_instrument": {
    "id": "musical_instrument",
    "name": "Musical Instrument",
    "ja": "楽器",
    "type": "tool",
    "descriptionJa": "キャラクター作成時に、具体的な楽器を1種類選ぶための選択用データ。物理的な単一アイテムではない。",
    "usageJa": "取得時にBagpipes、Drum、Fluteなど具体的なinstrument IDへ置き換える。",
    "weight": 2,
    "properties": [
      "Character-creation choice placeholder",
      "Ability: Charisma"
    ],
    "aliases": [
      "Musical Instrument（1つ選択）"
    ]
  },
  "artisan_tools_or_musical_instrument": {
    "id": "artisan_tools_or_musical_instrument",
    "name": "Artisan’s Tools or Musical Instrument",
    "ja": "職人道具または楽器",
    "type": "tool",
    "descriptionJa": "職人道具1種類または楽器1種類を選ぶまで保持する、キャラクター作成用の選択データ。",
    "usageJa": "取得時に選択肢を表示し、具体的なtoolまたはinstrument IDへ置き換える。",
    "weight": 5,
    "properties": [
      "Character-creation choice placeholder"
    ],
    "aliases": [
      "Artisan's Tools or Musical Instrument",
      "Artisan’s Tools または Musical Instrument（1つ選択）"
    ]
  },
  "gaming_set": {
    "id": "gaming_set",
    "name": "Gaming Set",
    "ja": "ゲーム道具",
    "type": "tool",
    "descriptionJa": "ダイス、ドラゴンチェス、トランプなど、具体的なゲーム道具を1種類選ぶための選択用データ。",
    "usageJa": "取得時に具体的なgaming-set IDへ置き換える。不正看破DC 10、勝利DC 20の基本用途を参照する。",
    "weight": 0,
    "properties": [
      "Character-creation choice placeholder",
      "Ability: Wisdom"
    ],
    "aliases": [
      "Gaming Set（1種類選択）"
    ]
  },
  "book_occult_lore": {
    "id": "book_occult_lore",
    "name": "Book (occult lore)",
    "ja": "書物（オカルト知識）",
    "type": "book",
    "descriptionJa": "魔物、秘術、禁忌の伝承などを扱う研究書。図版や注釈を含む重い本。",
    "usageJa": "内容が正確ならArcanaやReligionなど、オカルト分野の調査を助ける資料として使う。",
    "price": {
      "gp": 25
    },
    "weight": 5,
    "properties": [
      "Accurate nonfiction reference: +5 to relevant Intelligence check"
    ]
  },
  "book_prayers": {
    "id": "book_prayers",
    "name": "Book (prayers)",
    "ja": "書物（祈祷書）",
    "type": "book",
    "descriptionJa": "祈り、典礼、聖人伝、宗派の教えなどをまとめた祈祷書。",
    "usageJa": "内容が正確ならReligionなど、信仰や儀式に関する調査を助ける資料として使う。",
    "price": {
      "gp": 25
    },
    "weight": 5,
    "properties": [
      "Accurate nonfiction reference: +5 to relevant Intelligence check"
    ]
  },
  "book_history": {
    "id": "book_history",
    "name": "Book (history)",
    "ja": "書物（歴史）",
    "type": "book",
    "descriptionJa": "年代、人物、戦争、国や地域の出来事を記録した歴史書。",
    "usageJa": "内容が正確ならHistoryなど、対象時代や地域の調査を助ける資料として使う。",
    "price": {
      "gp": 25
    },
    "weight": 5,
    "properties": [
      "Accurate nonfiction reference: +5 to relevant Intelligence check"
    ]
  },
  "spellbook": {
    "id": "spellbook",
    "name": "Spellbook",
    "ja": "呪文書",
    "type": "book",
    "descriptionJa": "ウィザードが呪文の式、注釈、研究結果を書き込む固有の書物。外見と素材は所有者ごとに異なる。",
    "usageJa": "習得したレベル1以上のWizard呪文を記録し、準備や儀式発動の参照に使う。WizardはSpellcasting Focusとしても使用できる。",
    "weight": 3,
    "properties": [
      "Tiny object",
      "100 pages",
      "Readable by owner or with Identify",
      "Wizard Spellcasting Focus"
    ]
  },
  "robe": {
    "id": "robe",
    "name": "Robe",
    "ja": "ローブ",
    "type": "clothing",
    "descriptionJa": "職業、宗派、儀式上の身分を示すゆったりした衣服。色や紋章で所属を表す。",
    "usageJa": "着用して儀式や公式の場に参加し、特定の色・印が入場条件や身分証明になる場面で使う。",
    "price": {
      "gp": 1
    },
    "weight": 4,
    "properties": [
      "Vocational or ceremonial clothing"
    ]
  },
  "parchment": {
    "id": "parchment",
    "name": "Parchment",
    "ja": "羊皮紙",
    "type": "gear",
    "descriptionJa": "筆記用に加工した羊皮紙1枚。紙より丈夫で、手紙、契約書、地図、記録に使う。",
    "usageJa": "InkとInk Penなどを使って約250語を手書きできる。1枚単位で消費・所持数を管理する。",
    "price": {
      "sp": 1
    },
    "weight": 0,
    "properties": [
      "One sheet holds about 250 handwritten words"
    ]
  },
  "crowbar": {
    "id": "crowbar",
    "name": "Crowbar",
    "ja": "バール",
    "type": "gear",
    "descriptionJa": "曲がった金属棒のてこ道具。蓋、扉、板材などの隙間へ差し込んでこじ開ける。",
    "usageJa": "てこの力を利用できるStrength判定でAdvantageを得る。箱、扉、障害物のこじ開けに使う。",
    "price": {
      "gp": 2
    },
    "weight": 5,
    "properties": [
      "Advantage on Strength checks where leverage applies"
    ]
  },
  "pouch": {
    "id": "pouch",
    "name": "Pouch",
    "ja": "ポーチ",
    "type": "gear",
    "descriptionJa": "腰帯などに付ける小型の袋。硬貨、触媒、小道具などをまとめて携帯する。",
    "usageJa": "最大6 lb、容積1/5立方フィートまで収納する。中身を別アイテムとして管理できる。",
    "price": {
      "sp": 5
    },
    "weight": 1,
    "properties": [
      "Capacity: 6 lb within 1/5 cubic foot"
    ]
  },
  "travelers_clothes": {
    "id": "travelers_clothes",
    "name": "Traveler’s Clothes",
    "ja": "旅人の服",
    "type": "clothing",
    "descriptionJa": "さまざまな環境での旅に耐える丈夫な衣服。重ね着や補修を前提にした実用品。",
    "usageJa": "普段着や旅装として着用し、天候や長距離移動に適した服装を整える。",
    "price": {
      "gp": 2
    },
    "weight": 4,
    "properties": [
      "Resilient travel garments"
    ],
    "aliases": [
      "Traveler's Clothes"
    ]
  },
  "bagpipes": {
    "id": "bagpipes",
    "name": "Bagpipes",
    "ja": "バグパイプ",
    "type": "tool",
    "descriptionJa": "袋へ溜めた空気を複数の管へ送り、持続する大きな音を出す吹奏楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 30
    },
    "weight": 6,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "drum": {
    "id": "drum",
    "name": "Drum",
    "ja": "太鼓",
    "type": "tool",
    "descriptionJa": "張った皮や膜を手やばちで打ち、明確なリズムを作る打楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 6
    },
    "weight": 3,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "dulcimer": {
    "id": "dulcimer",
    "name": "Dulcimer",
    "ja": "ダルシマー",
    "type": "tool",
    "descriptionJa": "台形の共鳴箱に張った弦を小槌で打つ、または指ではじく弦楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 25
    },
    "weight": 10,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "flute": {
    "id": "flute",
    "name": "Flute",
    "ja": "フルート",
    "type": "tool",
    "descriptionJa": "細い管へ息を吹き込み、穴を指で開閉して旋律を奏でる軽い管楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 2
    },
    "weight": 1,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "horn": {
    "id": "horn",
    "name": "Horn",
    "ja": "角笛",
    "type": "tool",
    "descriptionJa": "動物の角や金属で作った、遠くまで響く単純な吹奏楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 3
    },
    "weight": 2,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "lute": {
    "id": "lute",
    "name": "Lute",
    "ja": "リュート",
    "type": "tool",
    "descriptionJa": "丸みのある胴と棹を持ち、弦を指ではじいて奏でる楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 35
    },
    "weight": 2,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "lyre": {
    "id": "lyre",
    "name": "Lyre",
    "ja": "ライアー",
    "type": "tool",
    "descriptionJa": "枠の間に張った弦を指ではじく、小型で象徴的な弦楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 30
    },
    "weight": 2,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "pan_flute": {
    "id": "pan_flute",
    "name": "Pan Flute",
    "ja": "パン・フルート",
    "type": "tool",
    "descriptionJa": "長さの異なる複数の管を並べ、吹く管を変えて音程を作る笛。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 12
    },
    "weight": 2,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "shawm": {
    "id": "shawm",
    "name": "Shawm",
    "ja": "ショーム",
    "type": "tool",
    "descriptionJa": "ダブルリードを使い、鋭くよく通る音を出す木管楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 2
    },
    "weight": 1,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "viol": {
    "id": "viol",
    "name": "Viol",
    "ja": "ヴィオール",
    "type": "tool",
    "descriptionJa": "弓で弦をこすって奏でる、柔らかな音色の弦楽器。",
    "usageJa": "既知の曲を演奏する（DC 10）、または即興で曲を作る（DC 15）Utilize判定に使う。",
    "price": {
      "gp": 30
    },
    "weight": 1,
    "properties": [
      "Ability: Charisma",
      "Musical Instrument"
    ]
  },
  "alchemists_supplies": {
    "id": "alchemists_supplies",
    "name": "Alchemist's Supplies",
    "ja": "錬金術用品",
    "type": "tool",
    "descriptionJa": "小瓶、乳鉢、炉、薬品、攪拌器など、物質を調べて反応させるための錬金術用品。",
    "usageJa": "物質を識別（DC 15）または火を起こす（DC 15）。酸、錬金術師の火、油、紙、香水などを作成できる。",
    "price": {
      "gp": 50
    },
    "weight": 8,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "brewers_supplies": {
    "id": "brewers_supplies",
    "name": "Brewer's Supplies",
    "ja": "醸造用品",
    "type": "tool",
    "descriptionJa": "発酵容器、濾し器、管、香味素材など、飲料を仕込み状態を調べる醸造用品。",
    "usageJa": "毒入りの飲み物を検出（DC 15）または酒を識別（DC 10）。Antitoxinを作成できる。",
    "price": {
      "gp": 20
    },
    "weight": 9,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "carpenters_tools": {
    "id": "carpenters_tools",
    "name": "Carpenter's Tools",
    "ja": "大工道具",
    "type": "tool",
    "descriptionJa": "のこぎり、金槌、鉋、釘抜きなど、木材を切り組み立てるための大工道具。",
    "usageJa": "扉や容器を封鎖またはこじ開ける（DC 20）。木製武器、箱、梯子、松明などを作成できる。",
    "price": {
      "gp": 8
    },
    "weight": 6,
    "properties": [
      "Ability: Strength"
    ]
  },
  "cartographers_tools": {
    "id": "cartographers_tools",
    "name": "Cartographer's Tools",
    "ja": "地図作成用具",
    "type": "tool",
    "descriptionJa": "方位磁針、定規、コンパス、筆記具など、地形を測り地図へまとめる用具。",
    "usageJa": "小さな地域の地図を作成する（DC 15）。Mapを作成できる。",
    "price": {
      "gp": 15
    },
    "weight": 6,
    "properties": [
      "Ability: Wisdom"
    ]
  },
  "cobblers_tools": {
    "id": "cobblers_tools",
    "name": "Cobbler's Tools",
    "ja": "靴職人道具",
    "type": "tool",
    "descriptionJa": "靴型、錐、糸、革包丁など、履物を作り調整するための靴職人道具。",
    "usageJa": "履物を調整し、着用者の次のDexterity (Acrobatics)判定にAdvantageを与える（DC 10）。Climber’s Kitを作成できる。",
    "price": {
      "gp": 5
    },
    "weight": 5,
    "properties": [
      "Ability: Dexterity"
    ]
  },
  "cooks_utensils": {
    "id": "cooks_utensils",
    "name": "Cook's Utensils",
    "ja": "調理用具",
    "type": "tool",
    "descriptionJa": "鍋、包丁、柄杓、香辛料入れなど、旅先でも調理するための一式。",
    "usageJa": "料理の味を改善（DC 10）または腐敗・毒を検出（DC 15）。Rationsを作成できる。",
    "price": {
      "gp": 1
    },
    "weight": 8,
    "properties": [
      "Ability: Wisdom"
    ]
  },
  "glassblowers_tools": {
    "id": "glassblowers_tools",
    "name": "Glassblower's Tools",
    "ja": "ガラス職人道具",
    "type": "tool",
    "descriptionJa": "吹き竿、火ばさみ、型、切断具など、熱したガラスを成形するための道具。",
    "usageJa": "ガラス容器が過去24時間に保持していた物を見分ける（DC 15）。瓶、虫眼鏡、望遠鏡、Vialを作成できる。",
    "price": {
      "gp": 30
    },
    "weight": 5,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "jewelers_tools": {
    "id": "jewelers_tools",
    "name": "Jeweler's Tools",
    "ja": "宝石細工道具",
    "type": "tool",
    "descriptionJa": "ルーペ、細いやすり、ピンセット、研磨具など、宝石と小型金属を加工する道具。",
    "usageJa": "宝石の価値を見分ける（DC 15）。Arcane FocusとHoly Symbolを作成できる。",
    "price": {
      "gp": 25
    },
    "weight": 2,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "leatherworkers_tools": {
    "id": "leatherworkers_tools",
    "name": "Leatherworker's Tools",
    "ja": "革細工道具",
    "type": "tool",
    "descriptionJa": "革包丁、錐、針、糸、染料など、革を裁断し縫い合わせるための道具。",
    "usageJa": "革製品に意匠を加える（DC 10）。革鎧、鞄、矢筒、羊皮紙などを作成できる。",
    "price": {
      "gp": 5
    },
    "weight": 5,
    "properties": [
      "Ability: Dexterity"
    ]
  },
  "masons_tools": {
    "id": "masons_tools",
    "name": "Mason's Tools",
    "ja": "石工道具",
    "type": "tool",
    "descriptionJa": "たがね、石工鎚、こて、測定具など、石材を加工し積むための道具。",
    "usageJa": "石に記号や穴を刻む（DC 10）。Block and Tackleを作成できる。",
    "price": {
      "gp": 10
    },
    "weight": 8,
    "properties": [
      "Ability: Strength"
    ]
  },
  "painters_supplies": {
    "id": "painters_supplies",
    "name": "Painter's Supplies",
    "ja": "画材",
    "type": "tool",
    "descriptionJa": "顔料、筆、木炭、布、混色皿など、絵や印を描くための画材一式。",
    "usageJa": "見たものを判別できる絵として描く（DC 10）。Druidic FocusやHoly Symbolを作成できる。",
    "price": {
      "gp": 10
    },
    "weight": 5,
    "properties": [
      "Ability: Wisdom"
    ]
  },
  "potters_tools": {
    "id": "potters_tools",
    "name": "Potter's Tools",
    "ja": "陶工道具",
    "type": "tool",
    "descriptionJa": "ろくろ、へら、切り糸、釉薬など、粘土を成形して焼くための陶工道具。",
    "usageJa": "陶器が過去24時間に保持していた物を見分ける（DC 15）。JugやLampを作成できる。",
    "price": {
      "gp": 10
    },
    "weight": 3,
    "properties": [
      "Ability: Intelligence"
    ]
  },
  "smiths_tools": {
    "id": "smiths_tools",
    "name": "Smith's Tools",
    "ja": "鍛冶道具",
    "type": "tool",
    "descriptionJa": "金槌、火ばさみ、やすり、ふいご用具など、加熱した金属を加工する鍛冶道具。",
    "usageJa": "扉や容器をこじ開ける（DC 20）。多くの近接武器、中・重装鎧、金属製冒険道具を作成できる。",
    "price": {
      "gp": 20
    },
    "weight": 8,
    "properties": [
      "Ability: Strength"
    ]
  },
  "tinkers_tools": {
    "id": "tinkers_tools",
    "name": "Tinker's Tools",
    "ja": "鋳掛屋道具",
    "type": "tool",
    "descriptionJa": "小型金槌、ペンチ、針金、ねじ、端材など、細かな機構を組み直す鋳掛屋道具。",
    "usageJa": "端材から1分で崩れるTiny物体を組み立てる（DC 20）。ランタン、罠、錠、銃器などを作成できる。",
    "price": {
      "gp": 50
    },
    "weight": 10,
    "properties": [
      "Ability: Dexterity"
    ]
  },
  "weavers_tools": {
    "id": "weavers_tools",
    "name": "Weaver's Tools",
    "ja": "織工道具",
    "type": "tool",
    "descriptionJa": "針、糸、はさみ、杼、小型枠など、布や紐を織り縫うための道具。",
    "usageJa": "衣服の裂けを直す（DC 10）またはTinyな意匠を縫う（DC 10）。衣服、ロープ、テントなどを作成できる。",
    "price": {
      "gp": 1
    },
    "weight": 5,
    "properties": [
      "Ability: Dexterity"
    ]
  },
  "woodcarvers_tools": {
    "id": "woodcarvers_tools",
    "name": "Woodcarver's Tools",
    "ja": "木彫道具",
    "type": "tool",
    "descriptionJa": "小刀、のみ、丸のみ、砥石など、木材へ細かな形や模様を彫る道具。",
    "usageJa": "木に模様を彫る（DC 10）。木製武器、遠隔武器、矢、焦点具、ペン、針を作成できる。",
    "price": {
      "gp": 1
    },
    "weight": 5,
    "properties": [
      "Ability: Dexterity"
    ]
  },
  "dice_set": {
    "id": "dice_set",
    "name": "Dice Set",
    "ja": "ダイス一式",
    "type": "tool",
    "descriptionJa": "複数のダイスと小袋からなるゲーム一式。運と読み合いを使う賭け事や遊戯に使う。",
    "usageJa": "不正を見抜く（DC 10）、またはゲームに勝つ（DC 20）Utilize判定に使う。",
    "price": {
      "sp": 1
    },
    "weight": 0,
    "properties": [
      "Ability: Wisdom",
      "Gaming Set"
    ],
    "aliases": [
      "Gaming Set: Dice Set"
    ]
  },
  "dragonchess_set": {
    "id": "dragonchess_set",
    "name": "Dragonchess Set",
    "ja": "ドラゴンチェス一式",
    "type": "tool",
    "descriptionJa": "多層の盤と駒を使う複雑な戦略ゲーム一式。先読みと盤面把握が重要。",
    "usageJa": "不正を見抜く（DC 10）、またはゲームに勝つ（DC 20）Utilize判定に使う。",
    "price": {
      "gp": 1
    },
    "weight": 0,
    "properties": [
      "Ability: Wisdom",
      "Gaming Set"
    ],
    "aliases": [
      "Gaming Set: Dragonchess Set"
    ]
  },
  "playing_card_set": {
    "id": "playing_card_set",
    "name": "Playing Card Set",
    "ja": "トランプ一式",
    "type": "tool",
    "descriptionJa": "札を組み合わせて遊ぶ携帯しやすいカード一式。多様なルールのゲームに使える。",
    "usageJa": "不正を見抜く（DC 10）、またはゲームに勝つ（DC 20）Utilize判定に使う。",
    "price": {
      "sp": 5
    },
    "weight": 0,
    "properties": [
      "Ability: Wisdom",
      "Gaming Set"
    ],
    "aliases": [
      "Gaming Set: Playing Card Set"
    ]
  },
  "three_dragon_ante_set": {
    "id": "three_dragon_ante_set",
    "name": "Three-Dragon Ante Set",
    "ja": "スリー・ドラゴン・アンティ一式",
    "type": "tool",
    "descriptionJa": "ドラゴンを題材にした札で駆け引きを行う、幻想世界のカードゲーム一式。",
    "usageJa": "不正を見抜く（DC 10）、またはゲームに勝つ（DC 20）Utilize判定に使う。",
    "price": {
      "gp": 1
    },
    "weight": 0,
    "properties": [
      "Ability: Wisdom",
      "Gaming Set"
    ],
    "aliases": [
      "Gaming Set: Three-Dragon Ante Set"
    ]
  }
};

window.DD_ITEM_ALIASES = (() => {
  const normalize = value => String(value ?? '')
    .normalize('NFKC')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const aliases = {};
  Object.values(window.DD_ITEMS).forEach(item => {
    [item.id, item.name, ...(item.aliases || [])].forEach(value => {
      aliases[normalize(value)] = item.id;
    });
  });
  return aliases;
})();
