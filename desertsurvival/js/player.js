export function createDefaultPlayer() {
  return {
    health: 100,
    water: 100,
    food: 100,
    sleep: 100,
    bodyTemp: 37.0,
    money: 0,
    status: []
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizePlayer(player) {
  player.health = clamp(Number(player.health ?? 100), 0, 100);
  player.water = clamp(Number(player.water ?? 100), 0, 100);
  player.food = clamp(Number(player.food ?? 100), 0, 100);
  player.sleep = clamp(Number(player.sleep ?? 100), 0, 100);
  player.bodyTemp = clamp(Number(player.bodyTemp ?? 37), 30, 43);
  player.money = Math.max(0, Number(player.money ?? 0));
  if (!Array.isArray(player.status)) player.status = [];
  return player;
}

// 主人公に起こる基本的な増減はここで処理する。
// 外気温・天候・時刻などの入力値は他のJSから受け取る。
export function advancePlayer(player, environment, minutes = 1) {
  normalizePlayer(player);
  const step = Math.max(0, Number(minutes) || 0);
  const ambient = Number(environment?.ambientTemp ?? 25);
  const sandstorm = environment?.weather === 'sandstorm';
  const running = !!environment?.running;
  const sheltered = !!environment?.sheltered;

  const heat = Math.max(0, ambient - 30);
  const cold = Math.max(0, 16 - ambient);

  let waterLoss = 0.015 * step;
  let foodLoss = 0.006 * step;
  let sleepLoss = 0.004 * step;

  waterLoss += heat * 0.0018 * step;
  if (running) waterLoss *= 1.8;
  if (sandstorm && !sheltered) waterLoss *= 1.25;

  player.water = clamp(player.water - waterLoss, 0, 100);
  player.food = clamp(player.food - foodLoss, 0, 100);
  player.sleep = clamp(player.sleep - sleepLoss, 0, 100);

  let targetBodyTemp = 37.0;
  if (!sheltered) {
    targetBodyTemp += heat * 0.025;
    targetBodyTemp -= cold * 0.018;
  }
  const approach = Math.min(1, step / 60) * 0.16;
  player.bodyTemp += (targetBodyTemp - player.bodyTemp) * approach;
  player.bodyTemp = clamp(player.bodyTemp, 30, 43);

  const status = new Set();
  if (player.bodyTemp >= 39.5) status.add('熱中症');
  else if (player.bodyTemp >= 37.8) status.add('暑熱');
  if (player.bodyTemp <= 35.0) status.add('低体温');
  else if (player.bodyTemp <= 36.0) status.add('寒冷');
  if (player.water <= 15) status.add('脱水');
  if (player.food <= 10) status.add('飢餓');
  if (player.sleep <= 10) status.add('睡眠不足');
  player.status = [...status];

  if (player.bodyTemp >= 39.5 || player.bodyTemp <= 35 || player.water <= 0 || player.food <= 0 || player.sleep <= 0) {
    player.health = clamp(player.health - 0.02 * step, 0, 100);
  }

  return player;
}
