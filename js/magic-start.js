(()=>{
  'use strict';

  const Store=window.MagicGameState;
  const newGameBtn=document.getElementById('newGameBtn');
  const continueBtn=document.getElementById('continueBtn');
  const saveStatus=document.getElementById('saveStatus');
  const hasSave=!!localStorage.getItem(Store.KEY);

  function startNew(){
    Store.reset();
    location.replace('magic-daily.html?v=20260903-6&new=1');
  }

  function continueGame(){
    const state=Store.load();
    if(state.magicBattle){
      location.replace('magic-battle.html?v=20260903-1');
      return;
    }
    if(state.lastPlace==='DUNGEON'&&state.magicDungeon){
      location.replace('magic-dungeon.html?v=20260903-4');
      return;
    }
    if(state.lastPlace==='MAGIC SCHOOL'){
      location.replace('magic-school.html?v=20260903-9');
      return;
    }
    location.replace('magic-daily.html?v=20260903-6');
  }

  continueBtn.disabled=!hasSave;
  saveStatus.textContent=hasSave?'保存データがあります。':'保存データはありません。';

  newGameBtn.onclick=startNew;
  continueBtn.onclick=continueGame;
})();
