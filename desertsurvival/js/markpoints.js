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
