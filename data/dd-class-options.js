/*
 * Level 1 class-choice data based on System Reference Document 5.2.1.
 * This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1")
 * by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
 * The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
 * available at https://creativecommons.org/licenses/by/4.0/legalcode.
 */
window.DD_CLASS_OPTIONS = (() => {
  const instruments = ['Bagpipes','Drum','Dulcimer','Flute','Horn','Lute','Lyre','Pan Flute','Shawm','Viol'];
  const artisanTools = [
    "Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools",
    "Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools",
    "Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools",
    "Tinker's Tools","Weaver's Tools","Woodcarver's Tools"
  ];
  const monkTools = [...artisanTools, ...instruments];

  const simpleMelee = ['Club','Dagger','Greatclub','Handaxe','Javelin','Light Hammer','Mace','Quarterstaff','Sickle','Spear'];
  const simpleRanged = ['Dart','Light Crossbow','Shortbow','Sling'];
  const martialMelee = ['Battleaxe','Flail','Glaive','Greataxe','Greatsword','Halberd','Lance','Longsword','Maul','Morningstar','Pike','Rapier','Scimitar','Shortsword','Trident','War Pick','Warhammer','Whip'];
  const martialRanged = ['Blowgun','Hand Crossbow','Heavy Crossbow','Longbow','Musket','Pistol'];
  const allWeapons = [...simpleMelee, ...simpleRanged, ...martialMelee, ...martialRanged];
  const barbarianWeapons = [...simpleMelee, ...martialMelee];
  const rogueWeapons = [...simpleMelee, ...simpleRanged, 'Rapier','Scimitar','Shortsword','Whip'];

  const standardLanguages = ['Common Sign Language','Draconic','Dwarvish','Elvish','Giant','Gnomish','Goblin','Halfling','Orc'];
  const rareLanguages = ['Abyssal','Celestial','Deep Speech','Druidic','Infernal','Primordial','Sylvan','Undercommon'];
  const rogueLanguages = [...standardLanguages, ...rareLanguages];

  const spells = {
    Bard: {
      cantrips:['Dancing Lights','Light','Mage Hand','Mending','Message','Minor Illusion','Prestidigitation','Starry Wisp','True Strike','Vicious Mockery'],
      level1:['Animal Friendship','Bane','Charm Person','Color Spray','Command','Comprehend Languages','Cure Wounds','Detect Magic','Disguise Self','Dissonant Whispers','Faerie Fire','Feather Fall','Healing Word','Heroism','Hideous Laughter','Identify','Illusory Script','Longstrider','Silent Image','Sleep','Speak with Animals','Thunderwave','Unseen Servant']
    },
    Cleric: {
      cantrips:['Guidance','Light','Mending','Resistance','Sacred Flame','Spare the Dying','Thaumaturgy'],
      level1:['Bane','Bless','Command','Create or Destroy Water','Cure Wounds','Detect Evil and Good','Detect Magic','Detect Poison and Disease','Guiding Bolt','Healing Word','Inflict Wounds','Protection from Evil and Good','Purify Food and Drink','Sanctuary','Shield of Faith']
    },
    Druid: {
      cantrips:['Druidcraft','Elementalism','Guidance','Mending','Message','Poison Spray','Produce Flame','Resistance','Shillelagh','Spare the Dying','Starry Wisp'],
      level1:['Animal Friendship','Charm Person','Create or Destroy Water','Cure Wounds','Detect Magic','Detect Poison and Disease','Entangle','Faerie Fire','Fog Cloud','Goodberry','Healing Word','Ice Knife','Jump','Longstrider','Protection from Evil and Good','Purify Food and Drink','Speak with Animals','Thunderwave']
    },
    Paladin: {
      level1:['Bless','Command','Cure Wounds','Detect Evil and Good','Detect Magic','Detect Poison and Disease','Divine Favor','Divine Smite','Heroism','Protection from Evil and Good','Purify Food and Drink','Searing Smite','Shield of Faith']
    },
    Ranger: {
      level1:['Alarm','Animal Friendship','Cure Wounds','Detect Magic','Detect Poison and Disease','Ensnaring Strike','Entangle','Fog Cloud','Goodberry',"Hunter's Mark",'Jump','Longstrider','Speak with Animals']
    },
    Sorcerer: {
      cantrips:['Acid Splash','Chill Touch','Dancing Lights','Elementalism','Fire Bolt','Light','Mage Hand','Mending','Message','Minor Illusion','Poison Spray','Prestidigitation','Ray of Frost','Shocking Grasp','Sorcerous Burst','True Strike'],
      level1:['Burning Hands','Charm Person','Chromatic Orb','Color Spray','Comprehend Languages','Detect Magic','Disguise Self','Expeditious Retreat','False Life','Feather Fall','Fog Cloud','Grease','Ice Knife','Jump','Mage Armor','Magic Missile','Ray of Sickness','Shield','Silent Image','Sleep','Thunderwave']
    },
    Warlock: {
      cantrips:['Chill Touch','Eldritch Blast','Mage Hand','Minor Illusion','Poison Spray','Prestidigitation','True Strike'],
      level1:['Bane','Charm Person','Comprehend Languages','Detect Magic','Expeditious Retreat','Hellish Rebuke','Hex','Hideous Laughter','Illusory Script','Protection from Evil and Good','Speak with Animals','Unseen Servant']
    },
    Wizard: {
      cantrips:['Acid Splash','Chill Touch','Dancing Lights','Elementalism','Fire Bolt','Light','Mage Hand','Mending','Message','Minor Illusion','Poison Spray','Prestidigitation','Ray of Frost','Shocking Grasp','True Strike'],
      level1:['Alarm','Burning Hands','Charm Person','Chromatic Orb','Color Spray','Comprehend Languages','Detect Magic','Disguise Self','Expeditious Retreat','False Life','Feather Fall','Find Familiar','Floating Disk','Fog Cloud','Grease','Hideous Laughter','Ice Knife','Identify','Illusory Script','Jump','Longstrider','Mage Armor','Magic Missile','Protection from Evil and Good','Ray of Sickness','Shield','Silent Image','Sleep','Thunderwave','Unseen Servant']
    }
  };

  const classes = {
    Barbarian: {
      ja:'バーバリアン', automatic:['Rage','Unarmored Defense'],
      groups:[
        {id:'weaponMastery',title:'Weapon Mastery',type:'multi',count:2,options:barbarianWeapons,recommended:['Greataxe','Handaxe'],note:'Simple または Martial の近接武器から2種類。'}
      ]
    },
    Bard: {
      ja:'バード', automatic:['Bardic Inspiration','Spellcasting'],
      groups:[
        {id:'instrumentProficiencies',title:'楽器習熟',type:'multi',count:3,options:instruments,recommended:['Lute','Flute','Drum'],note:'Musical Instrument を3種類選びます。'},
        {id:'cantrips',title:'バード・キャントリップ',type:'multi',count:2,options:spells.Bard.cantrips,recommended:['Dancing Lights','Vicious Mockery']},
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:4,options:spells.Bard.level1,recommended:['Charm Person','Color Spray','Dissonant Whispers','Healing Word']},
        {id:'startingInstrument',title:'開始装備の楽器',type:'single',source:'selected:instrumentProficiencies',condition:{kind:'classEquipment',equals:'A'},note:'開始装備Aを選んだ場合、その中に入る楽器を1つ決めます。'}
      ]
    },
    Cleric: {
      ja:'クレリック', automatic:['Spellcasting'],
      groups:[
        {id:'divineOrder',title:'Divine Order',type:'single',options:[
          {value:'Protector',label:'Protector',desc:'Martial weapons に習熟し、Heavy armor の訓練を得る。'},
          {value:'Thaumaturge',label:'Thaumaturge',desc:'Cleric cantrip を1つ追加で習得し、Arcana/Religion判定にWisdom由来のボーナス。'}
        ],recommended:['Protector']},
        {id:'cantrips',title:'クレリック・キャントリップ',type:'multi',count:3,countWhen:{group:'divineOrder',equals:'Thaumaturge',add:1},options:spells.Cleric.cantrips,recommended:['Guidance','Sacred Flame','Thaumaturgy']},
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:4,options:spells.Cleric.level1,recommended:['Bless','Cure Wounds','Guiding Bolt','Shield of Faith']}
      ]
    },
    Druid: {
      ja:'ドルイド', automatic:['Spellcasting','Druidic'],
      groups:[
        {id:'primalOrder',title:'Primal Order',type:'single',options:[
          {value:'Magician',label:'Magician',desc:'Druid cantrip を1つ追加で習得し、Arcana/Nature判定にWisdom由来のボーナス。'},
          {value:'Warden',label:'Warden',desc:'Martial weapons に習熟し、Medium armor の訓練を得る。'}
        ],recommended:['Warden']},
        {id:'cantrips',title:'ドルイド・キャントリップ',type:'multi',count:2,countWhen:{group:'primalOrder',equals:'Magician',add:1},options:spells.Druid.cantrips,recommended:['Druidcraft','Produce Flame']},
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:4,options:spells.Druid.level1,recommended:['Animal Friendship','Cure Wounds','Faerie Fire','Thunderwave']}
      ]
    },
    Fighter: {
      ja:'ファイター', automatic:['Second Wind'],
      groups:[
        {id:'fightingStyle',title:'Fighting Style',type:'single',options:[
          {value:'Archery',label:'Archery',desc:'Ranged weapon の攻撃ロールに+2。'},
          {value:'Defense',label:'Defense',desc:'Light/Medium/Heavy armor着用中、AC+1。'},
          {value:'Great Weapon Fighting',label:'Great Weapon Fighting',desc:'両手で扱う対象武器のダメージダイス1・2を3として扱える。'},
          {value:'Two-Weapon Fighting',label:'Two-Weapon Fighting',desc:'Light武器による追加攻撃のダメージにも能力修正値を加えられる。'}
        ],recommended:['Defense']},
        {id:'weaponMastery',title:'Weapon Mastery',type:'multi',count:3,options:allWeapons,recommended:['Longsword','Longbow','Javelin'],note:'Simple または Martial weapon から3種類。'}
      ]
    },
    Monk: {
      ja:'モンク', automatic:['Martial Arts','Unarmored Defense'],
      groups:[
        {id:'toolProficiency',title:'道具習熟',type:'single',options:monkTools,recommended:["Cook's Utensils"],note:'Artisan’s Tools または Musical Instrument から1種類。'}
      ]
    },
    Paladin: {
      ja:'パラディン', automatic:['Lay On Hands','Spellcasting'],
      groups:[
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:2,options:spells.Paladin.level1,recommended:['Heroism','Searing Smite']},
        {id:'weaponMastery',title:'Weapon Mastery',type:'multi',count:2,options:allWeapons,recommended:['Longsword','Javelin'],note:'習熟している武器から2種類。'}
      ]
    },
    Ranger: {
      ja:'レンジャー', automatic:["Favored Enemy (Hunter's Mark)",'Spellcasting'],
      groups:[
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:2,options:spells.Ranger.level1,recommended:['Cure Wounds','Ensnaring Strike']},
        {id:'weaponMastery',title:'Weapon Mastery',type:'multi',count:2,options:allWeapons,recommended:['Longbow','Shortsword'],note:'習熟している武器から2種類。'}
      ]
    },
    Rogue: {
      ja:'ローグ', automatic:['Sneak Attack',"Thieves' Cant"],
      groups:[
        {id:'expertise',title:'Expertise',type:'multi',count:2,source:'proficientSkills',recommended:['Sleight of Hand','Stealth'],note:'すでに習熟している技能から2つ選びます。'},
        {id:'thievesCantLanguage',title:'Thieves’ Cantで得る追加言語',type:'single',options:rogueLanguages,recommended:['Elvish']},
        {id:'weaponMastery',title:'Weapon Mastery',type:'multi',count:2,options:rogueWeapons,recommended:['Dagger','Shortbow'],note:'ローグが習熟している武器から2種類。'}
      ]
    },
    Sorcerer: {
      ja:'ソーサラー', automatic:['Innate Sorcery','Spellcasting'],
      groups:[
        {id:'cantrips',title:'ソーサラー・キャントリップ',type:'multi',count:4,options:spells.Sorcerer.cantrips,recommended:['Light','Prestidigitation','Shocking Grasp','Sorcerous Burst']},
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:2,options:spells.Sorcerer.level1,recommended:['Burning Hands','Detect Magic']}
      ]
    },
    Warlock: {
      ja:'ウォーロック', automatic:['Pact Magic'],
      groups:[
        {id:'eldritchInvocation',title:'Eldritch Invocation',type:'single',options:['Armor of Shadows','Eldritch Mind','Pact of the Blade','Pact of the Chain','Pact of the Tome'],recommended:['Pact of the Tome'],note:'レベル1で前提条件を満たせるSRDの選択肢。'},
        {id:'cantrips',title:'ウォーロック・キャントリップ',type:'multi',count:2,options:spells.Warlock.cantrips,recommended:['Eldritch Blast','Prestidigitation']},
        {id:'preparedSpells',title:'レベル1準備呪文',type:'multi',count:2,options:spells.Warlock.level1,recommended:['Charm Person','Hex']}
      ]
    },
    Wizard: {
      ja:'ウィザード', automatic:['Spellcasting','Ritual Adept','Arcane Recovery'],
      groups:[
        {id:'cantrips',title:'ウィザード・キャントリップ',type:'multi',count:3,options:spells.Wizard.cantrips,recommended:['Light','Mage Hand','Ray of Frost']},
        {id:'spellbook',title:'Spellbook：レベル1呪文',type:'multi',count:6,options:spells.Wizard.level1,recommended:['Detect Magic','Feather Fall','Mage Armor','Magic Missile','Sleep','Thunderwave'],note:'レベル1ではSpellbookに6つのレベル1 Wizard spellを入れます。'},
        {id:'preparedSpells',title:'準備する呪文',type:'multi',count:4,source:'selected:spellbook',recommended:['Detect Magic','Mage Armor','Magic Missile','Sleep'],note:'Spellbookに入れた6つの中から4つを準備します。'}
      ]
    }
  };

  return { classes, spells, instruments, artisanTools, weapons:{allWeapons,barbarianWeapons,rogueWeapons}, languages:{standardLanguages,rareLanguages} };
})();