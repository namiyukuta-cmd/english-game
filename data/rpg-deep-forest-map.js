window.RPG_MAP = {
  id: 'deep_forest',
  page: 'rpg_deep_forest.html',
  title: '深い森',
  returnKey: 'rpgDeepForestReturnPositionV1',
  width: 540,
  height: 960,
  groundColor: 0x4f8754,
  roadColor: 0xa98f62,
  playerStart: { x: 270, y: 875 },
  roads: [
    { x: 225, y: 0, width: 90, height: 960 },
    { x: 105, y: 265, width: 330, height: 68 },
    { x: 115, y: 575, width: 310, height: 72 }
  ],
  water: [
    { x: 55, y: 390, width: 125, height: 135 },
    { x: 365, y: 410, width: 120, height: 105 }
  ],
  houses: [],
  trees: [
    { x: 55, y: 75 }, { x: 120, y: 110 }, { x: 175, y: 62 },
    { x: 365, y: 70 }, { x: 430, y: 110 }, { x: 490, y: 65 },
    { x: 70, y: 210 }, { x: 150, y: 220 }, { x: 390, y: 220 }, { x: 475, y: 245 },
    { x: 65, y: 575 }, { x: 155, y: 545 }, { x: 400, y: 560 }, { x: 480, y: 605 },
    { x: 80, y: 710 }, { x: 155, y: 760 }, { x: 390, y: 735 }, { x: 470, y: 690 },
    { x: 60, y: 855 }, { x: 150, y: 885 }, { x: 390, y: 875 }, { x: 485, y: 835 }
  ],
  npcs: [
    { id: 'deep_forest_scout_01', x: 350, y: 300, name: '探索者' }
  ],
  exits: [
    {
      id: 'to_lake',
      x: 270,
      y: 12,
      width: 90,
      height: 24,
      name: '霧の湖畔',
      label: '霧の湖畔 ↑',
      labelPosition: { x: 270, y: 36 },
      requiredDefeatedEnemyId: 'deep_horn_boss_01',
      blockedMessage: '巨大なツノスライムが道を塞いでいる！',
      destination: 'rpg_lake.html',
      destinationReturnKey: 'rpgLakeReturnPositionV1',
      destinationPosition: { x: 270, y: 875 }
    },
    {
      id: 'to_north_forest',
      x: 270,
      y: 948,
      width: 90,
      height: 24,
      name: '北の森',
      label: '↓ 北の森へ',
      labelPosition: { x: 270, y: 922 },
      destination: 'rpg_forest.html',
      destinationReturnKey: 'rpgForestReturnPositionV1',
      destinationPosition: { x: 270, y: 70 }
    }
  ],
  enemies: [
    { id: 'deep_blue_slime_01', x: 145, y: 300, name: '深森の青スライム', kind: 'blue' },
    { id: 'deep_green_slime_01', x: 410, y: 330, name: '深森の緑スライム', kind: 'green' },
    { id: 'deep_red_slime_01', x: 145, y: 650, name: '深森の赤スライム', kind: 'red' },
    { id: 'deep_horn_boss_01', x: 270, y: 135, name: '巨大ツノスライム', kind: 'horn-purple', boss: true }
  ]
};
