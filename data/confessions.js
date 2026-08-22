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

  // 英文は教科書の学習順に紐づける。
  // そのStepまでに英単語JSで習った語だけを使う。
  // 後のStepの英文が先に出ることはない。
  const lessons=[
    {grade:1,term:1,step:1,severity:'small',words:['I','like','sweets']},
    {grade:1,term:1,step:2,severity:'small',words:["I'm",'hungry']},
    {grade:1,term:1,step:3,severity:'small',words:['I','like','red']},
    {grade:1,term:1,step:4,severity:'small',words:['I','went','fishing']},
    {grade:1,term:1,step:5,severity:'small',words:['I','want','food']},
    {grade:1,term:1,step:6,severity:'small',words:['I','like','milk']},
    {grade:1,term:1,step:7,severity:'small',words:["I'm",'a','student']},
    {grade:1,term:1,step:8,severity:'small',words:['I',"don't",'like','winter']},
    {grade:1,term:1,step:9,severity:'small',words:['I',"can't",'swim']},
    {grade:1,term:1,step:10,severity:'small',words:["I'm",'interested','in','K-pop']},
    {grade:1,term:1,step:11,severity:'small',words:['I','never','practice']},
    {grade:1,term:1,step:12,severity:'small',words:['I','write','with','a','pencil']},
    {grade:1,term:1,step:13,severity:'small',words:['I','like','my','team']},
    {grade:1,term:1,step:14,severity:'small',words:['I','like','Australia']},
    {grade:1,term:1,step:15,severity:'small',words:['I','get','up','late']},
    {grade:1,term:1,step:16,severity:'small',words:['I','use','computer']}
  ];

  window.CONFESSION_DATA={ages,genders,sinWeights,lessons};
})();
