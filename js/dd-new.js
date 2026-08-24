(() => {
  const SRD = window.DD_SRD_CHARACTER;
  if (!SRD) throw new Error('DD_SRD_CHARACTER is not loaded.');

  const $ = id => document.getElementById(id);
  const form = $('characterForm');
  const panels = [...document.querySelectorAll('.step-panel')];
  const stepDots = [...document.querySelectorAll('.step-dot')];
  const errorBox = $('errorBox');
  let step = 0;
  let rolledPool = null;

  const abilityIds = SRD.abilities.map(a => a[0]);
  const abilityName = Object.fromEntries(SRD.abilities.map(([id, ja, en]) => [id, `${ja} (${en})`]));
  const abilityCost = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
    if (message) errorBox.scrollIntoView({block:'nearest'});
  }

  function showStep(index) {
    step = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => panel.hidden = i !== step);
    stepDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === step);
      dot.classList.toggle('done', i < step);
      dot.setAttribute('aria-current', i === step ? 'step' : 'false');
    });
    $('prevBtn').hidden = step === 0;
    $('nextBtn').hidden = step === panels.length - 1;
    $('submitBtn').hidden = step !== panels.length - 1;
    showError('');
    window.scrollTo({top:0, behavior:'instant'});
    if (step === panels.length - 1) renderSummary();
  }

  function populateStatic() {
    $('className').innerHTML = Object.entries(SRD.classes).map(([id, c]) => `<option value="${id}">${esc(c.ja)} / ${id}</option>`).join('');
    $('background').innerHTML = Object.entries(SRD.backgrounds).map(([id, b]) => `<option value="${id}">${esc(b.ja)}</option>`).join('');
    $('species').innerHTML = Object.entries(SRD.species).map(([id, s]) => `<option value="${id}">${esc(s.ja)} / ${id}</option>`).join('');
    $('alignment').innerHTML = SRD.alignments.map(v => `<option value="${v}">${v}</option>`).join('');
    const langOptions = SRD.languages.map(v => `<option value="${v}">${v}</option>`).join('');
    $('language1').innerHTML = langOptions;
    $('language2').innerHTML = langOptions;
    $('language2').selectedIndex = Math.min(1, SRD.languages.length - 1);
  }

  function currentClass() { return SRD.classes[$('className').value]; }
  function currentBackground() { return SRD.backgrounds[$('background').value]; }
  function currentSpecies() { return SRD.species[$('species').value]; }

  function renderClass() {
    const c = currentClass();
    $('classInfo').innerHTML = `
      <strong>${esc(c.ja)} / ${esc($('className').value)}</strong>
      <span>主要能力：${esc(c.primary)}</span>
      <span>ヒット・ダイス：D${c.hitDie}</span>
      <span>セーヴ習熟：${esc(c.saves.join(' / '))}</span>
      <span>技能：${c.skillCount}個選択</span>`;

    const bgSkills = new Set(currentBackground()?.skills || []);
    $('classSkills').innerHTML = c.skills.map(skill => {
      const duplicate = bgSkills.has(skill);
      return `<label class="check-card ${duplicate ? 'disabled' : ''}">
        <input type="checkbox" name="classSkill" value="${esc(skill)}" ${duplicate ? 'disabled' : ''}>
        <span>${esc(skill)}${duplicate ? '<small>背景ですでに習熟</small>' : ''}</span>
      </label>`;
    }).join('');
    $('skillCountText').textContent = `${c.skillCount}個選んでください。`;

    $('classEquipment').innerHTML = c.equipment.map((eq, i) => `<label class="radio-card">
      <input type="radio" name="classEquipment" value="${eq.id}" ${i === 0 ? 'checked' : ''}>
      <span><strong>${esc(eq.label)}</strong><small>${esc(eq.items.join('、') || `${eq.gp} GP`)}</small></span>
    </label>`).join('');

    if ($('abilityMethod').value === 'standard') applySuggestedArray();
  }

  function renderBackground() {
    const b = currentBackground();
    $('backgroundInfo').innerHTML = `
      <strong>${esc(b.ja)}</strong>
      <span>能力値候補：${b.abilities.map(id => esc(abilityName[id])).join(' / ')}</span>
      <span>特技：${esc(b.feat)}</span>
      <span>技能習熟：${esc(b.skills.join(' / '))}</span>
      <span>道具習熟：${esc(b.tool)}</span>`;

    $('backgroundEquipment').innerHTML = b.equipment.map((eq, i) => `<label class="radio-card">
      <input type="radio" name="backgroundEquipment" value="${eq.id}" ${i === 0 ? 'checked' : ''}>
      <span><strong>${esc(eq.label)}</strong><small>${esc(eq.items.join('、') || `${eq.gp} GP`)}</small></span>
    </label>`).join('');

    const plus2 = $('bonusPlus2');
    const plus1 = $('bonusPlus1');
    const opts = b.abilities.map(id => `<option value="${id}">${esc(abilityName[id])}</option>`).join('');
    plus2.innerHTML = opts;
    plus1.innerHTML = opts;
    plus1.selectedIndex = Math.min(1, b.abilities.length - 1);
    renderClass();
    updateAbilityPreview();
  }

  function renderSpecies() {
    const s = currentSpecies();
    $('speciesInfo').innerHTML = `<strong>${esc(s.ja)}</strong><span>移動速度：${s.speed} ft.</span>`;

    const sizeWrap = $('sizeWrap');
    $('size').innerHTML = s.size.map(v => `<option value="${v}">${v}</option>`).join('');
    sizeWrap.hidden = s.size.length <= 1;

    const variantWrap = $('speciesVariantWrap');
    if (s.variants?.length) {
      variantWrap.hidden = false;
      $('speciesVariantLabel').textContent = s.variantLabel || '系統';
      $('speciesVariant').innerHTML = s.variants.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    } else {
      variantWrap.hidden = true;
      $('speciesVariant').innerHTML = '';
    }

    const humanWrap = $('humanExtraWrap');
    if (s.humanExtra) {
      humanWrap.hidden = false;
      $('humanFeat').innerHTML = SRD.originFeats.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      $('humanSkill').innerHTML = SRD.allSkills.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    } else {
      humanWrap.hidden = true;
    }
  }

  function abilityMode() { return $('abilityMethod').value; }

  function applySuggestedArray() {
    const values = currentClass().suggested;
    abilityIds.forEach((id, i) => $(id).value = values[i]);
    rolledPool = null;
    updateAbilityPreview();
  }

  function roll4d6Keep3() {
    const dice = Array.from({length:4}, () => Math.floor(Math.random() * 6) + 1).sort((a,b) => a-b);
    return dice.slice(1).reduce((a,b) => a+b, 0);
  }

  function rollAbilities() {
    rolledPool = Array.from({length:6}, roll4d6Keep3);
    rolledPool.forEach((value, i) => $(abilityIds[i]).value = value);
    $('rolledPool').textContent = `出目：${rolledPool.join(' / ')}（各値は好きな能力へ入れ替え可能）`;
    updateAbilityPreview();
  }

  function renderAbilityMethod() {
    const mode = abilityMode();
    $('rollBtn').hidden = mode !== 'random';
    $('rolledPool').hidden = mode !== 'random';
    $('pointBuyInfo').hidden = mode !== 'point';
    abilityIds.forEach(id => {
      const input = $(id);
      input.min = mode === 'point' ? '8' : '3';
      input.max = mode === 'point' ? '15' : '18';
    });
    if (mode === 'standard') applySuggestedArray();
    if (mode === 'point') {
      rolledPool = null;
      abilityIds.forEach(id => $(id).value = 8);
      updateAbilityPreview();
    }
    if (mode === 'random' && !rolledPool) {
      abilityIds.forEach(id => $(id).value = 10);
      $('rolledPool').textContent = '「4d6を6回振る」を押してください。';
      updateAbilityPreview();
    }
  }

  function readBaseAbilities() {
    return Object.fromEntries(abilityIds.map(id => [id, Number($(id).value) || 0]));
  }

  function getBackgroundBonuses() {
    const b = currentBackground();
    const result = Object.fromEntries(abilityIds.map(id => [id, 0]));
    if ($('bonusMode').value === 'triple') {
      b.abilities.forEach(id => result[id] = 1);
    } else {
      result[$('bonusPlus2').value] += 2;
      result[$('bonusPlus1').value] += 1;
    }
    return result;
  }

  function modifier(score) { return Math.floor((score - 10) / 2); }
  function fmtMod(v) { return v >= 0 ? `+${v}` : String(v); }

  function updateAbilityPreview() {
    const base = readBaseAbilities();
    const bonus = getBackgroundBonuses();
    abilityIds.forEach(id => {
      const finalScore = Math.min(20, (base[id] || 0) + (bonus[id] || 0));
      $(`${id}Final`).textContent = `${finalScore} (${fmtMod(modifier(finalScore))})`;
    });
    if (abilityMode() === 'point') {
      const spent = abilityIds.reduce((sum, id) => sum + (abilityCost[base[id]] ?? 999), 0);
      const remaining = 27 - spent;
      $('pointBuyInfo').textContent = remaining >= 0 ? `ポイント：${spent}/27（残り ${remaining}）` : `ポイント超過：${spent}/27`;
      $('pointBuyInfo').classList.toggle('bad', remaining < 0);
    }
  }

  function renderBonusMode() {
    $('splitBonusWrap').hidden = $('bonusMode').value !== 'split';
    updateAbilityPreview();
  }

  function checkedSkills() {
    return [...document.querySelectorAll('input[name="classSkill"]:checked')].map(el => el.value);
  }

  function selectedEquipment(name, list) {
    const id = document.querySelector(`input[name="${name}"]:checked`)?.value;
    return list.find(eq => eq.id === id) || list[0];
  }

  function validateStep(index) {
    if (index === 0) {
      const selected = checkedSkills();
      const count = currentClass().skillCount;
      if (selected.length !== count) return `クラス技能を${count}個選んでください。現在は${selected.length}個です。`;
    }
    if (index === 1) {
      if ($('language1').value === $('language2').value) return '追加言語は別々の2つを選んでください。';
    }
    if (index === 2) {
      const mode = abilityMode();
      const base = readBaseAbilities();
      if (mode === 'standard') {
        const got = Object.values(base).sort((a,b) => a-b).join(',');
        if (got !== '8,10,12,13,14,15') return '標準配列では 15・14・13・12・10・8 を1回ずつ使ってください。';
      }
      if (mode === 'random') {
        if (!rolledPool) return 'まず4d6を6回振ってください。';
        const got = Object.values(base).sort((a,b) => a-b).join(',');
        const pool = [...rolledPool].sort((a,b) => a-b).join(',');
        if (got !== pool) return 'ランダム生成で出た6個の値だけを、1回ずつ割り当ててください。';
      }
      if (mode === 'point') {
        if (Object.values(base).some(v => v < 8 || v > 15 || !Number.isInteger(v))) return 'ポイント購入の能力値は8〜15です。';
        const spent = Object.values(base).reduce((sum, v) => sum + (abilityCost[v] ?? 999), 0);
        if (spent > 27) return `ポイントが${spent}/27で超過しています。`;
      }
      if ($('bonusMode').value === 'split' && $('bonusPlus2').value === $('bonusPlus1').value) return '+2と+1は別の能力値を選んでください。';
      const bonus = getBackgroundBonuses();
      if (abilityIds.some(id => base[id] + bonus[id] > 20)) return '背景の上昇後、能力値は20を超えられません。';
    }
    if (index === 4 && !$('name').value.trim()) return '名前を入力してください。';
    return '';
  }

  function renderSummary() {
    const c = currentClass();
    const b = currentBackground();
    const s = currentSpecies();
    const base = readBaseAbilities();
    const bonus = getBackgroundBonuses();
    const final = Object.fromEntries(abilityIds.map(id => [id, base[id] + bonus[id]]));
    const maxHp = Math.max(1, c.hitDie + modifier(final.con));
    const classEq = selectedEquipment('classEquipment', c.equipment);
    const bgEq = selectedEquipment('backgroundEquipment', b.equipment);
    const skills = [...new Set([...b.skills, ...checkedSkills(), ...(s.humanExtra ? [$('humanSkill').value] : [])])];
    const feats = [b.feat, ...(s.humanExtra ? [$('humanFeat').value] : [])];
    const variant = s.variants?.length ? $('speciesVariant').value : '';
    const size = s.size.length > 1 ? $('size').value : s.size[0];

    $('summary').innerHTML = `
      <div class="summary-row"><span>名前</span><strong>${esc($('name').value.trim() || '（未入力）')}</strong></div>
      <div class="summary-row"><span>クラス</span><strong>${esc(c.ja)} Lv.1</strong></div>
      <div class="summary-row"><span>種族</span><strong>${esc(s.ja)}${variant ? ` / ${esc(variant)}` : ''}</strong></div>
      <div class="summary-row"><span>背景</span><strong>${esc(b.ja)}</strong></div>
      <div class="summary-row"><span>属性</span><strong>${esc($('alignment').value)}</strong></div>
      <div class="summary-row"><span>HP</span><strong>${maxHp}</strong></div>
      <div class="summary-row"><span>サイズ / 速度</span><strong>${esc(size)} / ${s.speed} ft.</strong></div>
      <div class="summary-row"><span>技能習熟</span><strong>${esc(skills.join('、'))}</strong></div>
      <div class="summary-row"><span>特技</span><strong>${esc(feats.join('、'))}</strong></div>
      <div class="summary-row"><span>言語</span><strong>Common、${esc($('language1').value)}、${esc($('language2').value)}</strong></div>
      <div class="summary-row"><span>開始GP</span><strong>${classEq.gp + bgEq.gp} GP</strong></div>
      <div class="summary-abilities">${SRD.abilities.map(([id,ja,en]) => `<div><small>${ja} ${en}</small><strong>${final[id]}</strong><span>${fmtMod(modifier(final[id]))}</span></div>`).join('')}</div>`;
  }

  function buildGame() {
    const cId = $('className').value;
    const bId = $('background').value;
    const sId = $('species').value;
    const c = currentClass();
    const b = currentBackground();
    const s = currentSpecies();
    const base = readBaseAbilities();
    const bonus = getBackgroundBonuses();
    const final = Object.fromEntries(abilityIds.map(id => [id, base[id] + bonus[id]]));
    const mods = Object.fromEntries(abilityIds.map(id => [id, modifier(final[id])]));
    const classEq = selectedEquipment('classEquipment', c.equipment);
    const bgEq = selectedEquipment('backgroundEquipment', b.equipment);
    const id = crypto.randomUUID ? crypto.randomUUID() : `dd-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const maxHp = Math.max(1, c.hitDie + mods.con);
    const humanSkills = s.humanExtra ? [$('humanSkill').value] : [];
    const skills = [...new Set([...b.skills, ...checkedSkills(), ...humanSkills])];
    const feats = [b.feat, ...(s.humanExtra ? [$('humanFeat').value] : [])];
    const pending = [...(c.pending || []), ...(b.pending || [])];
    const classItems = classEq.items.map(name => ({name, source:'class'}));
    const bgItems = bgEq.items.map(name => ({name, source:'background'}));

    return {
      id,
      meta:{saveFormat:2,ruleset:'SRD 5.2.1',createdAt:new Date().toISOString(),updatedAt:null},
      character:{
        id,
        name:$('name').value.trim(),
        level:1,
        xp:0,
        className:cId,
        classLabel:c.ja,
        species:sId,
        speciesLabel:s.ja,
        speciesVariant:s.variants?.length ? $('speciesVariant').value : '',
        background:bId,
        backgroundLabel:b.ja,
        alignment:$('alignment').value,
        size:s.size.length > 1 ? $('size').value : s.size[0],
        speed:s.speed,
        hp:maxHp,
        maxHp,
        hitDie:`d${c.hitDie}`,
        proficiencyBonus:2,
        primaryAbility:c.primary,
        savingThrowProficiencies:[...c.saves],
        skillProficiencies:skills,
        toolProficiencies:[b.tool],
        feats,
        languages:['Common',$('language1').value,$('language2').value],
        abilityGeneration:abilityMode(),
        abilityBase:base,
        backgroundAbilityBonus:bonus,
        abilities:final,
        abilityModifiers:mods,
        portrait:'',
        notes:$('notes').value.trim(),
        pendingChoices:pending
      },
      currency:{gp:classEq.gp + bgEq.gp,sp:0,cp:0},
      inventory:[...classItems,...bgItems],
      equipment:[],
      current:{location:'未設定',scene:'start',day:1,time:'朝',background:''},
      currentNpc:null,
      quests:[],
      npcs:[],
      world:{discoveredLocations:[],activeEvents:[]},
      log:[{at:new Date().toISOString(),type:'character-created',text:`${$('name').value.trim()} の冒険を開始`}]
    };
  }

  $('className').addEventListener('change', renderClass);
  $('background').addEventListener('change', renderBackground);
  $('species').addEventListener('change', renderSpecies);
  $('abilityMethod').addEventListener('change', renderAbilityMethod);
  $('rollBtn').addEventListener('click', rollAbilities);
  $('bonusMode').addEventListener('change', renderBonusMode);
  $('bonusPlus2').addEventListener('change', updateAbilityPreview);
  $('bonusPlus1').addEventListener('change', updateAbilityPreview);
  abilityIds.forEach(id => $(id).addEventListener('input', updateAbilityPreview));

  $('nextBtn').addEventListener('click', () => {
    const err = validateStep(step);
    if (err) return showError(err);
    showStep(step + 1);
  });
  $('prevBtn').addEventListener('click', () => showStep(step - 1));

  form.addEventListener('submit', event => {
    event.preventDefault();
    for (let i = 0; i < panels.length; i++) {
      const err = validateStep(i);
      if (err) {
        showStep(i);
        showError(err);
        return;
      }
    }
    const game = buildGame();
    localStorage.setItem('ddActiveGame', JSON.stringify(game));
    location.href = 'DD.html';
  });

  populateStatic();
  renderBackground();
  renderSpecies();
  renderAbilityMethod();
  renderBonusMode();
  showStep(0);
})();
