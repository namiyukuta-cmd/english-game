/*
 * Origin/background choice data based on System Reference Document 5.2.1.
 * This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1")
 * by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
 * The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License.
 */
window.DD_ORIGIN_OPTIONS = (() => {
  const SRD = window.DD_SRD_CHARACTER;
  const CLASS = window.DD_CLASS_OPTIONS;

  const originFeats = ['Alert', 'Magic Initiate', 'Savage Attacker', 'Skilled'];
  if (SRD) SRD.originFeats = [...originFeats];

  const spellLists = {
    Cleric: CLASS?.spells?.Cleric || {cantrips:[], level1:[]},
    Druid: CLASS?.spells?.Druid || {cantrips:[], level1:[]},
    Wizard: CLASS?.spells?.Wizard || {cantrips:[], level1:[]}
  };

  const gamingSets = ['Dice Set', 'Dragonchess Set', 'Playing Card Set', 'Three-Dragon Ante Set'];
  const otherTools = [
    'Disguise Kit', 'Forgery Kit', 'Herbalism Kit', "Navigator's Tools", "Poisoner's Kit", "Thieves' Tools",
    ...gamingSets
  ];
  const tools = [...new Set([...(CLASS?.artisanTools || []), ...(CLASS?.instruments || []), ...otherTools])];

  const backgrounds = {
    Acolyte: {feat:'Magic Initiate', fixedSpellList:'Cleric'},
    Criminal: {feat:'Alert'},
    Sage: {feat:'Magic Initiate', fixedSpellList:'Wizard'},
    Soldier: {feat:'Savage Attacker', gamingSet:true}
  };

  return {
    originFeats,
    repeatableFeats:['Magic Initiate','Skilled'],
    spellLists,
    gamingSets,
    tools,
    skills: SRD?.allSkills || [],
    backgrounds
  };
})();
