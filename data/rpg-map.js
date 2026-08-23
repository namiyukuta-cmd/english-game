window.RPG_MAP = {
  id: 'village',
  page: 'rpg.html',
  title: '村',
  returnKey: 'rpgReturnPositionV1',
  width: 540,
  height: 960,
  playerStart: { x: 270, y: 500 },
  roads: [
    { x: 225, y: 0, width: 90, height: 960 },
    { x: 0, y: 430, width: 540, height: 90 }
  ],
  water: [
    { x: 370, y: 115, width: 120, height: 145 }
  ],
  houses: [
    {
      id: 'tavern',
      name: '酒場',
      x: 55,
      y: 145,
      width: 120,
      height: 95,
      href: 'rpg_tavarn.html',
      entrance: { x: 115, y: 252, width: 52, height: 24 },
      returnPosition: { x: 115, y: 286 }
    },
    { id: 'house_02', x: 350, y: 655, width: 135, height: 105 }
  ],
  trees: [
    { x: 70, y: 315 }, { x: 145, y: 350 }, { x: 95, y: 590 },
    { x: 170, y: 650 }, { x: 75, y: 805 }, { x: 175, y: 865 },
    { x: 390, y: 320 }, { x: 470, y: 355 }, { x: 430, y: 590 },
    { x: 490, y: 545 }, { x: 460, y: 820 }, { x: 365, y: 875 }
  ],
  npcs: [
    { id: 'villager_01', x: 185, y: 475, name: '村人' },
    { id: 'villager_02', x: 350, y: 475, name: '旅人' }
  ],
  exits: [
    {
      id: 'to_north_field',
      x: 270,
      y: 12,
      width: 90,
      height: 24,
      name: '北の草原',
      label: '北の草原 ↑',
      labelPosition: { x: 270, y: 36 },
      destination: 'rpg_field.html',
      destinationReturnKey: 'rpgFieldReturnPositionV1',
      destinationPosition: { x: 270, y: 875 }
    }
  ],
  enemies: [
    { id: 'slime_01', x: 120, y: 395, name: 'スライム', kind: 'pink' },
    { id: 'slime_02', x: 420, y: 395, name: 'スライム', kind: 'pink' },
    { id: 'blue_slime_01', x: 420, y: 285, name: '青スライム', kind: 'blue' },
    { id: 'green_slime_01', x: 115, y: 735, name: '緑スライム', kind: 'green' },
    { id: 'horn_slime_01', x: 385, y: 585, name: 'ツノスライム', kind: 'horn-purple' },
    { id: 'horn_slime_02', x: 135, y: 875, name: 'ツノスライム', kind: 'horn-purple' },
    { id: 'red_slime_01', x: 390, y: 875, name: '赤スライム', kind: 'red' }
  ]
};
