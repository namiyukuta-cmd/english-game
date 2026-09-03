(()=>{
  'use strict';

  function capturedList(state){return Array.isArray(state.capturedMonsters)?state.capturedMonsters:[]}
  function countCaptured(state,target){return capturedList(state).filter(monster=>monster&&monster.name===target).length}
  function discoveredCount(state,floorNumber){const floor=state.magicDungeon?.floors?.[floorNumber];return Array.isArray(floor?.discovered)?floor.discovered.length:0}
  function itemCount(state,id){return Number(state.questItems?.[id]||0)}
  function statValue(state,key){return Number(state.stats?.[key]||0)+Number(state.dailyBuff?.[key]||0)}

  function requirementProgress(state,req){
    if(!req)return {current:0,required:0,met:true};
    if(req.type==='discover'){const current=discoveredCount(state,Number(req.floor||1));const required=Number(req.count||0);return {current,required,met:current>=required}}
    if(req.type==='capture'){const current=countCaptured(state,req.target);const required=Number(req.count||0);return {current,required,met:current>=required}}
    if(req.type==='boss_capture'){const floor=Number(req.floor||1);const met=Boolean(state.bossCaptures?.[floor]);return {current:met?1:0,required:1,met}}
    if(req.type==='item'){const current=itemCount(state,req.id);const required=Number(req.count||0);return {current,required,met:current>=required}}
    if(req.type==='stat'){const current=statValue(state,req.key);const required=Number(req.value||req.count||0);return {current,required,met:current>=required}}
    if(req.type==='flag'){const met=Boolean(state.flags?.[req.id]);return {current:met?1:0,required:1,met}}
    return {current:0,required:1,met:false};
  }

  function requirementsStatus(state,requirements=[]){const details=(Array.isArray(requirements)?requirements:[]).map(req=>({req,...requirementProgress(state,req)}));return {met:details.every(item=>item.met),details}}
  function mainQuestForFloor(floorNumber){return window.MAGIC_MAIN_QUESTS?.[floorNumber]||null}
  function mainQuestStatus(state,floorNumber){const quest=mainQuestForFloor(floorNumber);if(!quest)return {quest:null,met:false,configured:false,details:[]};const status=requirementsStatus(state,quest.requirements);return {quest,configured:true,...status}}
  function sideQuestById(id){return (window.MAGIC_SIDE_QUESTS||[]).find(quest=>quest.id===id)||null}
  function sideQuestStatus(state,questOrId){const quest=typeof questOrId==='string'?sideQuestById(questOrId):questOrId;if(!quest)return {quest:null,met:false,details:[]};return {quest,...requirementsStatus(state,quest.requirements)}}

  function removeCaptured(state,target,count){let left=Math.max(0,Number(count||0));state.capturedMonsters=capturedList(state).filter(monster=>{if(left>0&&monster?.name===target){left-=1;return false}return true})}
  function consumeRequirements(state,requirements=[]){requirements.forEach(req=>{if(req.type==='capture'&&req.consume!==false)removeCaptured(state,req.target,req.count);if(req.type==='item'&&req.consume){if(!state.questItems)state.questItems={};state.questItems[req.id]=Math.max(0,itemCount(state,req.id)-Number(req.count||0))}})}
  function addInventoryItem(state,id,count){if(!Array.isArray(state.inventory))state.inventory=[];const row=state.inventory.find(item=>item?.id===id);if(row)row.qty=Number(row.qty||0)+Number(count||0);else state.inventory.push({id,qty:Number(count||0)})}
  function applyReward(state,reward={}){if(reward.money)state.money=Number(state.money||0)+Number(reward.money||0);if(reward.items&&typeof reward.items==='object'){Object.entries(reward.items).forEach(([id,count])=>addInventoryItem(state,id,count))}}
  function turnInSideQuest(state,questOrId){const status=sideQuestStatus(state,questOrId);if(!status.quest||!status.met)return {ok:false,quest:status.quest,status};consumeRequirements(state,status.quest.requirements);applyReward(state,status.quest.reward||{});if(!Array.isArray(state.completedSideQuests))state.completedSideQuests=[];state.completedSideQuests.push(status.quest.id);return {ok:true,quest:status.quest,status}}
  function rewardText(reward={}){const parts=[];if(reward.money)parts.push(`${reward.money} money`);if(reward.items&&typeof reward.items==='object')Object.entries(reward.items).forEach(([id,count])=>parts.push(`${id} ×${count}`));return parts.join(' / ')||'—'}

  window.MagicQuestEngine={countCaptured,requirementProgress,requirementsStatus,mainQuestForFloor,mainQuestStatus,sideQuestById,sideQuestStatus,turnInSideQuest,rewardText};
})();
