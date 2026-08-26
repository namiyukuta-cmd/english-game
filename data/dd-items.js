/*
 * Item data used by the D&D inventory screen.
 * Add new entries here when shops, treasure, or quest rewards introduce them.
 *
 * This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1")
 * by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
 * The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
 * available at https://creativecommons.org/licenses/by/4.0/legalcode.
 */
window.DD_ITEMS = {
  longsword: {
    id: 'longsword',
    name: 'Longsword',
    ja: 'ロングソード',
    type: 'weapon',
    price: { gp: 15 },
    weight: 3,
    damage: '1d8 Slashing'
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    ja: 'ダガー',
    type: 'weapon',
    price: { gp: 2 },
    weight: 1,
    damage: '1d4 Piercing'
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    ja: 'シールド',
    type: 'armor',
    price: { gp: 10 },
    weight: 6,
    acBonus: 2
  },
  chain_mail: {
    id: 'chain_mail',
    name: 'Chain Mail',
    ja: 'チェイン・メイル',
    type: 'armor',
    price: { gp: 75 },
    weight: 55,
    ac: 16
  },
  javelin: {
    id: 'javelin',
    name: 'Javelin',
    ja: 'ジャヴェリン',
    type: 'weapon',
    price: { sp: 5 },
    weight: 2,
    damage: '1d6 Piercing'
  },
  arrow: {
    id: 'arrow',
    name: 'Arrow',
    ja: 'アロー',
    type: 'ammo',
    weight: 0.05
  },
  torch: {
    id: 'torch',
    name: 'Torch',
    ja: '松明',
    type: 'consumable',
    weight: 1
  },
  rations: {
    id: 'rations',
    name: 'Rations',
    ja: '保存食',
    type: 'consumable',
    weight: 2
  },
  rope_hempen_50: {
    id: 'rope_hempen_50',
    name: 'Hempen Rope (50 ft.)',
    ja: '麻のロープ 50フィート',
    type: 'gear',
    weight: 10,
    aliases: ['Hempen Rope', 'Rope, Hempen (50 feet)']
  },
  holy_symbol: {
    id: 'holy_symbol',
    name: 'Holy Symbol',
    ja: '聖印',
    type: 'gear',
    weight: 1
  },

  greataxe: {
    id: 'greataxe', name: 'Greataxe', ja: 'グレートアックス', type: 'weapon', weight: 7, damage: '1d12 Slashing'
  },
  handaxe: {
    id: 'handaxe', name: 'Handaxe', ja: 'ハンドアックス', type: 'weapon', weight: 2, damage: '1d6 Slashing'
  },
  mace: {
    id: 'mace', name: 'Mace', ja: 'メイス', type: 'weapon', weight: 4, damage: '1d6 Bludgeoning'
  },
  sickle: {
    id: 'sickle', name: 'Sickle', ja: 'シックル', type: 'weapon', weight: 2, damage: '1d4 Slashing'
  },
  greatsword: {
    id: 'greatsword', name: 'Greatsword', ja: 'グレートソード', type: 'weapon', weight: 6, damage: '2d6 Slashing'
  },
  flail: {
    id: 'flail', name: 'Flail', ja: 'フレイル', type: 'weapon', weight: 2, damage: '1d8 Bludgeoning'
  },
  scimitar: {
    id: 'scimitar', name: 'Scimitar', ja: 'シミター', type: 'weapon', weight: 3, damage: '1d6 Slashing'
  },
  shortsword: {
    id: 'shortsword', name: 'Shortsword', ja: 'ショートソード', type: 'weapon', weight: 2, damage: '1d6 Piercing'
  },
  longbow: {
    id: 'longbow', name: 'Longbow', ja: 'ロングボウ', type: 'weapon', weight: 2, damage: '1d8 Piercing'
  },
  spear: {
    id: 'spear', name: 'Spear', ja: 'スピア', type: 'weapon', weight: 3, damage: '1d6 Piercing'
  },
  shortbow: {
    id: 'shortbow', name: 'Shortbow', ja: 'ショートボウ', type: 'weapon', weight: 2, damage: '1d6 Piercing'
  },
  quarterstaff: {
    id: 'quarterstaff', name: 'Quarterstaff', ja: 'クォータースタッフ', type: 'weapon', weight: 4, damage: '1d6 Bludgeoning'
  },

  leather_armor: {
    id: 'leather_armor', name: 'Leather Armor', ja: 'レザー・アーマー', type: 'armor', weight: 10, ac: 11
  },
  chain_shirt: {
    id: 'chain_shirt', name: 'Chain Shirt', ja: 'チェイン・シャツ', type: 'armor', weight: 20, ac: 13
  },
  studded_leather_armor: {
    id: 'studded_leather_armor', name: 'Studded Leather Armor', ja: 'スタデッド・レザー', type: 'armor', weight: 13, ac: 12
  },

  explorers_pack: {
    id: 'explorers_pack', name: 'Explorer’s Pack', ja: '探検家のパック', type: 'pack', weight: 59, aliases: ["Explorer's Pack"]
  },
  entertainers_pack: {
    id: 'entertainers_pack', name: 'Entertainer’s Pack', ja: '芸人のパック', type: 'pack', weight: 38, aliases: ["Entertainer's Pack"]
  },
  priests_pack: {
    id: 'priests_pack', name: 'Priest’s Pack', ja: '司祭のパック', type: 'pack', weight: 24, aliases: ["Priest's Pack"]
  },
  dungeoneers_pack: {
    id: 'dungeoneers_pack', name: 'Dungeoneer’s Pack', ja: '地下探検家のパック', type: 'pack', weight: 61.5, aliases: ["Dungeoneer's Pack"]
  },
  burglars_pack: {
    id: 'burglars_pack', name: 'Burglar’s Pack', ja: '盗賊のパック', type: 'pack', weight: 47.5, aliases: ["Burglar's Pack"]
  },
  scholars_pack: {
    id: 'scholars_pack', name: 'Scholar’s Pack', ja: '学者のパック', type: 'pack', weight: 10, aliases: ["Scholar's Pack"]
  },

  quiver: {
    id: 'quiver', name: 'Quiver', ja: '矢筒', type: 'gear', weight: 1
  },
  druidic_focus_quarterstaff: {
    id: 'druidic_focus_quarterstaff', name: 'Druidic Focus (Quarterstaff)', ja: 'ドルイド用焦点具（クォータースタッフ）', type: 'weapon', weight: 4, damage: '1d6 Bludgeoning'
  },
  druidic_focus_mistletoe: {
    id: 'druidic_focus_mistletoe', name: 'Druidic Focus (sprig of mistletoe)', ja: 'ドルイド用焦点具（ヤドリギの小枝）', type: 'gear', weight: 0
  },
  arcane_focus_crystal: {
    id: 'arcane_focus_crystal', name: 'Arcane Focus (crystal)', ja: '秘術焦点具（クリスタル）', type: 'gear', weight: 1
  },
  arcane_focus_orb: {
    id: 'arcane_focus_orb', name: 'Arcane Focus (orb)', ja: '秘術焦点具（オーブ）', type: 'gear', weight: 3
  },
  arcane_focus_quarterstaff: {
    id: 'arcane_focus_quarterstaff', name: 'Arcane Focus (Quarterstaff)', ja: '秘術焦点具（クォータースタッフ）', type: 'weapon', weight: 4, damage: '1d6 Bludgeoning'
  },
  herbalism_kit: {
    id: 'herbalism_kit', name: 'Herbalism Kit', ja: '薬草師道具', type: 'tool', weight: 3
  },
  thieves_tools: {
    id: 'thieves_tools', name: 'Thieves’ Tools', ja: '盗賊道具', type: 'tool', weight: 1, aliases: ["Thieves' Tools"]
  },
  healers_kit: {
    id: 'healers_kit', name: 'Healer’s Kit', ja: '治療用具', type: 'gear', weight: 3, aliases: ["Healer's Kit"]
  },
  calligraphers_supplies: {
    id: 'calligraphers_supplies', name: 'Calligrapher’s Supplies', ja: '筆写用具', type: 'tool', weight: 5, aliases: ["Calligrapher's Supplies"]
  },
  musical_instrument: {
    id: 'musical_instrument', name: 'Musical Instrument', ja: '楽器', type: 'tool', weight: 2, aliases: ['Musical Instrument（1つ選択）']
  },
  artisan_tools_or_musical_instrument: {
    id: 'artisan_tools_or_musical_instrument', name: 'Artisan’s Tools or Musical Instrument', ja: '職人道具または楽器', type: 'tool', weight: 5,
    aliases: ["Artisan's Tools or Musical Instrument", 'Artisan’s Tools または Musical Instrument（1つ選択）']
  },
  gaming_set: {
    id: 'gaming_set', name: 'Gaming Set', ja: 'ゲーム道具', type: 'tool', weight: 0, aliases: ['Gaming Set（1種類選択）']
  },

  book_occult_lore: {
    id: 'book_occult_lore', name: 'Book (occult lore)', ja: '書物（オカルト知識）', type: 'book', weight: 5
  },
  book_prayers: {
    id: 'book_prayers', name: 'Book (prayers)', ja: '書物（祈祷書）', type: 'book', weight: 5
  },
  book_history: {
    id: 'book_history', name: 'Book (history)', ja: '書物（歴史）', type: 'book', weight: 5
  },
  spellbook: {
    id: 'spellbook', name: 'Spellbook', ja: '呪文書', type: 'book', weight: 3
  },
  robe: {
    id: 'robe', name: 'Robe', ja: 'ローブ', type: 'clothing', weight: 4
  },
  parchment: {
    id: 'parchment', name: 'Parchment', ja: '羊皮紙', type: 'gear', weight: 0
  },
  crowbar: {
    id: 'crowbar', name: 'Crowbar', ja: 'バール', type: 'gear', weight: 5
  },
  pouch: {
    id: 'pouch', name: 'Pouch', ja: 'ポーチ', type: 'gear', weight: 1
  },
  travelers_clothes: {
    id: 'travelers_clothes', name: 'Traveler’s Clothes', ja: '旅人の服', type: 'clothing', weight: 4, aliases: ["Traveler's Clothes"]
  },

  bagpipes: { id:'bagpipes', name:'Bagpipes', ja:'バグパイプ', type:'tool', weight:6 },
  drum: { id:'drum', name:'Drum', ja:'太鼓', type:'tool', weight:3 },
  dulcimer: { id:'dulcimer', name:'Dulcimer', ja:'ダルシマー', type:'tool', weight:10 },
  flute: { id:'flute', name:'Flute', ja:'フルート', type:'tool', weight:1 },
  horn: { id:'horn', name:'Horn', ja:'角笛', type:'tool', weight:2 },
  lute: { id:'lute', name:'Lute', ja:'リュート', type:'tool', weight:2 },
  lyre: { id:'lyre', name:'Lyre', ja:'ライアー', type:'tool', weight:2 },
  pan_flute: { id:'pan_flute', name:'Pan Flute', ja:'パン・フルート', type:'tool', weight:2 },
  shawm: { id:'shawm', name:'Shawm', ja:'ショーム', type:'tool', weight:1 },
  viol: { id:'viol', name:'Viol', ja:'ヴィオール', type:'tool', weight:1 },

  alchemists_supplies: { id:'alchemists_supplies', name:"Alchemist's Supplies", ja:'錬金術用品', type:'tool', weight:8 },
  brewers_supplies: { id:'brewers_supplies', name:"Brewer's Supplies", ja:'醸造用品', type:'tool', weight:9 },
  carpenters_tools: { id:'carpenters_tools', name:"Carpenter's Tools", ja:'大工道具', type:'tool', weight:6 },
  cartographers_tools: { id:'cartographers_tools', name:"Cartographer's Tools", ja:'地図作成用具', type:'tool', weight:6 },
  cobblers_tools: { id:'cobblers_tools', name:"Cobbler's Tools", ja:'靴職人道具', type:'tool', weight:5 },
  cooks_utensils: { id:'cooks_utensils', name:"Cook's Utensils", ja:'調理用具', type:'tool', weight:8 },
  glassblowers_tools: { id:'glassblowers_tools', name:"Glassblower's Tools", ja:'ガラス職人道具', type:'tool', weight:5 },
  jewelers_tools: { id:'jewelers_tools', name:"Jeweler's Tools", ja:'宝石細工道具', type:'tool', weight:2 },
  leatherworkers_tools: { id:'leatherworkers_tools', name:"Leatherworker's Tools", ja:'革細工道具', type:'tool', weight:5 },
  masons_tools: { id:'masons_tools', name:"Mason's Tools", ja:'石工道具', type:'tool', weight:8 },
  painters_supplies: { id:'painters_supplies', name:"Painter's Supplies", ja:'画材', type:'tool', weight:5 },
  potters_tools: { id:'potters_tools', name:"Potter's Tools", ja:'陶工道具', type:'tool', weight:3 },
  smiths_tools: { id:'smiths_tools', name:"Smith's Tools", ja:'鍛冶道具', type:'tool', weight:8 },
  tinkers_tools: { id:'tinkers_tools', name:"Tinker's Tools", ja:'鋳掛屋道具', type:'tool', weight:10 },
  weavers_tools: { id:'weavers_tools', name:"Weaver's Tools", ja:'織工道具', type:'tool', weight:5 },
  woodcarvers_tools: { id:'woodcarvers_tools', name:"Woodcarver's Tools", ja:'木彫道具', type:'tool', weight:5 },

  dice_set: { id:'dice_set', name:'Dice Set', ja:'ダイス一式', type:'tool', weight:0, aliases:['Gaming Set: Dice Set'] },
  dragonchess_set: { id:'dragonchess_set', name:'Dragonchess Set', ja:'ドラゴンチェス一式', type:'tool', weight:0.5, aliases:['Gaming Set: Dragonchess Set'] },
  playing_card_set: { id:'playing_card_set', name:'Playing Card Set', ja:'トランプ一式', type:'tool', weight:0, aliases:['Gaming Set: Playing Card Set'] },
  three_dragon_ante_set: { id:'three_dragon_ante_set', name:'Three-Dragon Ante Set', ja:'スリー・ドラゴン・アンティ一式', type:'tool', weight:0, aliases:['Gaming Set: Three-Dragon Ante Set'] }
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
