(()=>{
  const ages=[
    {label:'10歳未満',adult:false,weight:6},
    {label:'10代',adult:false,weight:16},
    {label:'20代',adult:true,weight:18},
    {label:'30代',adult:true,weight:18},
    {label:'40代',adult:true,weight:16},
    {label:'50代',adult:true,weight:12},
    {label:'60代',adult:true,weight:8},
    {label:'70代以上',adult:true,weight:6}
  ];

  const genders=[
    {label:'男性',pronoun:'彼',weight:50},
    {label:'女性',pronoun:'彼女',weight:50}
  ];

  // ほとんどは小さな懺悔。大罪(grave)は成人だけが抽選対象。
  const sinWeights={
    minor:[
      {id:'small',label:'小さな懺悔',weight:98},
      {id:'ordinary',label:'懺悔',weight:2}
    ],
    adult:[
      {id:'small',label:'小さな懺悔',weight:94},
      {id:'ordinary',label:'懺悔',weight:5},
      {id:'grave',label:'大罪',weight:1}
    ]
  };

  // 現在の英単語JSに収録されている単語だけで組める初期懺悔。
  const sentences={
    small:[
      ['I','was','late','for','class'],
      ['I','read','a','magazine','during','class'],
      ['I','went','to','the','park','during','class'],
      ['I','went','home','during','class'],
      ['I','was','not','at','school'],
      ['I','was','at','the','park','during','class']
    ],
    ordinary:[
      ['I','was','not','with','my','family'],
      ['I','went','home','during','class']
    ],
    // 大罪用の語彙は後から英単語JS側に追加できる。
    // 現段階では抽選ルールだけ保持し、文章はordinaryから代用する。
    grave:[
      ['I','was','not','with','my','family']
    ]
  };

  window.CONFESSION_DATA={ages,genders,sinWeights,sentences};
})();
