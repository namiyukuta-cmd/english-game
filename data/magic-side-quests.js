(()=>{
  'use strict';

  window.MAGIC_SIDE_QUESTS=[
    {
      id:'capture_dog_2',
      en:'Capture 2 Dogs.',
      ja:'犬を2匹捕まえる。',
      words:[['capture','捕まえる'],['dog','犬']],
      requirements:[{type:'capture',target:'Dog',count:2,consume:true}],
      reward:{money:30}
    },
    {
      id:'capture_cat_3',
      en:'Capture 3 Cats.',
      ja:'猫を3匹捕まえる。',
      words:[['capture','捕まえる'],['cat','猫']],
      requirements:[{type:'capture',target:'Cat',count:3,consume:true}],
      reward:{items:{milk:1}}
    },
    {
      id:'capture_bird_2',
      en:'Capture 2 Birds.',
      ja:'鳥を2羽捕まえる。',
      words:[['capture','捕まえる'],['bird','鳥']],
      requirements:[{type:'capture',target:'Bird',count:2,consume:true}],
      reward:{money:40,items:{orange:2}}
    },
    {
      id:'capture_rabbit_2',
      en:'Capture 2 Rabbits.',
      ja:'ウサギを2匹捕まえる。',
      words:[['capture','捕まえる'],['rabbit','ウサギ']],
      requirements:[{type:'capture',target:'Rabbit',count:2,consume:true}],
      reward:{money:50,items:{meat:1}}
    }
  ];
})();