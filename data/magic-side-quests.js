(()=>{
  'use strict';

  // Side quests are separate from ruin-depth progression.
  // Rewards and targets can be changed here without rewriting Magic Classroom logic.
  window.MAGIC_SIDE_QUESTS=[
    {
      id:'capture_goblin_2',
      en:'Capture 2 Goblins.',
      ja:'ゴブリンを2匹捕まえる。',
      words:[['capture','捕まえる'],['goblin','ゴブリン']],
      requirements:[{type:'capture',target:'Goblin',count:2,consume:true}],
      reward:{money:30}
    },
    {
      id:'capture_red_slime_3',
      en:'Capture 3 Red Slimes.',
      ja:'赤いスライムを3匹捕まえる。',
      words:[['capture','捕まえる'],['red','赤い'],['slime','スライム']],
      requirements:[{type:'capture',target:'Red Slime',count:3,consume:true}],
      reward:{supply:1}
    },
    {
      id:'capture_blue_slime_2',
      en:'Capture 2 Blue Slimes.',
      ja:'青いスライムを2匹捕まえる。',
      words:[['capture','捕まえる'],['blue','青い'],['slime','スライム']],
      requirements:[{type:'capture',target:'Blue Slime',count:2,consume:true}],
      reward:{money:40}
    },
    {
      id:'capture_skeleton_2',
      en:'Capture 2 Skeletons.',
      ja:'スケルトンを2体捕まえる。',
      words:[['capture','捕まえる'],['skeleton','スケルトン']],
      requirements:[{type:'capture',target:'Skeleton',count:2,consume:true}],
      reward:{supply:1,money:20}
    }
  ];
})();
