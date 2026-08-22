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

    // 主人公の返答は、その時点までに習った単語だけで作る。
    // NPC側は必ず英語＋日本語訳で表示する。
    conversations:[
      {
        id:'school_first_day_step1',
        grade:1,term:1,requiredStep:1,
        title:'留学初日・教室',
        place:'classroom',
        turns:[
          {
            speaker:'teacher',speakerName:'Teacher',
            en:'Hello. Welcome to our class.',
            ja:'こんにちは。私たちのクラスへようこそ。',
            response:{jp:'私は音楽が好きです。',words:['I','like','music'],answer:['I','like','music'],sentence:'I like music.'}
          },
          {
            speaker:'classmate',speakerName:'Classmate',
            en:'I like sports. How about you?',
            ja:'私はスポーツが好きです。あなたは？',
            response:{jp:'私はスポーツが好きです。',words:['I','like','sports'],answer:['I','like','sports'],sentence:'I like sports.'}
          },
          {
            speaker:'classmate',speakerName:'Classmate',
            en:'Do you play soccer?',
            ja:'サッカーをしますか？',
            response:{jp:'私はサッカーをします。',words:['I','play','soccer'],answer:['I','play','soccer'],sentence:'I play soccer.'}
          }
        ]
      },
      {
        id:'school_introduction_step7',
        grade:1,term:1,requiredStep:7,
        title:'自己紹介',
        place:'classroom',
        turns:[
          {
            speaker:'teacher',speakerName:'Teacher',
            en:'Hello. I am your teacher.',
            ja:'こんにちは。私はあなたの先生です。',
            response:{jp:'私は学生です。',words:["I'm",'a','student'],answer:["I'm",'a','student'],sentence:"I'm a student."}
          },
          {
            speaker:'teacher',speakerName:'Teacher',
            en:'Where are you from?',
            ja:'どこの出身ですか？',
            response:{jp:'私は日本出身です。',words:["I'm",'from','Japan'],answer:["I'm",'from','Japan'],sentence:"I'm from Japan."}
          },
          {
            speaker:'classmate',speakerName:'Classmate',
            en:'Nice to meet you.',
            ja:'はじめまして。',
            response:{jp:'私は友達が好きです。',words:['I','like','my','friend'],answer:['I','like','my','friend'],sentence:'I like my friend.'}
          }
        ]
      }
    ],

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
