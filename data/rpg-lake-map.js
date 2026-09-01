window.RPG_MAP = {
  id: 'mist_lake',
  page: 'rpg_lake.html',
  title: '霧の湖畔',
  returnKey: 'rpgLakeReturnPositionV1',
  width: 540,
  height: 960,
  groundColor: 0x7fa89a,
  roadColor: 0xc7b890,
  playerStart: { x: 270, y: 875 },
  roads: [
    { x: 225, y: 575, width: 90, height: 385 },
    { x: 150, y: 540, width: 240, height: 90 },
    { x: 355, y: 250, width: 80, height: 360 }
  ],
  water: [
    { x: 35, y: 55, width: 300, height: 430 }
  ],
  houses: [],
  trees: [
    { x: 385, y: 85 }, { x: 455, y: 125 }, { x: 500, y: 70 },
    { x: 390, y: 205 }, { x: 475, y: 250 },
    { x: 80, y: 565 }, { x: 150, y: 620 }, { x: 470, y: 590 },
    { x: 75, y: 735 }, { x: 150, y: 800 }, { x: 405, y: 760 }, { x: 485, y: 715 },
    { x: 65, y: 885 }, { x: 155, y: 865 }, { x: 395, y: 885 }, { x: 480, y: 850 }
  ],
  npcs: [
    { id: 'lake_traveler_01', x: 375, y: 545, name: '湖畔の旅人' }
  ],
  exits: [
    {
      id: 'to_deep_forest',
      x: 270,
      y: 948,
      width: 90,
      height: 24,
      name: '深い森',
      label: '↓ 深い森へ',
      labelPosition: { x: 270, y: 922 },
      destination: 'rpg_deep_forest.html',
      destinationReturnKey: 'rpgDeepForestReturnPositionV1',
      destinationPosition: { x: 270, y: 70 }
    }
  ],
  enemies: [
    { id: 'lake_blue_slime_01', x: 390, y: 310, name: '湖の青スライム', kind: 'blue' },
    { id: 'lake_green_slime_01', x: 160, y: 560, name: '湖の緑スライム', kind: 'green' },
    { id: 'lake_red_slime_01', x: 410, y: 690, name: '湖の赤スライム', kind: 'red' },
    { id: 'lake_horn_boss_01', x: 385, y: 165, name: '湖畔のツノスライム', kind: 'horn-purple', boss: true }
  ]
};
