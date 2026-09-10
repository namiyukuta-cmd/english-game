export const TIME_SCALE = Object.freeze({
  realMillisecondsPerGameMinute: 1000
});

export function createDefaultTime() {
  return { day:1, hour:8, minute:0 };
}

export function advanceTime(time, minutes = 1) {
  let total = Number(time.minute || 0) + Math.max(0, Math.floor(Number(minutes) || 0));
  time.minute = total % 60;
  total = Math.floor(total / 60) + Number(time.hour || 0);
  time.hour = total % 24;
  time.day = Number(time.day || 1) + Math.floor(total / 24);
  return time;
}

export function totalMinutes(time) {
  return ((Number(time.day || 1) - 1) * 24 * 60) + (Number(time.hour || 0) * 60) + Number(time.minute || 0);
}

export function formatTime(time) {
  const hh = String(Number(time.hour || 0)).padStart(2, '0');
  const mm = String(Number(time.minute || 0)).padStart(2, '0');
  return `DAY ${Number(time.day || 1)}  ${hh}:${mm}`;
}

export function getHourDecimal(time) {
  return Number(time.hour || 0) + Number(time.minute || 0) / 60;
}
