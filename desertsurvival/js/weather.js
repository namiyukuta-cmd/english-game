export const WEATHER = Object.freeze({
  clear: 'clear',
  sandstorm: 'sandstorm'
});

export function createDefaultWeather() {
  return {
    type: WEATHER.clear,
    sandstormHoursRemaining: 0,
    lastCheckedHourKey: null
  };
}

function hourKey(time) {
  return `${Number(time.day || 1)}-${Number(time.hour || 0)}`;
}

// 砂嵐はゲーム内1時間ごとに抽選する。
// 確率は後で地域ごとに変えられるよう引数化してある。
export function updateWeather(weather, time, sandstormChancePerHour = 0.01) {
  const key = hourKey(time);
  if (weather.lastCheckedHourKey === key) return weather;
  weather.lastCheckedHourKey = key;

  if (weather.type === WEATHER.sandstorm) {
    weather.sandstormHoursRemaining = Math.max(0, Number(weather.sandstormHoursRemaining || 0) - 1);
    if (weather.sandstormHoursRemaining <= 0) weather.type = WEATHER.clear;
    return weather;
  }

  if (Math.random() < Math.max(0, Math.min(1, sandstormChancePerHour))) {
    weather.type = WEATHER.sandstorm;
    weather.sandstormHoursRemaining = 2 + Math.floor(Math.random() * 5);
  }
  return weather;
}
