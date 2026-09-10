import { getHourDecimal } from './time.js';

// 砂漠の基本的な一日の外気温カーブ。
// 地域差・季節差は後で倍率や補正を追加する。
export function getAmbientTemperature(time, weather = 'clear') {
  const hour = getHourDecimal(time);
  let temp;

  if (hour < 5) temp = 9 + hour * 0.4;
  else if (hour < 8) temp = 11 + (hour - 5) * 4;
  else if (hour < 14) temp = 23 + (hour - 8) * 3.5;
  else if (hour < 18) temp = 44 - (hour - 14) * 2.5;
  else if (hour < 22) temp = 34 - (hour - 18) * 4.5;
  else temp = 16 - (hour - 22) * 3.5;

  if (weather === 'sandstorm') temp -= 2;
  return Math.round(temp * 10) / 10;
}
