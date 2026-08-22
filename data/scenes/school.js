(()=>{
  // 場面データ：学校
  // 依頼人・会話・手紙の内容を作るときに参照するための固定データ。
  const school={
    id:'school',
    name:'学校',
    description:'生徒や先生が集まり、授業、休み時間、部活動などが行われる場所。',

    places:[
      {id:'school_gate',name:'校門'},
      {id:'classroom',name:'教室'},
      {id:'hallway',name:'廊下'},
      {id:'teachers_room',name:'職員室'},
      {id:'library',name:'図書室'},
      {id:'music_room',name:'音楽室'},
      {id:'gym',name:'体育館'},
      {id:'schoolyard',name:'校庭'},
      {id:'club_room',name:'部室'},
      {id:'rooftop',name:'屋上'}
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
      {id:'student',name:'生徒',ageGroup:'10代'},
      {id:'classmate',name:'クラスメイト',ageGroup:'10代'},
      {id:'friend',name:'友達',ageGroup:'10代'},
      {id:'upperclassman',name:'先輩',ageGroup:'10代'},
      {id:'underclassman',name:'後輩',ageGroup:'10代'},
      {id:'teacher',name:'先生',ageGroup:'成人'},
      {id:'alt',name:'ALT',ageGroup:'成人'},
      {id:'club_advisor',name:'部活の顧問',ageGroup:'成人'}
    ],

    situations:[
      {id:'introduction',name:'自己紹介',tags:['初対面','転校','新学期']},
      {id:'favorite_subject',name:'好きな教科の話',tags:['教科','好み']},
      {id:'dislike_subject',name:'苦手な教科の話',tags:['教科','悩み']},
      {id:'late_for_school',name:'遅刻した',tags:['遅刻','謝罪']},
      {id:'forgot_something',name:'忘れ物をした',tags:['忘れ物','困りごと']},
      {id:'missed_class',name:'授業を休んだ',tags:['欠席','連絡']},
      {id:'class_problem',name:'授業中に困った',tags:['授業','悩み']},
      {id:'friendship',name:'友達について話す',tags:['友達','人間関係']},
      {id:'argument',name:'友達とけんかした',tags:['友達','謝罪']},
      {id:'club_join',name:'部活に入りたい',tags:['部活動','希望']},
      {id:'club_practice',name:'部活の練習について話す',tags:['部活動','練習']},
      {id:'cannot_do',name:'できないことを相談する',tags:['悩み','練習']},
      {id:'good_job',name:'できるようになったことを伝える',tags:['成長','報告']},
      {id:'school_event',name:'学校行事について話す',tags:['行事','予定']},
      {id:'after_school_plan',name:'放課後の約束をする',tags:['放課後','友達']},
      {id:'thank_teacher',name:'先生に感謝を伝える',tags:['先生','感謝']},
      {id:'ask_teacher',name:'先生にお願いをする',tags:['先生','お願い']},
      {id:'transfer',name:'転校・別れを伝える',tags:['別れ','友達']},
      {id:'encouragement',name:'友達を励ます',tags:['友達','励まし']},
      {id:'apology',name:'学校でのことを謝る',tags:['謝罪','学校生活']}
    ],

    letterPurposes:[
      {id:'to_friend',name:'友達への手紙'},
      {id:'to_teacher',name:'先生への手紙'},
      {id:'to_classmate',name:'クラスメイトへの手紙'},
      {id:'to_family',name:'家族への学校生活の報告'},
      {id:'apology_letter',name:'謝罪の手紙'},
      {id:'thank_you_letter',name:'感謝の手紙'},
      {id:'invitation_letter',name:'誘いの手紙'},
      {id:'encouragement_letter',name:'励ましの手紙'}
    ]
  };

  window.SCENE_SCHOOL=school;
})();
