import { getActiveGame, setActiveGame } from './save.js';

export const ENCOUNTER_CONFIG = Object.freeze({
  checkDistance: 100,
  baseChance: 0.10,
  nightBonus: 0.10,
  sandstormBonus: 0.05,
  maxChance: 0.40
});

export const ENEMIES = Object.freeze([
  Object.freeze({
    id:'jackal',
    name:'ジャッカル',
    health:30,
    maxHealth:30,
    attack:6,
    defense:0,
    rewardMoney:0,
    weight:50
  }),
  Object.freeze({
    id:'scorpion',
    name:'大サソリ',
    health:22,
    maxHealth:22,
    attack:8,
    defense:1,
    rewardMoney:0,
    weight:30
  }),
  Object.freeze({
    id:'bandit',
    name:'盗賊',
    health:48,
    maxHealth:48,
    attack:9,
    defense:2,
    rewardMoney:8,
    weight:20
  })
]);

let encounterLocked = false;
let activeGameRef = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function currentHour(game) {
  return clamp(game?.time?.hour, 0, 23);
}

function isNight(game) {
  const hour = currentHour(game);
  return hour >= 20 || hour < 6;
}

function isSandstorm(game) {
  return game?.weather?.type === 'sandstorm';
}

function encounterChance(game, context = {}) {
  if (context.safe === true) return 0;

  let chance = Number(
    context.baseChance ??
    ENCOUNTER_CONFIG.baseChance
  );

  if (isNight(game)) {
    chance += Number(
      context.nightBonus ??
      ENCOUNTER_CONFIG.nightBonus
    );
  }

  if (isSandstorm(game)) {
    chance += Number(
      context.sandstormBonus ??
      ENCOUNTER_CONFIG.sandstormBonus
    );
  }

  if (Number.isFinite(Number(context.chanceMultiplier))) {
    chance *= Math.max(0, Number(context.chanceMultiplier));
  }

  return clamp(
    chance,
    0,
    Number(context.maxChance ?? ENCOUNTER_CONFIG.maxChance)
  );
}

function weightedEnemy(pool = ENEMIES) {
  const candidates = (Array.isArray(pool) ? pool : ENEMIES)
    .filter(enemy => enemy && Number(enemy.weight ?? 1) > 0);

  if (!candidates.length) return null;

  const total = candidates.reduce(
    (sum, enemy) => sum + Math.max(0, Number(enemy.weight ?? 1)),
    0
  );

  if (total <= 0) return candidates[0];

  let roll = Math.random() * total;

  for (const enemy of candidates) {
    roll -= Math.max(0, Number(enemy.weight ?? 1));
    if (roll <= 0) return enemy;
  }

  return candidates[candidates.length - 1];
}

function cloneEnemy(enemy) {
  return {
    id:String(enemy.id || 'enemy'),
    name:String(enemy.name || '敵'),
    health:Math.max(1, Number(enemy.health ?? enemy.maxHealth ?? 1)),
    maxHealth:Math.max(1, Number(enemy.maxHealth ?? enemy.health ?? 1)),
    attack:Math.max(1, Number(enemy.attack ?? 1)),
    defense:Math.max(0, Number(enemy.defense ?? 0)),
    rewardMoney:Math.max(0, Number(enemy.rewardMoney ?? 0))
  };
}

function ensureEncounterState(game) {
  if (!game.world || typeof game.world !== 'object') {
    game.world = {};
  }

  const distance = Number(game.world.encounterDistance || 0);
  game.world.encounterDistance = Number.isFinite(distance)
    ? Math.max(0, distance)
    : 0;

  return game.world;
}

function syncBattleResultBackToGame() {
  if (!activeGameRef) return;

  const latest = getActiveGame();
  if (!latest) return;

  if (latest.player && activeGameRef.player) {
    Object.assign(activeGameRef.player, latest.player);
  }

  if (latest.inventory && Array.isArray(activeGameRef.inventory)) {
    activeGameRef.inventory.splice(
      0,
      activeGameRef.inventory.length,
      ...latest.inventory.map(entry => ({ ...entry }))
    );
  }

  activeGameRef.updatedAt = latest.updatedAt;
}

function beginBattle(game, enemy, context = {}) {
  if (encounterLocked) return false;
  if (window.DesertAutoBattle?.isRunning?.()) return false;

  encounterLocked = true;
  activeGameRef = game;

  /*
    auto-battle.js は activeGame を読み直して戦うため、
    遭遇した瞬間の最新状態を先に保存する。
  */
  setActiveGame(game);

  window.dispatchEvent(new CustomEvent('desertsurvival:battle-start', {
    detail:{
      enemy:cloneEnemy(enemy),
      options:context.battleOptions || {}
    }
  }));

  return true;
}

export function isEncounterLocked() {
  return encounterLocked ||
    Boolean(window.DesertAutoBattle?.isRunning?.());
}

export function getEncounterChance(game, context = {}) {
  return encounterChance(game, context);
}

export function pickEncounterEnemy(pool = ENEMIES) {
  const enemy = weightedEnemy(pool);
  return enemy ? cloneEnemy(enemy) : null;
}

/*
  移動するたびに movedDistance を渡す。
  100距離ぶん進むごとに1回だけ遭遇判定する。

  戻り値:
  {
    checked: 判定回数,
    encountered: 敵と遭遇したか,
    enemy: 遭遇した敵,
    chance: 今回使った遭遇率
  }
*/
export function processEncounterDistance(
  game,
  movedDistance,
  context = {}
) {
  if (!game || typeof game !== 'object') {
    return { checked:0, encountered:false, enemy:null, chance:0 };
  }

  if (isEncounterLocked()) {
    return { checked:0, encountered:false, enemy:null, chance:0 };
  }

  const moved = Math.max(0, Number(movedDistance) || 0);
  if (moved <= 0) {
    return { checked:0, encountered:false, enemy:null, chance:0 };
  }

  const world = ensureEncounterState(game);
  world.encounterDistance += moved;

  const interval = Math.max(
    1,
    Number(context.checkDistance ?? ENCOUNTER_CONFIG.checkDistance)
  );

  let checked = 0;
  let lastChance = 0;

  while (world.encounterDistance >= interval) {
    world.encounterDistance -= interval;
    checked += 1;

    const chance = encounterChance(game, context);
    lastChance = chance;

    if (chance <= 0 || Math.random() >= chance) {
      continue;
    }

    const enemy = weightedEnemy(context.enemyPool || ENEMIES);
    if (!enemy) {
      continue;
    }

    if (beginBattle(game, enemy, context)) {
      return {
        checked,
        encountered:true,
        enemy:cloneEnemy(enemy),
        chance
      };
    }
  }

  return {
    checked,
    encountered:false,
    enemy:null,
    chance:lastChance
  };
}

export function resetEncounterDistance(game) {
  if (!game?.world) return;
  game.world.encounterDistance = 0;
}

window.addEventListener('desertsurvival:battle-end', () => {
  syncBattleResultBackToGame();
  encounterLocked = false;
  activeGameRef = null;
});

window.addEventListener('pagehide', () => {
  encounterLocked = false;
  activeGameRef = null;
});
