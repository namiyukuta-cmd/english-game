(() => {
  'use strict';

  const DATA = window.DD_QUEST_DATA;
  const MAIN = window.DDMain;
  if (!DATA || !MAIN) return;

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function activeQuests(game) {
    const quests = Array.isArray(game?.quests) ? game.quests : [];
    return quests.filter(q => q && q.status === 'active');
  }

  function questDefinition(questId) {
    return (DATA.quests || []).find(q => q.id === questId) || null;
  }

  function stageDefinition(quest) {
    const def = questDefinition(quest?.id);
    if (!def || !Array.isArray(def.stages) || !def.stages.length) return null;
    const index = Number.isInteger(quest.stageIndex)
      ? quest.stageIndex
      : Math.max(0, def.stages.findIndex(stage => stage.id === quest.stage));
    return def.stages[index] || def.stages[0] || null;
  }

  function stageEffects(quest) {
    if (quest?.effects && typeof quest.effects === 'object') return quest.effects;
    return stageDefinition(quest)?.effects || {};
  }

  function currentPlaceId(game) {
    return game?.location?.placeId
      || game?.current?.placeId
      || game?.current?.place?.id
      || '';
  }

  function currentLocationIds(game) {
    return new Set([
      game?.location?.locationId,
      game?.location?.settlementId,
      game?.location?.regionId,
      game?.current?.locationId,
      game?.current?.settlementId,
      game?.current?.townId,
      game?.current?.villageId,
      game?.current?.id
    ].filter(Boolean).map(String));
  }

  function isTownLike(game) {
    const mode = String(game?.current?.mode || '').toLowerCase();
    if (['town','city','village','settlement'].includes(mode)) return true;
    if (game?.location?.settlementId && !currentPlaceId(game)) return true;
    return false;
  }

  function locationMatches(game, locationId) {
    if (!locationId) return true;
    if (locationId === 'town_current') return isTownLike(game);
    return currentLocationIds(game).has(String(locationId));
  }

  function sourceActions(current) {
    const source = current?.actions
      || current?.menu
      || current?.destinations
      || current?.places
      || [];
    return Array.isArray(source) ? source.filter(action => !action?.__questDynamic) : [];
  }

  function addUnique(list, action) {
    if (!action?.id) return;
    if (list.some(item => item?.id === action.id)) return;
    list.push(action);
  }

  function questDynamicActions(game) {
    const extras = [];
    const placeId = currentPlaceId(game);

    for (const quest of activeQuests(game)) {
      const effects = stageEffects(quest);

      for (const place of effects.unlockPlaces || []) {
        if (!locationMatches(game, place.locationId)) continue;
        addUnique(extras, {
          id: `quest-place-${quest.id}-${place.placeId}`,
          label: place.label || '依頼先',
          target: place.placeId,
          __questDynamic: true,
          kind: 'questPlace',
          questId: quest.id,
          locationId: place.locationId || '',
          placeId: place.placeId || '',
          description: place.description || ''
        });
      }

      for (const action of effects.unlockActions || []) {
        if (action.placeId && String(action.placeId) !== String(placeId)) continue;
        addUnique(extras, {
          id: action.actionId || `quest-action-${quest.id}`,
          label: action.label || '依頼について',
          __questDynamic: true,
          kind: 'questAction',
          questId: quest.id,
          placeId: action.placeId || ''
        });
      }
    }

    return extras;
  }

  function apply(game) {
    if (!game) return game;
    game.current = game.current || {};
    const base = sourceActions(game.current);
    game.current.actions = [...base, ...questDynamicActions(game)];
    return game;
  }

  function pushNavigation(game) {
    game.navigationStack = Array.isArray(game.navigationStack) ? game.navigationStack : [];
    game.navigationStack.push({
      current: clone(game.current || {}),
      location: clone(game.location || null)
    });
  }

  function restoreNavigation(game) {
    const stack = Array.isArray(game.navigationStack) ? game.navigationStack : [];
    const previous = stack.pop();
    if (!previous) return false;
    game.current = previous.current || {};
    if (previous.location) game.location = previous.location;
    else delete game.location;
    return true;
  }

  function questLog(game, text, questId) {
    game.log = Array.isArray(game.log) ? game.log : [];
    game.log.push({
      type: 'questProgress',
      questId,
      text,
      location: game?.location?.label || game?.current?.location || ''
    });
  }

  function advanceQuest(game, questId) {
    const quest = activeQuests(game).find(q => q.id === questId);
    const def = questDefinition(questId);
    if (!quest || !def || !Array.isArray(def.stages) || !def.stages.length) return null;

    const currentIndex = Number.isInteger(quest.stageIndex)
      ? quest.stageIndex
      : Math.max(0, def.stages.findIndex(stage => stage.id === quest.stage));

    if (Array.isArray(quest.objectives) && quest.objectives[currentIndex]) {
      quest.objectives[currentIndex].done = true;
    }

    const nextIndex = currentIndex + 1;
    const next = def.stages[nextIndex];

    if (!next) {
      quest.status = 'completed';
      quest.completedAt = new Date().toISOString();
      quest.currentObjective = '完了';
      quest.effects = {};
      questLog(game, `依頼「${quest.title || def.title}」を完了した。`, quest.id);
      return { completed: true, quest };
    }

    quest.stageIndex = nextIndex;
    quest.stage = next.id;
    quest.currentObjective = next.objective || '';
    quest.effects = clone(next.effects || {});
    quest.objectives = Array.isArray(quest.objectives) ? quest.objectives : [];
    quest.objectives.push({
      id: next.id,
      text: next.objective || '',
      done: false
    });
    questLog(game, `依頼「${quest.title || def.title}」が進行した。次の目的：${next.objective || ''}`, quest.id);
    return { completed: false, quest, next };
  }

  const baseSetGame = MAIN.setGame.bind(MAIN);
  MAIN.setGame = nextGame => baseSetGame(apply(nextGame || MAIN.getGame()));

  function openQuestPlace(game, action) {
    const quest = activeQuests(game).find(q => q.id === action.questId);
    pushNavigation(game);

    const label = action.label || '依頼先';
    game.location = game.location || {};
    if (action.locationId && action.locationId !== 'town_current') {
      game.location.locationId = action.locationId;
    }
    game.location.placeId = action.placeId || '';
    game.location.label = label;

    game.current = {
      mode: 'place',
      location: label,
      locationId: action.locationId === 'town_current'
        ? (game.location.settlementId || game.location.locationId || '')
        : (action.locationId || ''),
      placeId: action.placeId || '',
      description: action.description || `依頼「${quest?.title || '依頼'}」に関係する場所です。`,
      actions: [
        {
          id: `quest-talk-${action.questId}-${action.placeId || 'place'}`,
          label: '依頼について',
          __questDynamic: true,
          kind: 'questTalkHere',
          questId: action.questId
        },
        {
          id: `quest-return-${action.questId}-${action.placeId || 'place'}`,
          label: '戻る',
          __questDynamic: true,
          kind: 'questReturn',
          questId: action.questId
        }
      ]
    };

    baseSetGame(apply(game));
  }

  function talkAndAdvance(game, action) {
    const result = advanceQuest(game, action.questId);
    if (!result) return;

    if (result.completed) {
      game.current.description = `依頼「${result.quest.title}」は完了しました。`;
    } else {
      game.current.description = `依頼について話を聞きました。\n\n次の目的：${result.quest.currentObjective}`;
    }
    baseSetGame(apply(game));
  }

  window.addEventListener('dd:main-action', event => {
    const action = event.detail?.action;
    const game = event.detail?.game || MAIN.getGame();
    if (!action?.__questDynamic || !game) return;

    event.preventDefault();

    if (action.kind === 'questPlace') {
      openQuestPlace(game, action);
      return;
    }

    if (action.kind === 'questAction' || action.kind === 'questTalkHere') {
      talkAndAdvance(game, action);
      return;
    }

    if (action.kind === 'questReturn') {
      if (restoreNavigation(game)) baseSetGame(apply(game));
    }
  });

  baseSetGame(apply(MAIN.getGame()));

  window.DDQuestRuntime = {
    apply,
    advanceQuest,
    refresh: () => baseSetGame(apply(MAIN.getGame()))
  };
})();