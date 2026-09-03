(()=>{
  'use strict';

  const items={
    orange:{id:'orange',name:'Orange',ja:'オレンジ',type:'food',hp:1,description:'A small fruit. Restores a little HP.'},
    apple:{id:'apple',name:'Apple',ja:'りんご',type:'food',hp:2,description:'A fresh apple. Restores HP.'},
    meat:{id:'meat',name:'Meat',ja:'肉',type:'food',hp:4,description:'A filling meal. Restores a lot of HP.'},
    milk:{id:'milk',name:'Milk',ja:'牛乳',type:'drink',mp:3,description:'Restores MP.'},
    'spring-paper':{id:'spring-paper',name:'Spring Paper',ja:'春の魔法紙',type:'magic-paper',spell:'spring',description:'Spring magic sealed in paper. One use.'},
    'summer-paper':{id:'summer-paper',name:'Summer Paper',ja:'夏の魔法紙',type:'magic-paper',spell:'summer',description:'Summer magic sealed in paper. One use.'},
    'autumn-paper':{id:'autumn-paper',name:'Autumn Paper',ja:'秋の魔法紙',type:'magic-paper',spell:'autumn',description:'Autumn magic sealed in paper. One use.'},
    'winter-paper':{id:'winter-paper',name:'Winter Paper',ja:'冬の魔法紙',type:'magic-paper',spell:'winter',description:'Winter magic sealed in paper. One use.'}
  };

  window.MagicItems={
    all:items,
    get(id){return items[id]||null;}
  };
})();
