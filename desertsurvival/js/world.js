export const WORLD = Object.freeze({
  width: 12000,
  height: 12000,
  // 新規ゲームはオアシスの水際ではなく、木陰のある縁から始める。
  startX: 6000,
  startZ: 6008,
  travelMinutesPerWorldUnit: 0.035
});

export function createDefaultWorldState() {
  return {
    x: WORLD.startX,
    z: WORLD.startZ,
    running: false,
    sheltered: false,
    currentRegion: 'desert_001',
    discoveredMarkpoints: [],
    collectedPickups: []
  };
}

export function clampWorldPosition(worldState) {
  worldState.x = Math.max(0, Math.min(WORLD.width, Number(worldState.x || 0)));
  worldState.z = Math.max(0, Math.min(WORLD.height, Number(worldState.z || 0)));
  return worldState;
}

export function moveWorldPosition(worldState, dx, dz) {
  const oldX = Number(worldState.x || 0);
  const oldZ = Number(worldState.z || 0);
  worldState.x = oldX + Number(dx || 0);
  worldState.z = oldZ + Number(dz || 0);
  clampWorldPosition(worldState);
  const moved = Math.hypot(worldState.x - oldX, worldState.z - oldZ);
  return {
    moved,
    gameMinutes: moved * WORLD.travelMinutesPerWorldUnit
  };
}
