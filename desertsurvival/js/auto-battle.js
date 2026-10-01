import { getActiveGame, setActiveGame } from './save.js';

const DEFAULTS = Object.freeze({
  playerAttack:12,
  playerDefense:0,
  roundDelay:650,
  damageVariance:0.15
});

let activeBattle = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function safeInt(value, fallback = 0) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEnemy(enemy) {
  if (!enemy || typeof enemy !== 'object') throw new Error('敵データがありません。');
  const maxHealth = Math.max(1, safeInt(enemy.maxHealth ?? enemy.health ?? enemy.hp, 1));
  return {
    id:String(enemy.id || 'enemy'),
    name:String(enemy.name || '敵'),
    health:clamp(safeInt(enemy.health ?? enemy.hp, maxHealth), 0, maxHealth),
    maxHealth,
    attack:Math.max(1, safeInt(enemy.attack, 5)),
    defense:Math.max(0, safeInt(enemy.defense, 0)),
    rewardMoney:Math.max(0, safeInt(enemy.rewardMoney ?? enemy.money, 0))
  };
}

function normalizedOptions(options = {}) {
  return {
    playerAttack:Math.max(1, safeInt(options.playerAttack, DEFAULTS.playerAttack)),
    playerDefense:Math.max(0, safeInt(options.playerDefense, DEFAULTS.playerDefense)),
    roundDelay:Math.max(120, safeInt(options.roundDelay, DEFAULTS.roundDelay)),
    damageVariance:clamp(options.damageVariance ?? DEFAULTS.damageVariance, 0, 0.75)
  };
}

function rollDamage(attack, defense, variance) {
  const base = Math.max(1, Number(attack) - Number(defense));
  const spread = base * variance;
  const rolled = base + ((Math.random() * 2 - 1) * spread);
  return Math.max(1, Math.round(rolled));
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Battle stopped', 'AbortError'));
    }, { once:true });
  });
}

function ensureUi() {
  let layer = document.getElementById('autoBattleLayer');
  if (layer) return layer;

  layer = document.createElement('section');
  layer.id = 'autoBattleLayer';
  layer.className = 'auto-battle-layer';
  layer.hidden = true;
  layer.setAttribute('aria-label', 'オートバトル');

  layer.innerHTML = `
    <div class="auto-battle-card" role="dialog" aria-modal="true" aria-labelledby="autoBattleTitle">
      <header class="auto-battle-head">
        <h2 id="autoBattleTitle" class="auto-battle-title">AUTO BATTLE</h2>
        <span id="autoBattleState" class="auto-battle-state">戦闘中</span>
      </header>

      <section class="auto-battle-side player">
        <div class="auto-battle-name-row">
          <span>PLAYER</span>
          <span id="autoBattlePlayerHp" class="auto-battle-hp">100 / 100</span>
        </div>
        <div class="auto-battle-bar" aria-label="プレイヤーHP">
          <div id="autoBattlePlayerFill" class="auto-battle-bar-fill"></div>
        </div>
      </section>

      <section class="auto-battle-side enemy">
        <div class="auto-battle-name-row">
          <span id="autoBattleEnemyName">敵</span>
          <span id="autoBattleEnemyHp" class="auto-battle-hp">0 / 0</span>
        </div>
        <div class="auto-battle-bar" aria-label="敵HP">
          <div id="autoBattleEnemyFill" class="auto-battle-bar-fill"></div>
        </div>
      </section>

      <div id="autoBattleLog" class="auto-battle-log" aria-live="polite"></div>

      <footer class="auto-battle-foot">
        <button id="autoBattleClose" class="auto-battle-close" type="button" disabled>閉じる</button>
      </footer>
    </div>
  `;

  const root = document.getElementById('fieldRoot') || document.body;
  root.appendChild(layer);

  layer.querySelector('#autoBattleClose').addEventListener('click', closeAutoBattle);
  return layer;
}

function refs() {
  const layer = ensureUi();
  return {
    layer,
    state:layer.querySelector('#autoBattleState'),
    playerHp:layer.querySelector('#autoBattlePlayerHp'),
    playerFill:layer.querySelector('#autoBattlePlayerFill'),
    enemyName:layer.querySelector('#autoBattleEnemyName'),
    enemyHp:layer.querySelector('#autoBattleEnemyHp'),
    enemyFill:layer.querySelector('#autoBattleEnemyFill'),
    log:layer.querySelector('#autoBattleLog'),
    close:layer.querySelector('#autoBattleClose')
  };
}

function renderHp(elText, elFill, current, max) {
  const safeMax = Math.max(1, Number(max) || 1);
  const safeCurrent = clamp(current, 0, safeMax);
  elText.textContent = `${Math.ceil(safeCurrent)} / ${Math.ceil(safeMax)}`;
  elFill.style.width = `${(safeCurrent / safeMax) * 100}%`;
}

function logLine(ui, text, kind = '') {
  const row = document.createElement('div');
  row.className = `auto-battle-log-row ${kind}`.trim();
  row.textContent = text;
  ui.log.appendChild(row);
  ui.log.scrollTop = ui.log.scrollHeight;
}

function finishBattle(ui, result, game, enemy) {
  activeBattle = null;
  ui.close.disabled = false;
  ui.state.textContent = result === 'victory' ? '勝利' : '敗北';

  if (result === 'victory') {
    if (enemy.rewardMoney > 0) {
      game.player.money = Math.max(0, Number(game.player.money || 0)) + enemy.rewardMoney;
      logLine(ui, `${enemy.rewardMoney} を獲得`, 'result');
    }
    logLine(ui, '戦闘に勝利しました。', 'result');
  } else {
    game.player.health = 0;
    logLine(ui, '戦闘に敗北しました。', 'result');
  }

  setActiveGame(game);

  const detail = {
    result,
    enemy:{ ...enemy },
    playerHealth:Number(game.player.health || 0)
  };
  window.dispatchEvent(new CustomEvent('desertsurvival:battle-end', { detail }));
  return detail;
}

export function isAutoBattleRunning() {
  return !!activeBattle;
}

export async function startAutoBattle(enemyInput, options = {}) {
  if (activeBattle) throw new Error('すでに戦闘中です。');

  const game = getActiveGame();
  if (!game?.player) throw new Error('プレイヤーデータがありません。');

  const enemy = normalizeEnemy(enemyInput);
  const config = normalizedOptions(options);
  const ui = refs();
  const controller = new AbortController();

  game.player.health = clamp(game.player.health ?? 100, 0, 100);
  const playerMaxHealth = 100;

  ui.layer.hidden = false;
  ui.state.textContent = '戦闘中';
  ui.enemyName.textContent = enemy.name;
  ui.log.innerHTML = '';
  ui.close.disabled = true;
  renderHp(ui.playerHp, ui.playerFill, game.player.health, playerMaxHealth);
  renderHp(ui.enemyHp, ui.enemyFill, enemy.health, enemy.maxHealth);
  logLine(ui, `${enemy.name} と遭遇。`);

  const promise = (async () => {
    try {
      while (game.player.health > 0 && enemy.health > 0) {
        await wait(config.roundDelay, controller.signal);

        const playerDamage = rollDamage(config.playerAttack, enemy.defense, config.damageVariance);
        enemy.health = clamp(enemy.health - playerDamage, 0, enemy.maxHealth);
        renderHp(ui.enemyHp, ui.enemyFill, enemy.health, enemy.maxHealth);
        logLine(ui, `PLAYER → ${enemy.name}  ${playerDamage}ダメージ`, 'damage');

        if (enemy.health <= 0) return finishBattle(ui, 'victory', game, enemy);

        await wait(Math.max(120, Math.round(config.roundDelay * 0.72)), controller.signal);

        const enemyDamage = rollDamage(enemy.attack, config.playerDefense, config.damageVariance);
        game.player.health = clamp(game.player.health - enemyDamage, 0, playerMaxHealth);
        renderHp(ui.playerHp, ui.playerFill, game.player.health, playerMaxHealth);
        logLine(ui, `${enemy.name} → PLAYER  ${enemyDamage}ダメージ`, 'damage');

        if (game.player.health <= 0) return finishBattle(ui, 'defeat', game, enemy);
      }
      return null;
    } catch (error) {
      if (error?.name === 'AbortError') return null;
      activeBattle = null;
      ui.state.textContent = '停止';
      ui.close.disabled = false;
      logLine(ui, error?.message || '戦闘処理でエラーが発生しました。', 'result');
      throw error;
    }
  })();

  activeBattle = { controller, promise, enemy, game };
  return promise;
}

export function stopAutoBattle() {
  if (!activeBattle) return false;
  activeBattle.controller.abort();
  activeBattle = null;
  const ui = refs();
  ui.state.textContent = '停止';
  ui.close.disabled = false;
  logLine(ui, '戦闘を停止しました。', 'result');
  return true;
}

export function closeAutoBattle() {
  if (activeBattle) return false;
  const ui = refs();
  ui.layer.hidden = true;
  ui.log.innerHTML = '';
  return true;
}

window.DesertAutoBattle = Object.freeze({
  start:startAutoBattle,
  stop:stopAutoBattle,
  close:closeAutoBattle,
  isRunning:isAutoBattleRunning
});

window.addEventListener('desertsurvival:battle-start', event => {
  if (activeBattle) return;
  startAutoBattle(event.detail?.enemy, event.detail?.options).catch(error => {
    console.error('[Desert Survival] auto battle failed:', error);
  });
});
