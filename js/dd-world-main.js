(() => {
  'use strict';

  const DATA = window.DD_WORLD_DATA;
  const MAIN = window.DDMain;
  if (!DATA || !MAIN) return;

  const ACTIVE_KEY = 'ddActiveGame';

  const readGame = () => MAIN.getGame();
  const saveGame = game => localStorage.setItem(ACTIVE_KEY, JSON.stringify(game));
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function region() {
    return DATA.regions?.[DATA.world?.playableRegionId] || null;
  }

  function townById(id) {
    return DATA.towns?.[id] || null;
  }

  function areaById(id) {
    return DATA.areas?.[id] || null;
  }

  function currentSettlementId(game) {
    return game?.worldPosition?.settlementId
      || game?.location?.settlementId
      || game?.current?.settlementId
      || '';
  }

  function addLog(game, text) {
    game.log = Array.isArray(game.log) ? game.log : [];
    game.log.push({
      type:'travel',
      text,
      location:game.location?.label || game.current?.location || '',
      time:game.time ? `第${game.time.day || 1}日 ${String(game.time.hour ?? 8).padStart(2,'0')}:${String(game.time.minute ?? 0).padStart(2,'0')}` : ''
    });
  }

  function advanceMinutes(game, minutes) {
    game.time = game.time || {day:1,hour:8,minute:0};
    const amount = Math.max(0, Number(minutes || 0));
    let total = Number(game.time.hour || 0) * 60 + Number(game.time.minute || 0) + amount;
    let day = Number(game.time.day || 1);
    while (total >= 1440) {
      total -= 1440;
      day += 1;
    }
    game.time.day = day;
    game.time.hour = Math.floor(total / 60);
    game.time.minute = total % 60;
    game.current = game.current || {};
    game.current.day = day;
    game.current.time = `${String(game.time.hour).padStart(2,'0')}:${String(game.time.minute).padStart(2,'0')}`;
  }

  function discover(game, id) {
    game.world = game.world || {};
    game.world.discoveredLocations = Array.isArray(game.world.discoveredLocations) ? game.world.discoveredLocations : [];
    if (id && !game.world.discoveredLocations.includes(id)) game.world.discoveredLocations.push(id);
  }

  function placeLabel(town, place) {
    return `${town.nameJa}・${place.nameJa}`;
  }

  function squareActions(town) {
    const start = town.places?.[town.startPlaceId];
    const ids = Array.isArray(start?.exits) ? start.exits : [];
    const actions = ids.map(id => {
      const place = town.places?.[id];
      return place ? {
        id:`world-open-${town.id}-${id}`,
        label:place.nameJa,
        kind:'worldOpenPlace',
        settlementId:town.id,
        placeId:id
      } : null;
    }).filter(Boolean);
    actions.push({id:`world-leave-${town.id}`,label:'街の外へ',kind:'worldLeaveSettlement',settlementId:town.id});
    return actions;
  }

  function setSettlement(game, settlementId, {log=true} = {}) {
    const town = townById(settlementId);
    if (!town) return false;

    game.worldPosition = game.worldPosition || {};
    game.worldPosition.settlementId = settlementId;
    game.worldPosition.regionId = town.regionId;
    game.location = {
      worldId:DATA.world.id,
      regionId:town.regionId,
      settlementId:town.id,
      label:town.nameJa
    };
    game.current = {
      mode:town.type === 'village' ? 'village' : 'town',
      worldId:DATA.world.id,
      regionId:town.regionId,
      settlementId:town.id,
      location:town.nameJa,
      description:town.description || '',
      background:'',
      actions:squareActions(town)
    };
    discover(game, town.regionId);
    discover(game, town.id);
    if (log) addLog(game, `${town.nameJa}へ入った。`);
    MAIN.setGame(game);
    return true;
  }

  function placeBaseActions(town, place) {
    const actions = [];
    if (place.type === 'tavern') {
      actions.push({id:'world-quest-board',label:'依頼を見る',kind:'worldQuestBoard',board:'tavern'});
      actions.push({id:'world-tavern-eat',label:'飲食する',kind:'worldMessage',message:'食事と飲み物を注文した。'});
      actions.push({id:'world-tavern-rest',label:'泊まる',kind:'worldRest',hours:8,message:'酒場の部屋で休んだ。'});
    } else if (place.type === 'inn') {
      actions.push({id:'world-inn-rest',label:'泊まる',kind:'worldRest',hours:8,message:'宿で一晩休んだ。'});
    } else if (place.type === 'shop') {
      actions.push({id:`world-shop-buy-${place.id}`,label:'買う',kind:'worldMessage',message:'買い物機能はアイテムデータ作成後に接続します。'});
      actions.push({id:`world-shop-sell-${place.id}`,label:'売る',kind:'worldMessage',message:'売却機能はアイテムデータ作成後に接続します。'});
    } else if (place.type === 'apothecary') {
      actions.push({id:'world-apothecary-buy',label:'買う',kind:'worldMessage',message:'薬屋の商品データはこれから追加します。'});
      actions.push({id:'world-apothecary-board',label:'店主の依頼を見る',kind:'worldQuestBoard',board:'shop_apothecary'});
    } else if (place.type === 'church') {
      actions.push({id:'world-church-pray',label:'祈る',kind:'worldMessage',message:'静かに祈りを捧げた。'});
    }

    actions.push({
      id:`world-return-${town.id}`,
      label:town.type === 'village' ? '村へ戻る' : '街へ戻る',
      kind:'worldReturnSettlement',
      settlementId:town.id
    });
    return actions;
  }

  function openPlace(game, settlementId, placeId) {
    const town = townById(settlementId);
    const place = town?.places?.[placeId];
    if (!town || !place) return false;

    game.worldPosition = game.worldPosition || {};
    game.worldPosition.settlementId = town.id;
    game.worldPosition.placeId = place.id;

    game.location = {
      worldId:DATA.world.id,
      regionId:town.regionId,
      placeId:place.id,
      label:placeLabel(town, place)
    };
    game.current = {
      mode:'place',
      worldId:DATA.world.id,
      regionId:town.regionId,
      placeId:place.id,
      location:place.nameJa,
      description:place.description || '',
      background:'',
      actions:placeBaseActions(town, place)
    };
    advanceMinutes(game, 10);
    addLog(game, `${place.nameJa}へ移動した。`);
    MAIN.setGame(game);
    return true;
  }

  function worldActions() {
    const r = region();
    return (r?.landmarks || []).filter(point => point.playable).map(point => ({
      id:`world-travel-${point.id}`,
      label:point.nameJa,
      kind:'worldTravel',
      targetId:point.id,
      targetKind:point.kind,
      settlementId:point.settlementId || '',
      travelMinutes:Number(point.travelMinutes || 0)
    }));
  }

  function setWorld(game, fromSettlementId='') {
    const r = region();
    if (!r) return false;
    game.worldPosition = game.worldPosition || {};
    if (fromSettlementId) game.worldPosition.lastSettlementId = fromSettlementId;
    delete game.worldPosition.placeId;
    delete game.worldPosition.settlementId;

    game.location = {
      worldId:DATA.world.id,
      regionId:r.id,
      label:r.nameJa
    };
    game.current = {
      mode:'world',
      worldId:DATA.world.id,
      regionId:r.id,
      location:r.nameJa,
      description:r.description || '',
      background:'',
      actions:worldActions()
    };
    MAIN.setGame(game);
    return true;
  }

  function setArea(game, areaId) {
    const area = areaById(areaId);
    if (!area) return false;
    game.worldPosition = game.worldPosition || {};
    game.worldPosition.areaId = area.id;
    game.location = {
      worldId:DATA.world.id,
      regionId:region()?.id || '',
      locationId:area.id,
      label:area.nameJa
    };
    game.current = {
      mode:area.type || 'wilderness',
      worldId:DATA.world.id,
      regionId:region()?.id || '',
      locationId:area.id,
      location:area.nameJa,
      description:area.description || '',
      background:'',
      actions:[
        {id:`world-area-look-${area.id}`,label:'周囲を調べる',kind:'worldMessage',message:`${area.nameJa}を注意深く調べた。`},
        {id:`world-area-back-${area.id}`,label:'世界へ戻る',kind:'worldBackToMap'}
      ]
    };
    discover(game, area.id);
    addLog(game, `${area.nameJa}へ到着した。`);
    MAIN.setGame(game);
    return true;
  }

  function travel(game, action) {
    const minutes = Number(action.travelMinutes || 0);
    if (minutes > 0) advanceMinutes(game, minutes);
    if (action.targetKind === 'settlement' && action.settlementId) {
      const town = townById(action.settlementId);
      addLog(game, `${town?.nameJa || action.label}へ向かった。`);
      return setSettlement(game, action.settlementId, {log:false});
    }
    addLog(game, `${action.label}へ向かった。`);
    return setArea(game, action.targetId);
  }

  function rest(game, action) {
    const hours = Math.max(1, Number(action.hours || 8));
    advanceMinutes(game, hours * 60);
    const c = game.character || {};
    if (c.maxHp != null) c.hp = c.maxHp;
    game.current.description = `${game.current.description || ''}\n\n${action.message || '休息を取った。'} HPは最大まで回復した。`;
    addLog(game, action.message || '休息を取った。');
    MAIN.setGame(game);
  }

  function initialize() {
    const game = readGame();
    if (!game) return;
    game.world = game.world || {};
    game.worldPosition = game.worldPosition || {};

    const mode = String(game.current?.mode || '');
    const label = String(game.location?.label || game.current?.location || '').trim();
    const uninitialized = !mode || !label || label === '未設定' || label === '現在地未設定';

    if (uninitialized) {
      setSettlement(game, DATA.startSettlementId || 'brackenford', {log:false});
      addLog(game, 'ブラッケンフォードから冒険を始める。');
      saveGame(game);
      MAIN.setGame(game);
      return;
    }

    saveGame(game);
  }

  window.addEventListener('dd:main-action', event => {
    const action = event.detail?.action;
    const game = event.detail?.game || readGame();
    if (!action || !game || !String(action.kind || '').startsWith('world')) return;

    event.preventDefault();

    if (action.kind === 'worldOpenPlace') {
      openPlace(game, action.settlementId, action.placeId);
      return;
    }
    if (action.kind === 'worldReturnSettlement') {
      setSettlement(game, action.settlementId || currentSettlementId(game), {log:false});
      return;
    }
    if (action.kind === 'worldLeaveSettlement') {
      setWorld(game, action.settlementId || currentSettlementId(game));
      return;
    }
    if (action.kind === 'worldTravel') {
      travel(game, action);
      return;
    }
    if (action.kind === 'worldBackToMap') {
      setWorld(game, '');
      return;
    }
    if (action.kind === 'worldQuestBoard') {
      saveGame(game);
      location.href = `DD_quest.html?board=${encodeURIComponent(action.board || 'tavern')}`;
      return;
    }
    if (action.kind === 'worldRest') {
      rest(game, action);
      return;
    }
    if (action.kind === 'worldMessage') {
      game.current.description = `${game.current.description || ''}\n\n${action.message || ''}`.trim();
      addLog(game, action.message || action.label || '行動した。');
      MAIN.setGame(game);
    }
  });

  initialize();

  window.DDWorldMain = {
    initialize,
    setSettlement:(id) => setSettlement(readGame(), id),
    setWorld:() => setWorld(readGame(), currentSettlementId(readGame())),
    openPlace:(settlementId,placeId) => openPlace(readGame(), settlementId, placeId)
  };
})();
