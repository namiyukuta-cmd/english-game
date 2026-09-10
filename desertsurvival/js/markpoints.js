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

// 実際の地点は史料・ゲーム設計が固まったらここへ追加する。
export const markpoints = [];

export function getMarkpointById(id) {
  const target = String(id).padStart(3, '0');
  return markpoints.find(point => point.id === target) || null;
}
