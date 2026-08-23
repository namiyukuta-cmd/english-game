window.MYSTERY_CASES=[
  {
    id:'case001',
    unit:1,
    seriesTitle:'掃除婦は朝寝る',
    caseTitle:'赤い傘',
    discoveryDate:{en:'April 24, Friday, 11:42 PM',ja:'4月24日 金曜日 午後11時42分'},
    location:{en:'Conference Room, 7th Floor',ja:'オフィスビル7階 会議室'},
    criminal:{name:'Claire Mason',age:'40代',gender:'女性',job:'会社員'},
    victim:{name:'Victor Hale',age:'40代',gender:'男性',job:'無職'},
    relation:'初対面',
    motive:'被害者が犯人の会社の不正経費に関する資料を偶然撮影し、その場で金を要求した。初対面だった犯人は、秘密が会社に知られることを恐れた。',
    incident:'深夜、犯人は被害者を7階の会議室へ呼び出した。口論の末に被害者を殺害し、慌てて立ち去った際に赤い傘を現場へ残した。',
    suspects:[
      {name:'Claire Mason',metaJa:'40代・女性・会社員',statementEn:"I left the building before midnight. I did not bring an umbrella tonight.",statementJa:'私は深夜0時前にビルを出ました。今夜は傘を持ってきていません。'},
      {name:'Daniel Cole',metaJa:'30代・男性・警備員',statementEn:'I was at the front desk. The camera can confirm it.',statementJa:'私は受付にいました。防犯カメラで確認できます。'},
      {name:'Olivia Hart',metaJa:'50代・女性・事務員',statementEn:'I was working on the fifth floor until midnight.',statementJa:'私は深夜0時まで5階で仕事をしていました。'}
    ],
    room:{
      storyEn:'Before work, you make a simple dinner in your small apartment. Your night shift starts soon.',
      storyJa:'出勤前。小さな部屋で簡単な夕食を作る。もうすぐ夜勤が始まる。',
      study:[
        {en:'I make soup.',ja:'私はスープを作ります。',grammar:'I + 一般動詞',explain:'I のあとに一般動詞 make を置く肯定文です。'},
        {en:'I like hot soup.',ja:'私は温かいスープが好きです。',grammar:'I + like + 名詞',explain:'like は「〜が好きです」。Unit1で使う一般動詞の形です。'}
      ]
    },
    discovery:{
      storyEn:'At 11:42 PM, you open the seventh-floor conference room. A man is lying beside the table. You stop at the doorway and call for help.',
      storyJa:'午後11時42分。7階の会議室を開けると、机のそばに男性が倒れていた。あなたは入口で止まり、助けを呼ぶ。',
      study:[
        {en:'A man is there.',ja:'男の人がそこにいます。',grammar:'A + 名詞 + is',explain:'be動詞 is を使って「〜がいます」と表しています。主人公が覚える中心は am / are ですが、ここでは場面理解用の表現です。'},
        {en:"I don't know him.",ja:'私は彼を知りません。',grammar:"I + don't + 一般動詞",explain:'一般動詞の否定文です。I のあとに don’t を置き、動詞は原形 know を使います。'}
      ]
    },
    questioning:{
      detective:{en:'Did you see anything unusual tonight?',ja:'今夜、何か変わったものを見ませんでしたか？'},
      storyEn:'The detective is someone you have met at previous scenes. He asks you to look around without touching anything.',
      storyJa:'来た刑事は、以前の現場でも会った顔見知りだった。何にも触れず、気づいたことがないか見てほしいと言う。',
      evidence:[
        {en:'I see a red umbrella.',ja:'赤い傘が見えます。',grammar:'I + see + 名詞',explain:'see は「見る・見える」。I のあとにそのまま動詞を置きます。'},
        {en:'It is not my umbrella.',ja:'それは私の傘ではありません。',grammar:'be動詞 + not',explain:'be動詞のあとに not を置く否定文です。'}
      ]
    },
    deduction:{
      questionEn:'Which suspect is connected to the red umbrella?',
      questionJa:'赤い傘につながる容疑者は誰？',
      correctName:'Claire Mason',
      clueJa:'Claireは「傘を持っていない」と証言した。しかし主人公は出勤時、Claireが赤い傘を持ってビルへ入るのを見ている。'
    },
    hint:{
      detective:{en:'You remembered something, right?',ja:'何か思い出したんですね？'},
      study:[
        {en:'I see Claire in this picture.',ja:'この写真にClaireが見えます。',grammar:'I + see + 人',explain:'I のあとに一般動詞 see を置く肯定文です。'},
        {en:'I see a red umbrella too.',ja:'赤い傘も見えます。',grammar:'I + see + 名詞',explain:'too は「〜も」という意味です。'}
      ],
      storyEn:'The detective checks the lobby camera. Claire is carrying the same red umbrella when she enters the building.',
      storyJa:'刑事がロビーの防犯カメラを確認する。Claireがビルに入るとき、現場と同じ赤い傘を持っていた。'
    },
    later:{
      newsEn:'Police arrested Claire Mason after confirming that she had been in the conference room. Company records showed that Victor Hale had obtained images of expense records and demanded money. Claire later admitted killing him during their confrontation.',
      newsJa:'警察はClaire Masonが会議室にいたことを確認し、逮捕した。会社の記録から、Victor Haleが経費資料の画像を手に入れ、金を要求していたことも判明。Claireはその対立の中で彼を殺害したことを認めた。',
      closingEn:'The morning sun is already up when you finally go to bed.',
      closingJa:'ようやく眠るころには、もう朝日が昇っていた。'
    }
  }
];