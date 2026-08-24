/*
 * Character-creation reference data based on System Reference Document 5.2.1.
 * This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”)
 * by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
 * The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
 * available at https://creativecommons.org/licenses/by/4.0/legalcode.
 */
window.DD_SRD_CHARACTER = (() => {
  const abilities = [
    ['str','筋力','STR'],['dex','敏捷力','DEX'],['con','耐久力','CON'],
    ['int','知力','INT'],['wis','判断力','WIS'],['cha','魅力','CHA']
  ];

  const allSkills = [
    'Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation',
    'Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival'
  ];

  const classes = {
    Barbarian:{ja:'バーバリアン',primary:'Strength',hitDie:12,saves:['Strength','Constitution'],skillCount:2,skills:['Animal Handling','Athletics','Intimidation','Nature','Perception','Survival'],suggested:[15,13,14,10,12,8],equipment:[
      {id:'A',label:'A：装備一式',items:['Greataxe','Handaxe ×4','Explorer’s Pack'],gp:15},
      {id:'B',label:'B：75 GP',items:[],gp:75}
    ]},
    Bard:{ja:'バード',primary:'Charisma',hitDie:8,saves:['Dexterity','Charisma'],skillCount:3,skills:allSkills,suggested:[8,14,12,13,10,15],equipment:[
      {id:'A',label:'A：装備一式',items:['Leather Armor','Dagger ×2','Musical Instrument（1つ選択）','Entertainer’s Pack'],gp:19},
      {id:'B',label:'B：90 GP',items:[],gp:90}
    ],pending:['楽器3種類の習熟','バードのレベル1呪文選択']},
    Cleric:{ja:'クレリック',primary:'Wisdom',hitDie:8,saves:['Wisdom','Charisma'],skillCount:2,skills:['History','Insight','Medicine','Persuasion','Religion'],suggested:[14,8,13,10,15,12],equipment:[
      {id:'A',label:'A：装備一式',items:['Chain Shirt','Shield','Mace','Holy Symbol','Priest’s Pack'],gp:7},
      {id:'B',label:'B：110 GP',items:[],gp:110}
    ],pending:['Divine Orderの選択','クレリックのレベル1呪文選択']},
    Druid:{ja:'ドルイド',primary:'Wisdom',hitDie:8,saves:['Intelligence','Wisdom'],skillCount:2,skills:['Arcana','Animal Handling','Insight','Medicine','Nature','Perception','Religion','Survival'],suggested:[8,12,14,13,15,10],equipment:[
      {id:'A',label:'A：装備一式',items:['Leather Armor','Shield','Sickle','Druidic Focus (Quarterstaff)','Explorer’s Pack','Herbalism Kit'],gp:9},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['Primal Orderの選択','ドルイドのレベル1呪文選択']},
    Fighter:{ja:'ファイター',primary:'Strength または Dexterity',hitDie:10,saves:['Strength','Constitution'],skillCount:2,skills:['Acrobatics','Animal Handling','Athletics','History','Insight','Intimidation','Perception','Persuasion','Survival'],suggested:[15,14,13,8,10,12],equipment:[
      {id:'A',label:'A：重装備',items:['Chain Mail','Greatsword','Flail','Javelin ×8','Dungeoneer’s Pack'],gp:4},
      {id:'B',label:'B：軽装備',items:['Studded Leather Armor','Scimitar','Shortsword','Longbow','Arrow ×20','Quiver','Dungeoneer’s Pack'],gp:11},
      {id:'C',label:'C：155 GP',items:[],gp:155}
    ],pending:['Fighting Styleの選択','Weapon Masteryの選択']},
    Monk:{ja:'モンク',primary:'Dexterity と Wisdom',hitDie:8,saves:['Strength','Dexterity'],skillCount:2,skills:['Acrobatics','Athletics','History','Insight','Religion','Stealth'],suggested:[12,15,13,10,14,8],equipment:[
      {id:'A',label:'A：装備一式',items:['Spear','Dagger ×5','Artisan’s Tools または Musical Instrument（1つ選択）','Explorer’s Pack'],gp:11},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['道具習熟の種類']},
    Paladin:{ja:'パラディン',primary:'Strength と Charisma',hitDie:10,saves:['Wisdom','Charisma'],skillCount:2,skills:['Athletics','Insight','Intimidation','Medicine','Persuasion','Religion'],suggested:[15,10,13,8,12,14],equipment:[
      {id:'A',label:'A：装備一式',items:['Chain Mail','Shield','Longsword','Javelin ×6','Holy Symbol','Priest’s Pack'],gp:9},
      {id:'B',label:'B：150 GP',items:[],gp:150}
    ]},
    Ranger:{ja:'レンジャー',primary:'Dexterity と Wisdom',hitDie:10,saves:['Strength','Dexterity'],skillCount:3,skills:['Animal Handling','Athletics','Insight','Investigation','Nature','Perception','Stealth','Survival'],suggested:[12,15,13,8,14,10],equipment:[
      {id:'A',label:'A：装備一式',items:['Studded Leather Armor','Scimitar','Shortsword','Longbow','Arrow ×20','Quiver','Druidic Focus (sprig of mistletoe)','Explorer’s Pack'],gp:7},
      {id:'B',label:'B：150 GP',items:[],gp:150}
    ],pending:['Weapon Masteryの選択']},
    Rogue:{ja:'ローグ',primary:'Dexterity',hitDie:8,saves:['Dexterity','Intelligence'],skillCount:4,skills:['Acrobatics','Athletics','Deception','Insight','Intimidation','Investigation','Perception','Persuasion','Sleight of Hand','Stealth'],suggested:[12,15,13,14,10,8],equipment:[
      {id:'A',label:'A：装備一式',items:['Leather Armor','Dagger ×2','Shortsword','Shortbow','Arrow ×20','Quiver','Thieves’ Tools','Burglar’s Pack'],gp:8},
      {id:'B',label:'B：100 GP',items:[],gp:100}
    ],pending:['Expertiseの対象','Weapon Masteryの選択']},
    Sorcerer:{ja:'ソーサラー',primary:'Charisma',hitDie:6,saves:['Constitution','Charisma'],skillCount:2,skills:['Arcana','Deception','Insight','Intimidation','Persuasion','Religion'],suggested:[10,13,14,8,12,15],equipment:[
      {id:'A',label:'A：装備一式',items:['Spear','Dagger ×2','Arcane Focus (crystal)','Dungeoneer’s Pack'],gp:28},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['ソーサラーのレベル1呪文選択']},
    Warlock:{ja:'ウォーロック',primary:'Charisma',hitDie:8,saves:['Wisdom','Charisma'],skillCount:2,skills:['Arcana','Deception','History','Intimidation','Investigation','Nature','Religion'],suggested:[8,14,13,12,10,15],equipment:[
      {id:'A',label:'A：装備一式',items:['Leather Armor','Sickle','Dagger ×2','Arcane Focus (orb)','Book (occult lore)','Scholar’s Pack'],gp:15},
      {id:'B',label:'B：100 GP',items:[],gp:100}
    ],pending:['Eldritch Invocationの選択','ウォーロックのレベル1呪文選択']},
    Wizard:{ja:'ウィザード',primary:'Intelligence',hitDie:6,saves:['Intelligence','Wisdom'],skillCount:2,skills:['Arcana','History','Insight','Investigation','Medicine','Nature','Religion'],suggested:[8,12,13,15,14,10],equipment:[
      {id:'A',label:'A：装備一式',items:['Dagger ×2','Arcane Focus (Quarterstaff)','Robe','Spellbook','Scholar’s Pack'],gp:5},
      {id:'B',label:'B：55 GP',items:[],gp:55}
    ],pending:['ウィザードのレベル1呪文選択']}
  };

  const backgrounds = {
    Acolyte:{ja:'侍祭（Acolyte）',abilities:['int','wis','cha'],feat:'Magic Initiate (Cleric)',skills:['Insight','Religion'],tool:'Calligrapher’s Supplies',equipment:[
      {id:'A',label:'A：装備一式',items:['Calligrapher’s Supplies','Book (prayers)','Holy Symbol','Parchment ×10','Robe'],gp:8},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['Magic Initiate (Cleric) の呪文選択']},
    Criminal:{ja:'犯罪者（Criminal）',abilities:['dex','con','int'],feat:'Alert',skills:['Sleight of Hand','Stealth'],tool:'Thieves’ Tools',equipment:[
      {id:'A',label:'A：装備一式',items:['Dagger ×2','Thieves’ Tools','Crowbar','Pouch ×2','Traveler’s Clothes'],gp:16},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ]},
    Sage:{ja:'賢者（Sage）',abilities:['con','int','wis'],feat:'Magic Initiate (Wizard)',skills:['Arcana','History'],tool:'Calligrapher’s Supplies',equipment:[
      {id:'A',label:'A：装備一式',items:['Quarterstaff','Calligrapher’s Supplies','Book (history)','Parchment ×8','Robe'],gp:8},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['Magic Initiate (Wizard) の呪文選択']},
    Soldier:{ja:'兵士（Soldier）',abilities:['str','dex','con'],feat:'Savage Attacker',skills:['Athletics','Intimidation'],tool:'Gaming Set（1種類選択）',equipment:[
      {id:'A',label:'A：装備一式',items:['Spear','Shortbow','Arrow ×20','Gaming Set','Healer’s Kit','Quiver','Traveler’s Clothes'],gp:14},
      {id:'B',label:'B：50 GP',items:[],gp:50}
    ],pending:['Gaming Setの種類']}
  };

  const species = {
    Dragonborn:{ja:'ドラゴンボーン',size:['Medium'],speed:30,variants:['Black / Acid','Blue / Lightning','Brass / Fire','Bronze / Lightning','Copper / Acid','Gold / Fire','Green / Poison','Red / Fire','Silver / Cold','White / Cold'],variantLabel:'Draconic Ancestry'},
    Dwarf:{ja:'ドワーフ',size:['Medium'],speed:30},
    Elf:{ja:'エルフ',size:['Medium'],speed:30,variants:['Drow','High Elf','Wood Elf'],variantLabel:'Elven Lineage'},
    Gnome:{ja:'ノーム',size:['Small'],speed:30,variants:['Forest Gnome','Rock Gnome'],variantLabel:'Gnomish Lineage'},
    Goliath:{ja:'ゴライアス',size:['Medium'],speed:35,variants:['Cloud Giant','Fire Giant','Frost Giant','Hill Giant','Stone Giant','Storm Giant'],variantLabel:'Giant Ancestry'},
    Halfling:{ja:'ハーフリング',size:['Small'],speed:30},
    Human:{ja:'ヒューマン',size:['Small','Medium'],speed:30,humanExtra:true},
    Orc:{ja:'オーク',size:['Medium'],speed:30},
    Tiefling:{ja:'ティーフリング',size:['Small','Medium'],speed:30,variants:['Abyssal','Chthonic','Infernal'],variantLabel:'Fiendish Legacy'}
  };

  const languages = ['Common Sign Language','Draconic','Dwarvish','Elvish','Giant','Gnomish','Goblin','Halfling','Orc'];
  const alignments = ['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'];
  const originFeats = ['Alert','Crafter','Healer','Lucky','Magic Initiate','Musician','Savage Attacker','Skilled','Tavern Brawler','Tough'];

  return { abilities, allSkills, classes, backgrounds, species, languages, alignments, originFeats };
})();
