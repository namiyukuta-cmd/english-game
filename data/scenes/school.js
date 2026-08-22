(()=>{
  // 場面データ：学校
  // 手紙屋とは別の独立した「アメリカの学校」場面。
  const school={
    id:'school',
    name:'学校',
    country:'USA',
    language:'English',
    description:'日本からアメリカの学校へ留学してきた主人公が、英語だけの環境で学校生活を送る場面。',

    protagonist:{
      role:'student',
      name:null,
      nationality:'Japan',
      status:'exchange_student',
      description:'日本からアメリカの学校へ留学してきた学生。'
    },

    dialogueRules:{
      npcLanguage:'English',
      showJapaneseTranslation:true,
      translationPosition:'below',
      playerResponseMode:'word_order',
      instruction:'相手の英語には直下に日本語訳を表示する。主人公の返事や会話は、表示された英単語を正しい順番にタップして英文を完成させる。'
    },

    dialogueDisplayExample:[
      {speaker:'classmate',en:'Hello.',ja:'こんにちは。'},
      {speaker:'teacher',en:'I am a teacher.',ja:'私は教師です。'}
    ],

    responseExample:{
      promptJa:'私は学生です。',
      words:['student','a',"I'm"],
      answer:["I'm",'a','student'],
      sentence:"I'm a student."
    },

    places:[
      {id:'school_gate',name:'校門'},
      {id:'classroom',name:'教室'},
      {id:'hallway',name:'廊下'},
      {id:'teachers_room',name:'職員室'},
      {id:'library',name:'図書室'},
      {id:'music_room',name:'音楽室'},
      {id:'gym',name:'体育館'},
      {id:'schoolyard',name:'校庭'},
      {id:'cafeteria',name:'カフェテリア'},
      {id:'club_room',name:'部室'}
    ],

    times:[
      {id:'before_school',name:'登校前'},
      {id:'homeroom',name:'朝のホームルーム'},
      {id:'class_time',name:'授業中'},
      {id:'break_time',name:'休み時間'},
      {id:'lunch_time',name:'昼休み'},
      {id:'after_school',name:'放課後'},
      {id:'club_time',name:'部活動中'}
    ],

    people:[
      {id:'teacher',name:'教師',language:'English'},
      {id:'classmate',name:'クラスメイト',language:'English'},
      {id:'student',name:'生徒',language:'English'},
      {id:'friend',name:'友達',language:'English'},
      {id:'club_member',name:'部活の仲間',language:'English'}
    ],

    situations:[
      {id:'first_day',name:'留学初日'},
      {id:'introduction',name:'自己紹介'},
      {id:'class',name:'授業'},
      {id:'break',name:'休み時間'},
      {id:'lunch',name:'昼食'},
      {id:'after_school',name:'放課後'},
      {id:'club',name:'部活動'},
      {id:'friendship',name:'友達との会話'},
      {id:'ask_teacher',name:'先生との会話'}
    ]
  };

  window.SCENE_SCHOOL=school;
})();
