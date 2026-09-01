window.RPG_MAP = {
  id: 'north_forest',
  page: 'rpg_forest.html',
  title: '北の森',
  returnKey: 'rpgForestReturnPositionV1',
  width: 540,
  height: 960,
  groundColor: 0x6fa967,
  roadColor: 0xc3a976,
  playerStart: { x: 270, y: 875 },
  roads: [
    { x: 225, y: 0, width: 90, height: 960 },
    { x: 150, y: 380, width: 240, height: 150 }
  ],
  water: [],
  houses: [],
  trees: [
    { x: 55, y: 85 }, { x: 125, y: 125 }, { x: 175, y: 75 },
    { x: 365, y: 80 }, { x: 430, y: 125 }, { x: 495, y: 75 },
    { x: 70, y: 245 }, { x: 150, y: 285 }, { x: 390, y: 255 },
    { x: 475, y: 300 }, { x: 70, y: 435 }, { x: 110, y: 530 },
    { x: 430, y: 440 }, { x: 485, y: 535 }, { x: 70, y: 655 },
    { x: 155, y: 700 }, { x: 390, y: 680 }, { x: 480, y: 640 },
    { x: 60, y: 840 }, { x: 150, y: 885 }, { x: 390, y: 870 },
    { x: 480, y: 820 }
  ],
  npcs: [
    { id: 'forest_ranger_01', x: 360, y: 455, name: '森の旅人' }
  ],
  exits: [
    {
      id: 'to_deep_forest',
      x: 270,
      y: 12,
      width: 90,
      height: 24,
      name: '深い森',
      label: '深い森 ↑',
      labelPosition: { x: 270, y: 36 },
      destination: 'rpg_deep_forest.html',
      destinationReturnKey: 'rpgDeepForestReturnPositionV1',
      destinationPosition: { x: 270, y: 875 }
    },
    {
      id: 'to_north_field',
      x: 270,
      y: 948,
      width: 90,
      height: 24,
      name: '北の草原',
      label: '↓ 草原へ',
      labelPosition: { x: 270, y: 922 },
      destination: 'rpg_field.html',
      destinationReturnKey: 'rpgFieldReturnPositionV1',
      destinationPosition: { x: 270, y: 70 }
    }
  ],
  enemies: [
    { id: 'forest_green_slime_01', x: 125, y: 350, name: '森の緑スライム', kind: 'green' },
    { id: 'forest_blue_slime_01', x: 405, y: 330, name: '森の青スライム', kind: 'blue' },
    { id: 'forest_horn_slime_01', x: 155, y: 620, name: '森のツノスライム', kind: 'horn-purple' },
    { id: 'forest_red_slime_01', x: 390, y: 710, name: '森の赤スライム', kind: 'red' }
  ]
};
