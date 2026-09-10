// マークポイント番号帯
// 001-099: 水場・井戸・オアシス
// 100-199: 町・集落
// 200-299: 宿営地・隊商拠点
// 300-399: 鉱山・採取地点
// 400-499: 遺跡・特殊地点
export const MARKPOINT_RANGES = Object.freeze({
  water: [1, 99],
  town: [100, 199],
  camp: [200, 299],
  resource: [300, 399],
  special: [400, 499]
});

export const WATER_SUBTYPES = Object.freeze({
  well: 'well',
  oasis: 'oasis'
});

// 地点そのものの情報はここで一元管理する。
// x / z はワールド座標。史料に合わせた本配置は後から差し替えられる。
// 002 は新規ゲームの開始オアシス。001 の井戸は少し離して別地点として確認できるようにする。
export const markpoints = [
  {
    id: '001',
    type: 'water',
    subtype: WATER_SUBTYPES.well,
    name: '井戸',
    x: 6036,
    z: 5988,
    discoverRadius: 9,
    interactionRadius: 3
  },
  {
    id: '002',
    type: 'water',
    subtype: WATER_SUBTYPES.oasis,
    name: 'オアシス',
    x: 6000,
    z: 6000,
    discoverRadius: 18,
    interactionRadius: 10,
    visualRadius: 11,
    waterArea: {
      offsetX: -1.4,
      offsetZ: -0.3,
      radiusX: 5.72,
      radiusZ: 3.98
    },
    startingArea: true
  }
];

export function getMarkpointById(id) {
  const target = String(id).padStart(3, '0');
  return markpoints.find(point => point.id === target) || null;
}

export function getMarkpointsByType(type) {
  return markpoints.filter(point => point.type === type);
}

export function getWaterMarkpoints(subtype = null) {
  return markpoints.filter(point =>
    point.type === 'water' && (!subtype || point.subtype === subtype)
  );
}

export function isInsideWaterMarkpoint(point, x, z) {
  if (!point || point.type !== 'water') return false;
  const px = Number(x);
  const pz = Number(z);
  if (!Number.isFinite(px) || !Number.isFinite(pz)) return false;

  if (point.subtype === WATER_SUBTYPES.oasis && point.waterArea) {
    const area = point.waterArea;
    const cx = Number(point.x) + Number(area.offsetX || 0);
    const cz = Number(point.z) + Number(area.offsetZ || 0);
    const rx = Math.max(0.01, Number(area.radiusX || 1));
    const rz = Math.max(0.01, Number(area.radiusZ || 1));
    const nx = (px - cx) / rx;
    const nz = (pz - cz) / rz;
    return nx * nx + nz * nz <= 1;
  }

  const distance = Math.hypot(px - Number(point.x), pz - Number(point.z));
  return distance <= Math.max(0, Number(point.interactionRadius || 3));
}

export function findDrinkableWaterAt(x, z) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const point of markpoints) {
    if (!isInsideWaterMarkpoint(point, x, z)) continue;
    const distance = Math.hypot(Number(point.x) - Number(x), Number(point.z) - Number(z));
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function findOasisWaterAt(x, z) {
  return markpoints.find(point =>
    point.type === 'water' &&
    point.subtype === WATER_SUBTYPES.oasis &&
    isInsideWaterMarkpoint(point, x, z)
  ) || null;
}
