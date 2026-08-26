(() => {
  const SRD = window.DD_SRD_CHARACTER;
  const ORIGIN = window.DD_ORIGIN_OPTIONS;
  if (!SRD || !ORIGIN) return;

  const $ = id => document.getElementById(id);
  const wrap = $('originChoiceSection');
  const form = $('characterForm');
  if (!wrap || !form) return;

  const state = { background:{}, human:{} };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function bgId(){ return $('background')?.value || ''; }
  function speciesId(){ return $('species')?.value || ''; }
  function bgRule(){ return ORIGIN.backgrounds[bgId()] || null; }
  function isHuman(){ return speciesId() === 'Human'; }
  function backgroundFeatBase(){ return bgRule()?.feat || ''; }

  function selectedValues(name){
    return [...document.querySelectorAll(`[name="${CSS.escape(name)}"]:checked`)].map(el => el.value);
  }

  function validHumanFeats(){
    const bgFeat = backgroundFeatBase();
    return ORIGIN.originFeats.filter(feat => feat !== bgFeat || ORIGIN.repeatableFeats.includes(feat));
  }

  function syncHumanFeatOptions(){
    if (!isHuman() || !$('humanFeat')) return;
    const select = $('humanFeat');
    const old = select.value;
    const valid = validHumanFeats();
    select.innerHTML = valid.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    select.value = valid.includes(old) ? old : (valid.includes('Skilled') ? 'Skilled' : valid[0] || '');
  }

  function spellAbilityOptions(selected){
    const opts = [['Intelligence','知力 INT'],['Wisdom','判断力 WIS'],['Charisma','魅力 CHA']];
    return opts.map(([v,l]) => `<option value="${v}" ${selected===v?'selected':''}>${l}</option>`).join('');
  }

  function renderMulti(name, options, selected, count, prefix=''){
    const set = new Set(selected || []);
    return `<div class="choice-grid">${options.map(v => {
      const value = prefix ? `${prefix}${v}` : v;
      return `<label class="check-card"><input type="checkbox" name="${esc(name)}" value="${esc(value)}" ${set.has(value)?'checked':''}><span>${esc(v)}</span></label>`;
    }).join('')}</div><p class="mini-note">${count}個選んでください。</p>`;
  }

  function magicInitiateHtml(prefix, fixedList, data){
    const allowedLists = fixedList ? [fixedList] : ['Cleric','Druid','Wizard'].filter(list => list !== bgRule()?.fixedSpellList);
    let list = data.spellList;
    if (!allowedLists.includes(list)) list = allowedLists[0] || '';
    data.spellList = list;
    const spellData = ORIGIN.spellLists[list] || {cantrips:[],level1:[]};
    data.ability = data.ability || 'Intelligence';
    data.cantrips = Array.isArray(data.cantrips) ? data.cantrips.filter(v => spellData.cantrips.includes(v)) : [];
    data.level1 = spellData.level1.includes(data.level1) ? data.level1 : (spellData.level1[0] || '');

    return `
      <div class="class-choice-group">
        <div class="class-choice-head"><strong>Magic Initiate</strong><span class="class-choice-count">Origin Feat</span></div>
        ${fixedList ? `<p class="mini-note">呪文リスト：${esc(fixedList)}（背景で固定）</p>` : `<label class="field">呪文リスト<select id="${prefix}SpellList">${allowedLists.map(v=>`<option value="${v}" ${v===list?'selected':''}>${v}</option>`).join('')}</select></label>`}
        <label class="field">呪文能力値<select id="${prefix}SpellAbility">${spellAbilityOptions(data.ability)}</select></label>
        <h3 class="subhead">キャントリップ</h3>
        ${renderMulti(`${prefix}Cantrip`, spellData.cantrips, data.cantrips, 2)}
        <label class="field">レベル1呪文<select id="${prefix}Level1">${spellData.level1.map(v=>`<option value="${esc(v)}" ${v===data.level1?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
      </div>`;
  }

  function saveDomState(){
    const rule = bgRule();
    if (rule?.feat === 'Magic Initiate') {
      state.background.spellList = rule.fixedSpellList;
      state.background.ability = $('bgSpellAbility')?.value || state.background.ability || 'Intelligence';
      state.background.cantrips = selectedValues('bgCantrip');
      state.background.level1 = $('bgLevel1')?.value || state.background.level1 || '';
    }
    if (rule?.gamingSet) state.background.gamingSet = $('bgGamingSet')?.value || state.background.gamingSet || ORIGIN.gamingSets[0];

    if (isHuman()) {
      state.human.feat = $('humanFeat')?.value || state.human.feat || '';
      if (state.human.feat === 'Magic Initiate') {
        state.human.spellList = $('humanSpellList')?.value || state.human.spellList || '';
        state.human.ability = $('humanSpellAbility')?.value || state.human.ability || 'Intelligence';
        state.human.cantrips = selectedValues('humanCantrip');
        state.human.level1 = $('humanLevel1')?.value || state.human.level1 || '';
      } else if (state.human.feat === 'Skilled') {
        state.human.skilled = selectedValues('humanSkilled');
      }
    }
  }

  function render(){
    saveDomState();
    syncHumanFeatOptions();
    const rule = bgRule();
    const bg = SRD.backgrounds[bgId()];
    const html = [];

    html.push(`<h3 class="subhead">出自の追加選択</h3>`);
    html.push(`<div class="info-box"><strong>${esc(bg?.ja || bgId())}</strong><span>背景特技：${esc(bg?.feat || rule?.feat || 'なし')}</span></div>`);

    if (rule?.feat === 'Magic Initiate') {
      state.background.spellList = rule.fixedSpellList;
      html.push(magicInitiateHtml('bg', rule.fixedSpellList, state.background));
    } else if (rule?.gamingSet) {
      state.background.gamingSet = state.background.gamingSet || ORIGIN.gamingSets[0];
      html.push(`<div class="class-choice-group"><div class="class-choice-head"><strong>Gaming Set</strong><span class="class-choice-count">1つ選択</span></div><p class="mini-note">Soldierの道具習熟として、Gaming Setの種類を決めます。</p><label class="field">Gaming Set<select id="bgGamingSet">${ORIGIN.gamingSets.map(v=>`<option value="${esc(v)}" ${v===state.background.gamingSet?'selected':''}>${esc(v)}</option>`).join('')}</select></label></div>`);
    } else {
      html.push(`<p class="mini-note">この背景特技には、キャラクター作成時の追加選択はありません。</p>`);
    }

    if (isHuman()) {
      state.human.feat = $('humanFeat')?.value || state.human.feat || '';
      html.push(`<div class="class-choice-group"><div class="class-choice-head"><strong>Human：Versatile</strong><span class="class-choice-count">追加Origin Feat</span></div><p class="mini-note">追加Origin Feat：${esc(state.human.feat)}</p></div>`);
      if (state.human.feat === 'Magic Initiate') {
        html.push(magicInitiateHtml('human', '', state.human));
      } else if (state.human.feat === 'Skilled') {
        const options = [
          ...ORIGIN.skills.map(v=>({value:`skill:${v}`,label:`技能：${v}`})),
          ...ORIGIN.tools.map(v=>({value:`tool:${v}`,label:`道具：${v}`}))
        ];
        const set = new Set(state.human.skilled || []);
        html.push(`<div class="class-choice-group"><div class="class-choice-head"><strong>Skilled</strong><span class="class-choice-count">3つ選択</span></div><p class="mini-note">技能または道具から、合計3つ選びます。</p><div class="choice-grid">${options.map(o=>`<label class="check-card"><input type="checkbox" name="humanSkilled" value="${esc(o.value)}" ${set.has(o.value)?'checked':''}><span>${esc(o.label)}</span></label>`).join('')}</div></div>`);
      } else {
        html.push(`<p class="mini-note">${esc(state.human.feat || 'この特技')}には追加選択はありません。</p>`);
      }
    }

    wrap.innerHTML = html.join('');
    bindDynamic();
  }

  function bindDynamic(){
    $('humanSpellList')?.addEventListener('change',()=>{ saveDomState(); render(); });
    ['bgSpellAbility','bgLevel1','bgGamingSet','humanSpellAbility','humanLevel1'].forEach(id => $(id)?.addEventListener('change', saveDomState));
    document.querySelectorAll('input[name="bgCantrip"],input[name="humanCantrip"],input[name="humanSkilled"]').forEach(el => el.addEventListener('change', saveDomState));
  }

  function validate(){
    saveDomState();
    const rule = bgRule();
    if (rule?.feat === 'Magic Initiate') {
      if ((state.background.cantrips || []).length !== 2) return `${SRD.backgrounds[bgId()]?.ja || bgId()}のMagic Initiateでキャントリップを2つ選んでください。`;
      if (!state.background.level1) return `${SRD.backgrounds[bgId()]?.ja || bgId()}のMagic Initiateでレベル1呪文を選んでください。`;
    }
    if (rule?.gamingSet && !state.background.gamingSet) return 'SoldierのGaming Setを1つ選んでください。';

    if (isHuman()) {
      const feat = $('humanFeat')?.value || '';
      if (!validHumanFeats().includes(feat)) return 'Humanの追加Origin Featを選び直してください。';
      if (feat === 'Magic Initiate') {
        if (!state.human.spellList) return 'HumanのMagic Initiateで呪文リストを選んでください。';
        if (state.human.spellList === rule?.fixedSpellList) return 'Magic Initiateを2回取る場合、別の呪文リストを選んでください。';
        if ((state.human.cantrips || []).length !== 2) return 'HumanのMagic Initiateでキャントリップを2つ選んでください。';
        if (!state.human.level1) return 'HumanのMagic Initiateでレベル1呪文を選んでください。';
      }
      if (feat === 'Skilled' && (state.human.skilled || []).length !== 3) return `HumanのSkilledで技能または道具を3つ選んでください。現在は${(state.human.skilled || []).length}個です。`;
    }
    return '';
  }

  function showError(message){
    const box = $('errorBox');
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
    if (message) box.scrollIntoView({block:'nearest'});
  }

  function snapshot(){
    saveDomState();
    const out = {
      background:{ feat:SRD.backgrounds[bgId()]?.feat || backgroundFeatBase(), ...state.background }
    };
    if (isHuman()) out.human = { feat:$('humanFeat')?.value || '', ...state.human };
    return out;
  }

  function enrichGame(game){
    if (!game?.character) return game;
    const data = snapshot();
    game.character.originChoices = data;
    game.character.originSpells = {};

    if (data.background?.spellList) {
      game.character.originSpells.background = {
        feat:data.background.feat,
        spellList:data.background.spellList,
        spellcastingAbility:data.background.ability,
        cantrips:[...(data.background.cantrips || [])],
        level1:data.background.level1 || ''
      };
    }
    if (data.human?.feat === 'Magic Initiate') {
      game.character.originSpells.human = {
        feat:'Magic Initiate',
        spellList:data.human.spellList,
        spellcastingAbility:data.human.ability,
        cantrips:[...(data.human.cantrips || [])],
        level1:data.human.level1 || ''
      };
    }

    if (data.background?.gamingSet) {
      game.character.toolProficiencies = (game.character.toolProficiencies || []).filter(v => !String(v).startsWith('Gaming Set'));
      game.character.toolProficiencies.push(`Gaming Set: ${data.background.gamingSet}`);
      const gamingSetId = window.DDInventory?.resolveItemId(data.background.gamingSet, false);
      const ownedGamingSet = (game.inventory || []).find(item => item.itemId === 'gaming_set');
      if (gamingSetId && ownedGamingSet) ownedGamingSet.itemId = gamingSetId;
    }

    if (data.human?.feat === 'Skilled') {
      const skillAdds = (data.human.skilled || []).filter(v=>v.startsWith('skill:')).map(v=>v.slice(6));
      const toolAdds = (data.human.skilled || []).filter(v=>v.startsWith('tool:')).map(v=>v.slice(5));
      game.character.skills = [...new Set([...(game.character.skills || []), ...skillAdds])];
      game.character.toolProficiencies = [...new Set([...(game.character.toolProficiencies || []), ...toolAdds])];
    }

    game.character.pendingChoices = (game.character.pendingChoices || []).filter(v =>
      !String(v).includes('Magic Initiate') &&
      !String(v).includes('Gaming Setの種類') &&
      !String(v).includes('Human Origin Feat')
    );
    return game;
  }

  const originalSetItem = Storage.prototype.setItem;
  if (!window.__ddOriginStoragePatched) {
    window.__ddOriginStoragePatched = true;
    Storage.prototype.setItem = function(key, value){
      if (this === localStorage && key === 'ddActiveGame') {
        try { value = JSON.stringify(enrichGame(JSON.parse(value))); } catch (_) {}
      }
      return originalSetItem.call(this, key, value);
    };
  }

  $('background')?.addEventListener('change',()=>{ state.background={}; render(); });
  $('species')?.addEventListener('change',()=>{ state.human={}; render(); });
  $('humanFeat')?.addEventListener('change',()=>{ state.human={feat:$('humanFeat').value}; render(); });

  $('nextBtn')?.addEventListener('click', e => {
    const dots = [...document.querySelectorAll('.step-dot')];
    const active = dots.findIndex(dot => dot.classList.contains('active'));
    if (active !== 1) return;
    const err = validate();
    if (!err) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showError(err);
  }, true);

  form.addEventListener('submit', e => {
    const err = validate();
    if (!err) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showError(err);
  }, true);

  render();
})();
