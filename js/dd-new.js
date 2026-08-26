(() => {
  const SRD = window.DD_SRD_CHARACTER;
  const EXTRA = window.DD_CLASS_OPTIONS;
  if (!SRD || !EXTRA) throw new Error('D&D character data is not loaded.');

  const $ = id => document.getElementById(id);
  const form = $('characterForm');
  const panels = [...document.querySelectorAll('.step-panel')];
  const stepDots = [...document.querySelectorAll('.step-dot')];
  const errorBox = $('errorBox');
  const abilityIds = SRD.abilities.map(a => a[0]);
  const abilityName = Object.fromEntries(SRD.abilities.map(([id, ja, en]) => [id, `${ja} (${en})`]));
  const abilityCost = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  let step = 0;
  let rolledPool = null;
  let classChoiceState = {};

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const optionValue = o => typeof o === 'string' ? o : o.value;
  const optionLabel = o => typeof o === 'string' ? o : (o.label || o.value);
  const optionDesc = o => typeof o === 'string' ? '' : (o.desc || '');

  function showError(message) {
    errorBox.textContent = message || '';
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
    if (step === 2) renderClassDetails();
    if (step === panels.length - 1) renderSummary();
    window.scrollTo({top:0, behavior:'instant'});
  }

  function currentClassId(){ return $('className').value; }
  function currentClass(){ return SRD.classes[currentClassId()]; }
  function currentExtra(){ return EXTRA.classes[currentClassId()]; }
  function currentBackground(){ return SRD.backgrounds[$('background').value]; }
  function currentSpecies(){ return SRD.species[$('species').value]; }

  function populateStatic() {
    $('className').innerHTML = Object.entries(SRD.classes).map(([id,c]) => `<option value="${id}">${esc(c.ja)} / ${esc(id)}</option>`).join('');
    $('background').innerHTML = Object.entries(SRD.backgrounds).map(([id,b]) => `<option value="${id}">${esc(b.ja)}</option>`).join('');
    $('species').innerHTML = Object.entries(SRD.species).map(([id,s]) => `<option value="${id}">${esc(s.ja)} / ${esc(id)}</option>`).join('');
    $('alignment').innerHTML = SRD.alignments.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    const lang = SRD.languages.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    $('language1').innerHTML = lang;
    $('language2').innerHTML = lang;
    $('language2').selectedIndex = Math.min(1, SRD.languages.length - 1);
  }

  function renderClass() {
    const c = currentClass();
    $('classInfo').innerHTML = `<strong>${esc(c.ja)} / ${esc(currentClassId())}</strong><span>主要能力：${esc(c.primary)}</span><span>ヒット・ダイス：D${c.hitDie}</span><span>セーヴ習熟：${esc(c.saves.join(' / '))}</span><span>クラス技能：${c.skillCount}個（出自を選んだ後に決定）</span>`;
    $('classEquipment').innerHTML = c.equipment.map((eq,i) => `<label class="radio-card"><input type="radio" name="classEquipment" value="${esc(eq.id)}" ${i===0?'checked':''}><span><strong>${esc(eq.label)}</strong><small>${esc(eq.items.join('、') || `${eq.gp} GP`)}</small></span></label>`).join('');
    if ($('abilityMethod').value === 'standard') applySuggestedArray();
  }

  function renderBackground() {
    const b = currentBackground();
    $('backgroundInfo').innerHTML = `<strong>${esc(b.ja)}</strong><span>能力値候補：${b.abilities.map(id=>esc(abilityName[id])).join(' / ')}</span><span>特技：${esc(b.feat)}</span><span>技能習熟：${esc(b.skills.join(' / '))}</span><span>道具習熟：${esc(b.tool)}</span>`;
    $('backgroundEquipment').innerHTML = b.equipment.map((eq,i) => `<label class="radio-card"><input type="radio" name="backgroundEquipment" value="${esc(eq.id)}" ${i===0?'checked':''}><span><strong>${esc(eq.label)}</strong><small>${esc(eq.items.join('、') || `${eq.gp} GP`)}</small></span></label>`).join('');
    const opts = b.abilities.map(id => `<option value="${id}">${esc(abilityName[id])}</option>`).join('');
    $('bonusPlus2').innerHTML = opts;
    $('bonusPlus1').innerHTML = opts;
    $('bonusPlus1').selectedIndex = Math.min(1,b.abilities.length-1);
    classChoiceState = {};
    updateAbilityPreview();
  }

  function renderSpecies() {
    const s = currentSpecies();
    $('speciesInfo').innerHTML = `<strong>${esc(s.ja)}</strong><span>移動速度：${s.speed} ft.</span>`;
    $('size').innerHTML = s.size.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    $('sizeWrap').hidden = s.size.length <= 1;
    if (s.variants?.length) {
      $('speciesVariantWrap').hidden = false;
      $('speciesVariantLabel').textContent = s.variantLabel || '系統';
      $('speciesVariant').innerHTML = s.variants.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    } else {
      $('speciesVariantWrap').hidden = true;
      $('speciesVariant').innerHTML = '';
    }
    if (s.humanExtra) {
      $('humanExtraWrap').hidden = false;
      $('humanFeat').innerHTML = SRD.originFeats.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      $('humanSkill').innerHTML = SRD.allSkills.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    } else {
      $('humanExtraWrap').hidden = true;
    }
    classChoiceState = {};
  }

  function renderBonusMode(){ $('splitBonusWrap').hidden = $('bonusMode').value !== 'split'; updateAbilityPreview(); }

  function renderClassSkills() {
    const c = currentClass();
    const b = currentBackground();
    const s = currentSpecies();
    const unavailable = new Set(b.skills || []);
    if (s.humanExtra) unavailable.add($('humanSkill').value);
    const old = new Set([...document.querySelectorAll('input[name="classSkill"]:checked')].map(el=>el.value));
    $('classSkills').innerHTML = c.skills.map(skill => {
      const disabled = unavailable.has(skill);
      const checked = old.has(skill) && !disabled;
      return `<label class="check-card ${disabled?'disabled':''}"><input type="checkbox" name="classSkill" value="${esc(skill)}" ${disabled?'disabled':''} ${checked?'checked':''}><span>${esc(skill)}${disabled?'<small>出自ですでに習熟</small>':''}</span></label>`;
    }).join('');
    $('skillCountText').textContent = `${c.skillCount}個選んでください。背景・種族で得た技能とは重複できません。`;
  }

  function checkedClassSkills(){ return [...document.querySelectorAll('input[name="classSkill"]:checked')].map(el=>el.value); }
  function proficientSkills(){
    const s = currentSpecies();
    return [...new Set([...(currentBackground().skills||[]), ...checkedClassSkills(), ...(s.humanExtra?[$('humanSkill').value]:[])])];
  }

  function selectedEquipment(name,list){
    const id = document.querySelector(`input[name="${name}"]:checked`)?.value;
    return list.find(eq=>eq.id===id) || list[0];
  }

  function groupVisible(group){
    if (!group.condition) return true;
    if (group.condition.kind === 'classEquipment') {
      return document.querySelector('input[name="classEquipment"]:checked')?.value === group.condition.equals;
    }
    return true;
  }

  function groupOptions(group, working) {
    if (group.source === 'proficientSkills') return proficientSkills();
    if (group.source?.startsWith('selected:')) return working[group.source.slice(9)] || [];
    return group.options || [];
  }

  function requiredCount(group, working){
    let count = group.count || 1;
    if (group.countWhen && working[group.countWhen.group] === group.countWhen.equals) count += group.countWhen.add || 0;
    return count;
  }

  function defaultsFor(group, options, working){
    const vals = options.map(optionValue);
    if (group.type === 'single') {
      const rec = (group.recommended||[]).find(v=>vals.includes(v));
      return rec || vals[0] || '';
    }
    const count = requiredCount(group,working);
    const out = [];
    for (const v of (group.recommended||[])) if (vals.includes(v) && !out.includes(v) && out.length<count) out.push(v);
    for (const v of vals) if (!out.includes(v) && out.length<count) out.push(v);
    return out;
  }

  function readClassChoiceDom(){
    const data = {};
    for (const group of currentExtra().groups) {
      if (!groupVisible(group)) continue;
      if (group.type === 'single') data[group.id] = document.querySelector(`input[name="extra_${group.id}"]:checked`)?.value || '';
      else data[group.id] = [...document.querySelectorAll(`input[name="extra_${group.id}"]:checked`)].map(el=>el.value);
    }
    return data;
  }

  function renderClassChoiceGroups(seed=null) {
    const extra = currentExtra();
    const working = seed ? structuredClone(seed) : structuredClone(classChoiceState || {});
    const html = [];
    for (const group of extra.groups) {
      if (!groupVisible(group)) { delete working[group.id]; continue; }
      const options = groupOptions(group,working);
      const vals = options.map(optionValue);
      let selected = working[group.id];
      if (group.type === 'single') {
        if (!vals.includes(selected)) selected = defaultsFor(group,options,working);
      } else {
        const count = requiredCount(group,working);
        selected = Array.isArray(selected) ? selected.filter(v=>vals.includes(v)) : [];
        if (!selected.length) selected = defaultsFor(group,options,working);
        if (selected.length > count) selected = selected.slice(0,count);
      }
      working[group.id] = selected;
      const count = group.type==='multi' ? requiredCount(group,working) : 1;
      html.push(`<section class="class-choice-group" data-group="${esc(group.id)}"><div class="class-choice-head"><strong>${esc(group.title)}</strong><span class="class-choice-count">${group.type==='multi'?`${count}個選択`:'1つ選択'}</span></div>${group.note?`<p class="mini-note">${esc(group.note)}</p>`:''}<div class="choice-grid">`);
      for (const opt of options) {
        const value = optionValue(opt), label=optionLabel(opt), desc=optionDesc(opt);
        const checked = group.type==='single' ? selected===value : selected.includes(value);
        const type = group.type==='single'?'radio':'checkbox';
        html.push(`<label class="${group.type==='single'?'radio-card':'check-card'}"><input type="${type}" name="extra_${esc(group.id)}" value="${esc(value)}" ${checked?'checked':''}><span><strong>${esc(label)}</strong>${desc?`<small>${esc(desc)}</small>`:''}</span></label>`);
      }
      html.push('</div></section>');
    }
    classChoiceState = working;
    $('classChoiceGroups').innerHTML = html.join('');

    for (const group of extra.groups) {
      const affects = extra.groups.some(g => g.countWhen?.group===group.id || g.source===`selected:${group.id}`);
      if (!affects) continue;
      document.querySelectorAll(`[name="extra_${CSS.escape(group.id)}"]`).forEach(el=>el.addEventListener('change',()=>{
        classChoiceState = readClassChoiceDom();
        renderClassChoiceGroups(classChoiceState);
      }));
    }
  }

  function renderClassDetails(){
    const c=currentClass(), extra=currentExtra();
    $('classChoiceIntro').innerHTML = `<strong>${esc(c.ja)} Lv.1</strong><span>自動取得：${esc((extra.automatic||[]).join(' / ') || 'なし')}</span><span>下の項目が、キャラクター作成時に決めるクラス固有の選択です。</span>`;
    renderClassSkills();
    renderClassChoiceGroups(classChoiceState);
  }

  function abilityMode(){ return $('abilityMethod').value; }
  function applySuggestedArray(){ const vals=currentClass().suggested; abilityIds.forEach((id,i)=>$(id).value=vals[i]); rolledPool=null; updateAbilityPreview(); }
  function roll4d6Keep3(){ const d=Array.from({length:4},()=>Math.floor(Math.random()*6)+1).sort((a,b)=>a-b); return d.slice(1).reduce((a,b)=>a+b,0); }
  function rollAbilities(){ rolledPool=Array.from({length:6},roll4d6Keep3); rolledPool.forEach((v,i)=>$(abilityIds[i]).value=v); $('rolledPool').textContent=`出目：${rolledPool.join(' / ')}（6個を好きな能力へ入れ替え可）`; updateAbilityPreview(); }
  function renderAbilityMethod(){
    const mode=abilityMode(); $('rollBtn').hidden=mode!=='random'; $('rolledPool').hidden=mode!=='random'; $('pointBuyInfo').hidden=mode!=='point';
    abilityIds.forEach(id=>{ $(id).min=mode==='point'?'8':'3'; $(id).max=mode==='point'?'15':'18'; });
    if(mode==='standard') applySuggestedArray();
    if(mode==='point'){ rolledPool=null; abilityIds.forEach(id=>$(id).value=8); updateAbilityPreview(); }
    if(mode==='random'&&!rolledPool){ abilityIds.forEach(id=>$(id).value=10); $('rolledPool').textContent='「4d6を6回振る」を押してください。'; updateAbilityPreview(); }
  }
  function readBaseAbilities(){ return Object.fromEntries(abilityIds.map(id=>[id,Number($(id).value)||0])); }
  function getBackgroundBonuses(){
    const b=currentBackground(), result=Object.fromEntries(abilityIds.map(id=>[id,0]));
    if($('bonusMode').value==='triple') b.abilities.forEach(id=>result[id]=1);
    else { result[$('bonusPlus2').value]+=2; result[$('bonusPlus1').value]+=1; }
    return result;
  }
  const modifier = score => Math.floor((score-10)/2);
  const fmtMod = v => v>=0?`+${v}`:String(v);
  function updateAbilityPreview(){
    const base=readBaseAbilities(), bonus=getBackgroundBonuses();
    abilityIds.forEach(id=>{ const final=Math.min(20,(base[id]||0)+(bonus[id]||0)); $(`${id}Final`).textContent=`${final} (${fmtMod(modifier(final))})`; });
    if(abilityMode()==='point'){
      const spent=abilityIds.reduce((sum,id)=>sum+(abilityCost[base[id]]??999),0), remaining=27-spent;
      $('pointBuyInfo').textContent=remaining>=0?`ポイント：${spent}/27（残り ${remaining}）`:`ポイント超過：${spent}/27`;
      $('pointBuyInfo').classList.toggle('bad',remaining<0);
    }
  }

  function validateClassDetails(){
    const c=currentClass();
    const skills=checkedClassSkills();
    if(skills.length!==c.skillCount) return `クラス技能を${c.skillCount}個選んでください。現在は${skills.length}個です。`;
    const working=readClassChoiceDom();
    for(const group of currentExtra().groups){
      if(!groupVisible(group)) continue;
      const value=working[group.id];
      if(group.type==='single' && !value) return `${group.title}を1つ選んでください。`;
      if(group.type==='multi'){
        const need=requiredCount(group,working), got=Array.isArray(value)?value.length:0;
        if(got!==need) return `${group.title}を${need}個選んでください。現在は${got}個です。`;
      }
    }
    classChoiceState=working;
    return '';
  }

  function validateStep(index){
    if(index===1){
      if($('language1').value===$('language2').value) return '追加言語は別々の2つを選んでください。';
      if($('bonusMode').value==='split' && $('bonusPlus2').value===$('bonusPlus1').value) return '+2と+1は別の能力値を選んでください。';
      if(currentSpecies().humanExtra && currentBackground().skills.includes($('humanSkill').value)) return 'ヒューマンの追加技能は、背景ですでに習熟している技能とは別にしてください。';
    }
    if(index===2) return validateClassDetails();
    if(index===3){
      const mode=abilityMode(), base=readBaseAbilities();
      if(mode==='standard' && Object.values(base).sort((a,b)=>a-b).join(',')!=='8,10,12,13,14,15') return '標準配列では 15・14・13・12・10・8 を1回ずつ使ってください。';
      if(mode==='random'){
        if(!rolledPool) return 'まず4d6を6回振ってください。';
        if(Object.values(base).sort((a,b)=>a-b).join(',')!==[...rolledPool].sort((a,b)=>a-b).join(',')) return 'ランダム生成で出た6個の値だけを1回ずつ割り当ててください。';
      }
      if(mode==='point'){
        if(Object.values(base).some(v=>v<8||v>15||!Number.isInteger(v))) return 'ポイント購入の能力値は8〜15です。';
        const spent=Object.values(base).reduce((sum,v)=>sum+(abilityCost[v]??999),0); if(spent>27) return `ポイントが${spent}/27で超過しています。`;
      }
      const bonus=getBackgroundBonuses(); if(abilityIds.some(id=>base[id]+bonus[id]>20)) return '背景の上昇後、能力値は20を超えられません。';
    }
    if(index===5 && !$('name').value.trim()) return '名前を入力してください。';
    return '';
  }

  function allClassChoices(){ classChoiceState=readClassChoiceDom(); return structuredClone(classChoiceState); }

  function renderSummary(){
    const c=currentClass(), b=currentBackground(), s=currentSpecies(), extra=currentExtra();
    const base=readBaseAbilities(), bonus=getBackgroundBonuses();
    const final=Object.fromEntries(abilityIds.map(id=>[id,base[id]+bonus[id]]));
    const maxHp=Math.max(1,c.hitDie+modifier(final.con));
    const choices=allClassChoices();
    const rows=Object.entries(choices).map(([id,v])=>{ const g=extra.groups.find(x=>x.id===id); return `<div class="summary-row"><span>${esc(g?.title||id)}</span><strong>${esc(Array.isArray(v)?v.join(' / '):v)}</strong></div>`; }).join('');
    const variant=s.variants?.length?$('speciesVariant').value:'';
    $('summary').innerHTML=`
      <div class="summary-row"><span>名前</span><strong>${esc($('name').value.trim()||'（未入力）')}</strong></div>
      <div class="summary-row"><span>クラス</span><strong>${esc(c.ja)} Lv.1</strong></div>
      <div class="summary-row"><span>種族</span><strong>${esc(s.ja)}${variant?` / ${esc(variant)}`:''}</strong></div>
      <div class="summary-row"><span>背景</span><strong>${esc(b.ja)}</strong></div>
      <div class="summary-row"><span>属性</span><strong>${esc($('alignment').value)}</strong></div>
      <div class="summary-row"><span>HP</span><strong>${maxHp}</strong></div>
      <div class="summary-row"><span>技能</span><strong>${esc(proficientSkills().join(' / '))}</strong></div>
      ${rows}
      <div class="summary-abilities">${abilityIds.map(id=>`<div><small>${esc(id.toUpperCase())}</small><strong>${final[id]}</strong><span>${fmtMod(modifier(final[id]))}</span></div>`).join('')}</div>`;
  }

  function replaceStartingItem(name, choices){
    const text=String(name||'');
    if(text.includes('Artisan’s Tools または Musical Instrument（1つ選択）')){
      return choices.toolProficiency||'Artisan’s Tools or Musical Instrument';
    }
    if(text.includes('Musical Instrument（1つ選択）')){
      return choices.startingInstrument||choices.instrumentProficiencies?.[0]||'Musical Instrument';
    }
    return text;
  }

  function makeGame(){
    const c=currentClass(), b=currentBackground(), s=currentSpecies(), extra=currentExtra();
    const base=readBaseAbilities(), bonus=getBackgroundBonuses();
    const abilities=Object.fromEntries(abilityIds.map(id=>[id,base[id]+bonus[id]]));
    const maxHp=Math.max(1,c.hitDie+modifier(abilities.con));
    const classEq=selectedEquipment('classEquipment',c.equipment), bgEq=selectedEquipment('backgroundEquipment',b.equipment);
    const id=crypto.randomUUID?crypto.randomUUID():`dd-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const choices=allClassChoices();
    const sVariant=s.variants?.length?$('speciesVariant').value:'';
    const size=s.size.length>1?$('size').value:s.size[0];
    const languages=['Common',$('language1').value,$('language2').value];
    if(currentClassId()==='Rogue' && choices.thievesCantLanguage) languages.push("Thieves' Cant",choices.thievesCantLanguage);
    if(currentClassId()==='Druid') languages.push('Druidic');
    const feats=[b.feat,...(s.humanExtra?[$('humanFeat').value]:[])];
    const inventoryNames=[...classEq.items,...bgEq.items].map(name=>replaceStartingItem(name,choices));
    const inventory=DDInventory.createItems(inventoryNames);
    const pending=[...(b.pending||[])];
    if(s.humanExtra && ['Magic Initiate','Skilled'].includes($('humanFeat').value)) pending.push(`Human Origin Feat「${$('humanFeat').value}」の詳細選択`);
    return {
      id,
      meta:{saveFormat:2,inventoryFormat:1,rules:'SRD 5.2.1',createdAt:new Date().toISOString(),updatedAt:null},
      character:{
        id,name:$('name').value.trim(),level:1,xp:0,className:currentClassId(),classNameJa:c.ja,
        hitDie:`d${c.hitDie}`,proficiencyBonus:2,primaryAbility:c.primary,saveProficiencies:c.saves,
        species:$('species').value,speciesJa:s.ja,speciesVariant:sVariant,size,speed:s.speed,
        background:$('background').value,backgroundJa:b.ja,alignment:$('alignment').value,
        hp:maxHp,maxHp,abilities,abilityBase:base,abilityBonuses:bonus,
        skills:proficientSkills(),languages:[...new Set(languages)],feats:[...new Set(feats)],
        toolProficiencies:[b.tool],classFeatures:extra.automatic||[],classChoices:choices,
        portrait:$('portrait').value.trim(),notes:$('characterNotes').value.trim(),pendingChoices:pending
      },
      currency:{gp:(classEq.gp||0)+(bgEq.gp||0),sp:0,cp:0},
      inventory,
      equipment:[],quests:[],npcs:[],world:{discoveredLocations:[],activeEvents:[]},
      current:{location:'未設定',scene:'start',day:1,time:'朝',background:''},currentNpc:null,log:[]
    };
  }

  $('className').addEventListener('change',()=>{ classChoiceState={}; renderClass(); });
  $('background').addEventListener('change',()=>{ classChoiceState={}; renderBackground(); });
  $('species').addEventListener('change',()=>{ classChoiceState={}; renderSpecies(); });
  $('humanSkill').addEventListener('change',()=>{ classChoiceState={}; });
  $('bonusMode').addEventListener('change',renderBonusMode);
  $('bonusPlus2').addEventListener('change',updateAbilityPreview); $('bonusPlus1').addEventListener('change',updateAbilityPreview);
  $('abilityMethod').addEventListener('change',renderAbilityMethod); $('rollBtn').addEventListener('click',rollAbilities);
  abilityIds.forEach(id=>$(id).addEventListener('input',updateAbilityPreview));
  document.addEventListener('change',e=>{ if(e.target?.name==='classEquipment') classChoiceState={}; });
  $('prevBtn').addEventListener('click',()=>showStep(step-1));
  $('nextBtn').addEventListener('click',()=>{ const err=validateStep(step); if(err){showError(err);return;} showStep(step+1); });
  form.addEventListener('submit',e=>{ e.preventDefault(); const err=validateStep(step); if(err){showError(err);return;} const game=makeGame(); localStorage.setItem('ddActiveGame',JSON.stringify(game)); location.href='DD.html'; });

  populateStatic(); renderClass(); renderBackground(); renderSpecies(); renderBonusMode(); renderAbilityMethod(); showStep(0);
})();
