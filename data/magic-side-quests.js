(()=>{
  'use strict';

  window.MAGIC_SIDE_QUESTS=[
    {
      id:'capture_wolf_2',
      en:'Capture 2 Wolves.',
      ja:'オオカミを2匹捕まえる。',
      words:[['capture','捕まえる'],['wolf','オオカミ']],
      requirements:[{type:'capture',target:'Wolf',count:2,consume:true}],
      reward:{money:30}
    },
    {
      id:'capture_bat_3',
      en:'Capture 3 Bats.',
      ja:'コウモリを3匹捕まえる。',
      words:[['capture','捕まえる'],['bat','コウモリ']],
      requirements:[{type:'capture',target:'Bat',count:3,consume:true}],
      reward:{items:{milk:1}}
    },
    {
      id:'capture_snake_2',
      en:'Capture 2 Snakes.',
      ja:'ヘビを2匹捕まえる。',
      words:[['capture','捕まえる'],['snake','ヘビ']],
      requirements:[{type:'capture',target:'Snake',count:2,consume:true}],
      reward:{money:40,items:{orange:2}}
    },
    {
      id:'capture_boar_2',
      en:'Capture 2 Wild Boars.',
      ja:'イノシシを2匹捕まえる。',
      words:[['capture','捕まえる'],['wild','野生の'],['boar','イノシシ']],
      requirements:[{type:'capture',target:'Wild Boar',count:2,consume:true}],
      reward:{money:50,items:{meat:1}}
    }
  ];
})();
