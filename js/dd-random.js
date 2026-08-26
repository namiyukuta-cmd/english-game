(() => {
  'use strict';

  const SRD = window.DD_SRD_CHARACTER;
  const CLASS = window.DD_CLASS_OPTIONS;
  const ORIGIN = window.DD_ORIGIN_OPTIONS;
  const sheet = document.getElementById('characterSheet');
  const startButton = document.getElementById('startButton');
  const rerollButton = document.getElementById('rerollButton');
  const topButton = document.getElementById('topButton');

  if (!SRD || !CLASS || !ORIGIN) {
    sheet.innerHTML = '<div class="error">キャラクターデータを読み込めませんでした。</div>';
    startButton.disabled = true;
    rerollButton.disabled = true;
    return;
  }

  let candidate = null;

  const firstNames = [
    'Arlen','Brann','Corin','Dain','Elira','Elowen','Finn','Garrick','Ilyra','Kael',
    'Liora','Mara','Mira','Nessa','Orin','Rhea','Soren','Tessa','Toren','Vera',
    'Alden','Brenna','Celia','Darien','Eira','Farren','Galen','Iris','Joren','Kara'
  ];
  const lastNames = [
    'Ashford','Blackwood','Briar','Dusk','Fairwind','Fallow','Grey','Hearth','Ironwood','Marsh',
    'Moonfall','Oak','Rook','Rowe','Silver','Stone','Thorne','Vale','West','Winter',
    'Dale','Ember','Field','Grove','Hollow','Reed','Ridge','Shaw','Wren','Yarrow'
  ];

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const unique = arr => [...new Set(arr.filter(Boolean))];
  const sample = (arr, count) => shuffle(unique(arr)).slice(0, Math.min(count, unique(arr).length));
  const optionValue = option => typeof option === 'string' ? option : option?.value;
  const fmt = value => Array.isArray(value) ? value.join(' / ') : String(value ?? '');
  const mod = score => Math.floor((Number(score) - 10) / 2);
  const fmtMod = value => value >= 0 ? `+${value}` : String(value);

  function roll4d6Keep3() {
    const dice = Array.from({length:4}, () => Math.floor(Math.random() * 6) + 1).sort((a,b) => a-b);
    return dice.slice(1).reduce((sum, value) => sum + value, 0);
  }

  function generateName() {
    return `${pick(firstNames)} ${pick(lastNames)}`;
  }

  function abilityObjectFromSuggested(classData) {
    const ids = SRD.abilities.map(row => row[0]);
    const suggested = classData.suggested || [15,14,13,12,10,8];
    const priority = ids
      .map((id,index) => ({id, score:suggested[index] ?? 10}))
      .sort((a,b) => b.score - a.score);
    const rolls = Array.from({length:6}, roll4d6Keep3).sort((a,b) => b-a);
    const result = {};
    priority.forEach((row,index) => result[row.id] = rolls[index] ?? 10);
    return result;
  }

  function backgroundBonuses(background) {
    const abilities = background.abilities || [];
    const result = Object.fromEntries(SRD.abilities.map(([id]) => [id,0]));
    const mode = Math.random() < 0.5 ? 'split' : 'triple';
    if (mode === 'triple') {
      abilities.forEach(id => result[id] = 1);
      return {mode, values:result};
    }
    const [plus2, plus1] = sample(abilities, 2);
    if (plus2) result[plus2] += 2;
    if (plus1) result[plus1] += 1;
    return {mode, values:result};
  }

  function resolveClassChoices(classId, classEquipmentId, proficientSkills) {
    const config = CLASS.classes[classId] || {automatic:[],groups:[]};
    const resolved = {};

    for (const group of config.groups || []) {
      if (group.condition?.kind === 'classEquipment' && group.condition.equals !== classEquipmentId) continue;

      let options = group.options || [];
      if (group.source === 'proficientSkills') options = proficientSkills;
      if (group.source?.startsWith('selected:')) {
        const sourceId = group.source.slice(9);
        const source = resolved[sourceId];
        options = Array.isArray(source) ? source : source ? [source] : [];
      }

      const values = options.map(optionValue).filter(Boolean);
      let count = group.count || 1;
      if (group.countWhen && resolved[group.countWhen.group] === group.countWhen.equals) count += group.countWhen.add || 0;

      if (group.type === 'multi') resolved[group.id] = sample(values, count);
      else resolved[group.id] = values.length ? pick(values) : '';
    }

    return {automatic:[...(config.automatic || [])], choices:resolved};
  }

  function makeMagicInitiate(spellList) {
    const data = ORIGIN.spellLists[spellList] || {cantrips:[],level1:[]};
    return {
      spellList,
      ability:pick(['Intelligence','Wisdom','Charisma']),
      cantrips:sample(data.cantrips || [], 2),
      level1:(data.level1 || []).length ? pick(data.level1) : ''
    };
  }

  function makeOriginChoices(backgroundId, speciesId, background, humanFeat) {
    const bgRule = ORIGIN.backgrounds[backgroundId] || {};
    const originChoices = {background:{feat:background.feat || bgRule.feat || ''}};
    const originSpells = {};

    if (bgRule.feat === 'Magic Initiate' && bgRule.fixedSpellList) {
      const magic = makeMagicInitiate(bgRule.fixedSpellList);
      originChoices.background = {...originChoices.background, ...magic};
      originSpells.background = {
        feat:'Magic Initiate',
        spellList:magic.spellList,
        spellcastingAbility:magic.ability,
        cantrips:[...magic.cantrips],
        level1:magic.level1
      };
    }

    if (bgRule.gamingSet) originChoices.background.gamingSet = pick(ORIGIN.gamingSets);

    if (speciesId === 'Human') {
      originChoices.human = {feat:humanFeat};
      if (humanFeat === 'Magic Initiate') {
        const blocked = bgRule.fixedSpellList || '';
        const lists = ['Cleric','Druid','Wizard'].filter(v => v !== blocked);
        const magic = makeMagicInitiate(pick(lists));
        originChoices.human = {...originChoices.human, ...magic};
        originSpells.human = {
          feat:'Magic Initiate',
          spellList:magic.spellList,
          spellcastingAbility:magic.ability,
          cantrips:[...magic.cantrips],
          level1:magic.level1
        };
      }
    }

    return {originChoices, originSpells};
  }

  function replaceStartingItem(name, classChoices, originChoices) {
    const text = String(name);
    if (text.includes('Artisan’s Tools または Musical Instrument（1つ選択）')) {
      return classChoices.toolProficiency || 'Tool';
    }
    if (text.includes('Musical Instrument（1つ選択）')) {
      return classChoices.startingInstrument || classChoices.instrumentProficiencies?.[0] || 'Musical Instrument';
    }
    if (text === 'Gaming Set' || text.includes('Gaming Set（1種類選択）')) {
      return originChoices.background?.gamingSet ? `Gaming Set: ${originChoices.background.gamingSet}` : 'Gaming Set';
    }
    return text;
  }

  function humanFeatFor(backgroundId) {
    const bgFeat = ORIGIN.backgrounds[backgroundId]?.feat || '';
    const valid = ORIGIN.originFeats.filter(feat => feat !== bgFeat || ORIGIN.repeatableFeats.includes(feat));
    return pick(valid);
  }

  function createCharacter() {
    const classId = pick(Object.keys(SRD.classes));
    const classData = SRD.classes[classId];
    const backgroundId = pick(Object.keys(SRD.backgrounds));
    const background = SRD.backgrounds[backgroundId];
    const speciesId = pick(Object.keys(SRD.species));
    const species = SRD.species[speciesId];
    const alignment = pick(SRD.alignments);
    const classEquipment = pick(classData.equipment);
    const backgroundEquipment = pick(background.equipment);

    const humanFeat = speciesId === 'Human' ? humanFeatFor(backgroundId) : '';
    const humanSkill = speciesId === 'Human'
      ? pick(SRD.allSkills.filter(skill => !(background.skills || []).includes(skill)))
      : '';

    const classSkillPool = classData.skills.filter(skill => !(background.skills || []).includes(skill) && skill !== humanSkill);
    const classSkills = sample(classSkillPool, classData.skillCount || 0);
    const proficientBase = unique([...(background.skills || []), ...classSkills, humanSkill]);

    const classResolved = resolveClassChoices(classId, classEquipment.id, proficientBase);
    const originResolved = makeOriginChoices(backgroundId, speciesId, background, humanFeat);

    if (speciesId === 'Human' && humanFeat === 'Skilled') {
      const skillOptions = SRD.allSkills
        .filter(skill => !proficientBase.includes(skill))
        .map(skill => `skill:${skill}`);
      const toolOptions = (ORIGIN.tools || []).map(tool => `tool:${tool}`);
      originResolved.originChoices.human.skilled = sample([...skillOptions,...toolOptions], 3);
    }

    const extraSkills = speciesId === 'Human' && humanFeat === 'Skilled'
      ? (originResolved.originChoices.human.skilled || []).filter(v => v.startsWith('skill:')).map(v => v.slice(6))
      : [];
    const extraTools = speciesId === 'Human' && humanFeat === 'Skilled'
      ? (originResolved.originChoices.human.skilled || []).filter(v => v.startsWith('tool:')).map(v => v.slice(5))
      : [];

    const skills = unique([...proficientBase, ...extraSkills]);

    const languageChoices = sample(SRD.languages, 2);
    const languages = unique([
      'Common',
      ...languageChoices,
      classId === 'Druid' ? 'Druidic' : '',
      classId === 'Rogue' ? classResolved.choices.thievesCantLanguage : ''
    ]);

    const toolProficiencies = [];
    if (ORIGIN.backgrounds[backgroundId]?.gamingSet && originResolved.originChoices.background?.gamingSet) {
      toolProficiencies.push(`Gaming Set: ${originResolved.originChoices.background.gamingSet}`);
    } else if (background.tool) {
      toolProficiencies.push(background.tool);
    }
    if (classResolved.choices.toolProficiency) toolProficiencies.push(classResolved.choices.toolProficiency);
    if (Array.isArray(classResolved.choices.instrumentProficiencies)) toolProficiencies.push(...classResolved.choices.instrumentProficiencies.map(v => `Musical Instrument: ${v}`));
    toolProficiencies.push(...extraTools);

    const abilityBase = abilityObjectFromSuggested(classData);
    const bonusInfo = backgroundBonuses(background);
    const abilities = Object.fromEntries(SRD.abilities.map(([id]) => [id, Math.min(20, abilityBase[id] + (bonusInfo.values[id] || 0))]));
    const maxHp = Math.max(1, classData.hitDie + mod(abilities.con));

    const speciesVariant = species.variants?.length ? pick(species.variants) : '';
    const size = pick(species.size || ['Medium']);

    const feats = unique([background.feat, humanFeat]);
    const classItems = (classEquipment.items || []).map(name => replaceStartingItem(name, classResolved.choices, originResolved.originChoices));
    const backgroundItems = (backgroundEquipment.items || []).map(name => replaceStartingItem(name, classResolved.choices, originResolved.originChoices));
    const inventory = DDInventory.createItems([...classItems,...backgroundItems]);

    const id = crypto.randomUUID ? crypto.randomUUID() : `dd-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    return {
      id,
      meta:{saveFormat:2,inventoryFormat:1,rules:'SRD 5.2.1',createdAt:new Date().toISOString(),updatedAt:null,creation:'random'},
      character:{
        id,
        name:generateName(),
        level:1,
        xp:0,
        className:classId,
        classNameJa:classData.ja,
        hitDie:`d${classData.hitDie}`,
        proficiencyBonus:2,
        primaryAbility:classData.primary,
        saveProficiencies:[...(classData.saves || [])],
        species:speciesId,
        speciesJa:species.ja,
        speciesVariant,
        size,
        speed:species.speed,
        background:backgroundId,
        backgroundJa:background.ja,
        alignment,
        hp:maxHp,
        maxHp,
        abilities,
        abilityBase,
        abilityBonuses:bonusInfo.values,
        abilityBonusMode:bonusInfo.mode,
        skills,
        languages,
        feats,
        toolProficiencies:unique(toolProficiencies),
        classFeatures:classResolved.automatic,
        classChoices:classResolved.choices,
        originChoices:originResolved.originChoices,
        originSpells:originResolved.originSpells,
        portrait:'',
        notes:'',
        pendingChoices:[]
      },
      currency:{gp:(classEquipment.gp || 0) + (backgroundEquipment.gp || 0),sp:0,cp:0},
      inventory,
      equipment:[],
      quests:[],
      npcs:[],
      world:{discoveredLocations:[],activeEvents:[]},
      current:{location:'未設定',scene:'start',day:1,time:'朝',background:''},
      currentNpc:null,
      log:[]
    };
  }

  function classChoiceRows(game) {
    const config = CLASS.classes[game.character.className];
    const choices = game.character.classChoices || {};
    return (config?.groups || [])
      .filter(group => Object.prototype.hasOwnProperty.call(choices, group.id) && fmt(choices[group.id]))
      .map(group => `<div class="choice-row"><span>${esc(group.title)}</span><span>${esc(fmt(choices[group.id]))}</span></div>`)
      .join('');
  }

  function originRows(game) {
    const data = game.character.originChoices || {};
    const rows = [];
    const bg = data.background || {};
    if (bg.spellList) rows.push(['背景 Magic Initiate', `${bg.spellList} / ${bg.ability} / ${fmt(bg.cantrips)} / ${bg.level1}`]);
    if (bg.gamingSet) rows.push(['Gaming Set', bg.gamingSet]);
    const human = data.human || {};
    if (human.feat) rows.push(['Human Origin Feat', human.feat]);
    if (human.spellList) rows.push(['Human Magic Initiate', `${human.spellList} / ${human.ability} / ${fmt(human.cantrips)} / ${human.level1}`]);
    if (human.skilled?.length) rows.push(['Human Skilled', fmt(human.skilled.map(v => v.replace(/^skill:/,'技能：').replace(/^tool:/,'道具：')))]);
    return rows.map(([label,value]) => `<div class="choice-row"><span>${esc(label)}</span><span>${esc(value)}</span></div>`).join('');
  }

  function render(game) {
    const c = game.character;
    const stats = SRD.abilities.map(([id,,short]) => {
      const score = c.abilities[id];
      return `<div class="ability"><small>${esc(short)}</small><strong>${esc(score)}</strong><span>${esc(fmtMod(mod(score)))}</span></div>`;
    }).join('');

    const classRows = classChoiceRows(game);
    const origin = originRows(game);
    const items = game.inventory.map(item => {
      const data = DDInventory.itemData(item.itemId);
      const quantity = Number(item.quantity || 1);
      return `${data?.name || item.itemId}${quantity !== 1 ? ` ×${quantity}` : ''}`;
    });

    sheet.innerHTML = `
      <h2 class="name">${esc(c.name)}</h2>
      <p class="sub">${esc(c.classNameJa)} / ${esc(c.speciesJa)}${c.speciesVariant ? `・${esc(c.speciesVariant)}` : ''} / ${esc(c.backgroundJa)}</p>

      <div class="status">
        <div>LEVEL<strong>1</strong></div>
        <div>HP<strong>${esc(c.hp)}</strong></div>
        <div>GP<strong>${esc(game.currency.gp)}</strong></div>
      </div>

      <div class="ability-grid">${stats}</div>

      <section class="section"><h2>基本情報</h2>
        <div class="choice-list">
          <div class="choice-row"><span>Alignment</span><span>${esc(c.alignment)}</span></div>
          <div class="choice-row"><span>Size / Speed</span><span>${esc(c.size)} / ${esc(c.speed)} ft.</span></div>
          <div class="choice-row"><span>Primary</span><span>${esc(c.primaryAbility)}</span></div>
          <div class="choice-row"><span>Saving Throws</span><span>${esc(c.saveProficiencies.join(' / '))}</span></div>
        </div>
      </section>

      <section class="section"><h2>技能</h2><div class="chips">${c.skills.map(v => `<span class="chip">${esc(v)}</span>`).join('')}</div></section>
      <section class="section"><h2>言語</h2><div class="chips">${c.languages.map(v => `<span class="chip">${esc(v)}</span>`).join('')}</div></section>
      <section class="section"><h2>特技・クラス能力</h2><div class="chips">${[...c.feats,...c.classFeatures].map(v => `<span class="chip">${esc(v)}</span>`).join('')}</div></section>

      <section class="section"><h2>クラス固有の選択</h2><div class="choice-list">${classRows || '<p class="empty">追加の選択はありません。</p>'}</div></section>
      <section class="section"><h2>出自・種族の追加選択</h2><div class="choice-list">${origin || '<p class="empty">追加の選択はありません。</p>'}</div></section>

      <section class="section"><h2>道具習熟</h2><p>${c.toolProficiencies.length ? esc(c.toolProficiencies.join(' / ')) : '<span class="empty">なし</span>'}</p></section>
      <section class="section"><h2>開始所持品</h2><div class="chips">${items.length ? items.map(v => `<span class="chip">${esc(v)}</span>`).join('') : '<span class="empty">なし</span>'}</div></section>`;
  }

  function reroll() {
    candidate = createCharacter();
    render(candidate);
    window.scrollTo({top:0,behavior:'instant'});
  }

  startButton.addEventListener('click', () => {
    if (!candidate) return;
    localStorage.setItem('ddActiveGame', JSON.stringify(candidate));
    location.href = 'DD.html?v=20260825-6';
  });

  rerollButton.addEventListener('click', reroll);
  topButton.addEventListener('click', () => location.href = 'DD_top.html');

  reroll();
})();
