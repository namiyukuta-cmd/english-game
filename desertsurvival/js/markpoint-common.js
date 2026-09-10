export const markpointActions = Object.freeze({
  water: ['飲む', '水を汲む', '調べる'],
  town: ['町に入る', '調べる'],
  camp: ['休む', '調べる'],
  resource: ['採取する', '調べる'],
  special: ['調べる']
});

export function getMarkpointActions(point) {
  return [...(markpointActions[point?.type] || ['調べる'])];
}

export function distanceToMarkpoint(worldState, point) {
  if (!point) return Infinity;
  return Math.hypot(Number(worldState.x || 0) - Number(point.x || 0), Number(worldState.z || 0) - Number(point.z || 0));
}

export function getNearbyMarkpoint(worldState, points, defaultRadius = 16) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const point of points || []) {
    const distance = distanceToMarkpoint(worldState, point);
    const radius = Number(point.radius || defaultRadius);
    if (distance <= radius && distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}
