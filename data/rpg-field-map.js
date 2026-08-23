window.RPG_MAP = {
  id: 'north_field',
  page: 'rpg_field.html',
  title: '北の草原',
  returnKey: 'rpgFieldReturnPositionV1',
  width: 540,
  height: 960,
  groundColor: 0x8bc874,
  roadColor: 0xd7be82,
  playerStart: { x: 270, y: 875 },
  roads: [
    { x: 225, y: 0, width: 90, height: 960 },
    { x: 225, y: 360, width: 235, height: 72 }
  ],
  water: [
    { x: 45, y: 105, width: 135, height: 180 }
  ],
  houses: [],
  trees: [
    { x: 65, y: 345 }, { x: 145, y: 385 }, { x: 80, y: 535 },
    { x: 165, y: 610 }, { x: 80, y: 760 }, { x: 165, y: 825 },
    { x: 390, y: 105 }, { x: 470, y: 160 }, { x: 390, y: 290 },
    { x: 485, y: 525 }, { x: 390, y: 650 }, { x: 470, y: 780 }
  ],
  npcs: [
    { id: 'field_traveler_01', x: 350, y: 397, name: '行商人' }
  ],
  exits: [
    {
      id: 'to_village',
      x: 270,
      y: 948,
      width: 90,
      height: 24,
      name: '村',
      label: '↓ 村へ',
      labelPosition: { x: 270, y: 922 },
      destination: 'rpg.html',
      destinationReturnKey: 'rpgReturnPositionV1',
      destinationPosition: { x: 270, y: 70 }
    }
  ],
  enemies: [
    { id: 'field_slime_01', x: 120, y: 455, name: 'スライム', kind: 'pink' },
    { id: 'field_blue_slime_01', x: 410, y: 335, name: '青スライム', kind: 'blue' },
    { id: 'field_green_slime_01', x: 390, y: 700, name: '緑スライム', kind: 'green' },
    { id: 'field_horn_slime_01', x: 145, y: 720, name: 'ツノスライム', kind: 'horn-purple' }
  ]
};
