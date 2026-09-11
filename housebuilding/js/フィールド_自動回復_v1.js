const HERB_HEAL_AMOUNT=20;

function flyHerbCardToPlayer(){
  return new Promise(resolve=>{
    const source=inventoryGrid.querySelector('.itemCard[data-item="herb"]');
    if(!source||!playerToken){resolve();return;}

    const from=source.getBoundingClientRect();
    const to=playerToken.getBoundingClientRect();
    const clone=source.cloneNode(true);
    Object.assign(clone.style,{
      position:'fixed',
      left:`${from.left}px`,
      top:`${from.top}px`,
      width:`${from.width}px`,
      height:`${from.height}px`,
      margin:'0',
      zIndex:'9999',
      pointerEvents:'none',
      transition:'left .38s cubic-bezier(.2,.8,.2,1),top .38s cubic-bezier(.2,.8,.2,1),transform .38s ease,opacity .18s ease',
      transform:'scale(1)',
      opacity:'1'
    });
    document.body.appendChild(clone);

    requestAnimationFrame(()=>{
      clone.style.left=`${to.left+(to.width-from.width)/2}px`;
      clone.style.top=`${to.top+(to.height-from.height)/2}px`;
      clone.style.transform='scale(.72)';
    });

    setTimeout(()=>{
      clone.style.opacity='0';
      playerToken.style.filter='brightness(1.8) drop-shadow(0 0 9px rgba(92,210,118,.9))';
    },380);

    setTimeout(()=>{
      clone.remove();
      playerToken.style.filter='';
      resolve();
    },560);
  });
}

async function autoHealIfNeeded(){
  const missing=state.maxHp-state.hp;
  if(missing<HERB_HEAL_AMOUNT||state.herb<=0)return false;

  turnBadge.textContent='AUTO HEAL';
  setMessage('薬草を自動使用');
  await flyHerbCardToPlayer();

  state.herb-=1;
  state.hp=Math.min(state.maxHp,state.hp+HERB_HEAL_AMOUNT);
  renderStatus();
  renderInventory();
  addDamageAt(state.floor,state.playerOrder,`+${HERB_HEAL_AMOUNT}`);
  await delay(300);
  return true;
}

const enemyTurnBeforeAutoHeal=enemyTurn;
enemyTurn=async function(battle){
  const hpBefore=state.hp;
  await enemyTurnBeforeAutoHeal(battle);
  if(state.hp<hpBefore){
    await autoHealIfNeeded();
  }
};
