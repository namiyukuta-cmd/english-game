(()=>{
  // 手紙屋の学習内容。
  // 英文は1文ずつ独立した部品として持ち、人物・事情・3文を毎回来店時に組み合わせる。
  const lines=[
    {id:'s01_sports',grade:1,term:1,step:1,jp:'私はスポーツが好きです。',words:['I','like','sports'],sentence:'I like sports.',tags:['interest','sports']},
    {id:'s01_soccer_like',grade:1,term:1,step:1,jp:'私はサッカーが好きです。',words:['I','like','soccer'],sentence:'I like soccer.',tags:['interest','sports']},
    {id:'s01_soccer_play',grade:1,term:1,step:1,jp:'私はサッカーをします。',words:['I','play','soccer'],sentence:'I play soccer.',tags:['activity','sports']},
    {id:'s01_basket_like',grade:1,term:1,step:1,jp:'私はバスケットボールが好きです。',words:['I','like','basketball'],sentence:'I like basketball.',tags:['interest','sports']},
    {id:'s01_basket_play',grade:1,term:1,step:1,jp:'私はバスケットボールをします。',words:['I','play','basketball'],sentence:'I play basketball.',tags:['activity','sports']},
    {id:'s01_music',grade:1,term:1,step:1,jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.',tags:['interest','music']},
    {id:'s01_piano',grade:1,term:1,step:1,jp:'私はピアノを弾けます。',words:['I','can','play','the','piano'],sentence:'I can play the piano.',tags:['ability','music']},
    {id:'s01_draw',grade:1,term:1,step:1,jp:'私は絵を描けます。',words:['I','can','draw'],sentence:'I can draw.',tags:['ability','art']},
    {id:'s01_math',grade:1,term:1,step:1,jp:'私は数学が好きです。',words:['I','like','math'],sentence:'I like math.',tags:['interest','school']},
    {id:'s01_history',grade:1,term:1,step:1,jp:'私は歴史が好きです。',words:['I','like','history'],sentence:'I like history.',tags:['interest','school']},
    {id:'s01_swimming',grade:1,term:1,step:1,jp:'私は水泳が好きです。',words:['I','like','swimming'],sentence:'I like swimming.',tags:['interest','sports']},
    {id:'s01_sweets',grade:1,term:1,step:1,jp:'私は甘いお菓子が好きです。',words:['I','like','sweets'],sentence:'I like sweets.',tags:['interest','food']},
    {id:'s01_fries',grade:1,term:1,step:1,jp:'私はフライドポテトが好きです。',words:['I','like','French fries'],sentence:'I like French fries.',tags:['interest','food']},
    {id:'s01_spaghetti',grade:1,term:1,step:1,jp:'私はスパゲッティが好きです。',words:['I','like','spaghetti'],sentence:'I like spaghetti.',tags:['interest','food']},

    {id:'s02_happy',grade:1,term:1,step:2,jp:'私は幸せです。',words:["I'm",'happy'],sentence:"I'm happy.",tags:['feeling','positive']},
    {id:'s02_fine',grade:1,term:1,step:2,jp:'私は元気です。',words:["I'm",'fine'],sentence:"I'm fine.",tags:['feeling','positive']},
    {id:'s02_great',grade:1,term:1,step:2,jp:'私はとても元気です。',words:["I'm",'great'],sentence:"I'm great.",tags:['feeling','positive']},
    {id:'s02_tired',grade:1,term:1,step:2,jp:'私は疲れています。',words:["I'm",'tired'],sentence:"I'm tired.",tags:['feeling','negative']},
    {id:'s02_sad',grade:1,term:1,step:2,jp:'私は悲しいです。',words:["I'm",'sad'],sentence:"I'm sad.",tags:['feeling','negative']},
    {id:'s02_hungry',grade:1,term:1,step:2,jp:'私はお腹がすいています。',words:["I'm",'hungry'],sentence:"I'm hungry.",tags:['feeling','food']},
    {id:'s02_sleepy',grade:1,term:1,step:2,jp:'私は眠いです。',words:["I'm",'sleepy'],sentence:"I'm sleepy.",tags:['feeling','negative']},
    {id:'s02_understand',grade:1,term:1,step:2,jp:'私はあなたのことが分かります。',words:['I','understand','you'],sentence:'I understand you.',tags:['social','kind']},
    {id:'s02_thanks',grade:1,term:1,step:2,jp:'ありがとう。',words:['Thank you.'],sentence:'Thank you.',tags:['gratitude','social']},
    {id:'s02_me_too',grade:1,term:1,step:2,jp:'私もです。',words:['Me too.'],sentence:'Me too.',tags:['social','agreement']},
    {id:'s02_i_see',grade:1,term:1,step:2,jp:'分かりました。',words:['I see.'],sentence:'I see.',tags:['social','agreement']},

    {id:'s03_blue',grade:1,term:1,step:3,jp:'私は青が好きです。',words:['I','like','blue'],sentence:'I like blue.',tags:['interest','color']},
    {id:'s03_red',grade:1,term:1,step:3,jp:'私は赤が好きです。',words:['I','like','red'],sentence:'I like red.',tags:['interest','color']},
    {id:'s03_picture',grade:1,term:1,step:3,jp:'私は自分の絵が好きです。',words:['I','like','my','picture'],sentence:'I like my picture.',tags:['interest','art']},

    {id:'s04_fishing',grade:1,term:1,step:4,jp:'私は釣りに行きました。',words:['I','went','fishing'],sentence:'I went fishing.',tags:['past_activity','activity','outdoor']},
    {id:'s04_tired_past',grade:1,term:1,step:4,jp:'私は疲れていました。',words:['I','was','tired'],sentence:'I was tired.',tags:['past_feeling','negative']},
    {id:'s04_friend',grade:1,term:1,step:4,jp:'私は友達が好きです。',words:['I','like','my','friend'],sentence:'I like my friend.',tags:['friendship','social']},
    {id:'s04_hiking',grade:1,term:1,step:4,jp:'私はハイキングが好きです。',words:['I','like','hiking'],sentence:'I like hiking.',tags:['interest','outdoor']},
    {id:'s04_guitar',grade:1,term:1,step:4,jp:'私はギターが好きです。',words:['I','like','guitar'],sentence:'I like guitar.',tags:['interest','music']},

    {id:'s05_food_want',grade:1,term:1,step:5,jp:'私は食べ物がほしいです。',words:['I','want','food'],sentence:'I want food.',tags:['request','food']},
    {id:'s05_fruit_want',grade:1,term:1,step:5,jp:'私は果物がほしいです。',words:['I','want','fruit'],sentence:'I want fruit.',tags:['request','food']},
    {id:'s05_sweets_want',grade:1,term:1,step:5,jp:'私は甘いお菓子がほしいです。',words:['I','want','sweets'],sentence:'I want sweets.',tags:['request','food']},
    {id:'s05_baseball',grade:1,term:1,step:5,jp:'私は野球が好きです。',words:['I','like','baseball'],sentence:'I like baseball.',tags:['interest','sports']},
    {id:'s05_together',grade:1,term:1,step:5,jp:'一緒に遊びましょう。',words:["Let's",'play','together'],sentence:"Let's play together.",tags:['invitation','friendship']},

    {id:'s06_milk',grade:1,term:1,step:6,jp:'私は牛乳が好きです。',words:['I','like','milk'],sentence:'I like milk.',tags:['interest','food']},
    {id:'s06_fish',grade:1,term:1,step:6,jp:'私は魚が好きです。',words:['I','like','fish'],sentence:'I like fish.',tags:['interest','food']},
    {id:'s06_volleyball',grade:1,term:1,step:6,jp:'私はバレーボールが好きです。',words:['I','like','volleyball'],sentence:'I like volleyball.',tags:['interest','sports']},
    {id:'s06_jump',grade:1,term:1,step:6,jp:'私はジャンプできます。',words:['I','can','jump'],sentence:'I can jump.',tags:['ability','sports']},

    {id:'s07_student',grade:1,term:1,step:7,jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student.",tags:['identity','school']},
    {id:'s07_japan',grade:1,term:1,step:7,jp:'私は日本出身です。',words:["I'm",'from','Japan'],sentence:"I'm from Japan.",tags:['origin','identity']},

    {id:'s08_winter',grade:1,term:1,step:8,jp:'私は冬が好きではありません。',words:['I',"don't",'like','winter'],sentence:"I don't like winter.",tags:['dislike','season']},
    {id:'s08_not_happy',grade:1,term:1,step:8,jp:'私は幸せではありません。',words:["I'm",'not','happy'],sentence:"I'm not happy.",tags:['feeling','negative']},

    {id:'s09_flute_no',grade:1,term:1,step:9,jp:'私はフルートを演奏できません。',words:['I',"can't",'play','the','flute'],sentence:"I can't play the flute.",tags:['difficulty','music']},
    {id:'s09_rugby',grade:1,term:1,step:9,jp:'私はラグビーが好きです。',words:['I','like','rugby'],sentence:'I like rugby.',tags:['interest','sports']},

    {id:'s10_anime_interest',grade:1,term:1,step:10,jp:'私はアニメに興味があります。',words:["I'm",'interested','in','anime'],sentence:"I'm interested in anime.",tags:['interest','school']},
    {id:'s10_school_dislike',grade:1,term:1,step:10,jp:'私は学校が好きではありません。',words:['I',"don't",'like','school'],sentence:"I don't like school.",tags:['dislike','school']},

    {id:'s11_never_practice',grade:1,term:1,step:11,jp:'私はまったく練習しません。',words:['I','never','practice'],sentence:'I never practice.',tags:['difficulty','practice']},
    {id:'s11_magazine',grade:1,term:1,step:11,jp:'私は雑誌を読みます。',words:['I','read','a','magazine'],sentence:'I read a magazine.',tags:['activity','hobby']},
    {id:'s11_radio',grade:1,term:1,step:11,jp:'私はラジオを聞きます。',words:['I','listen','to','the','radio'],sentence:'I listen to the radio.',tags:['activity','hobby']},

    {id:'s12_try_again',grade:1,term:1,step:12,jp:'私はもう一度やってみます。',words:['I','try','again'],sentence:'I try again.',tags:['effort','positive']},
    {id:'s13_team',grade:1,term:1,step:13,jp:'私は自分のチームが好きです。',words:['I','like','my','team'],sentence:'I like my team.',tags:['friendship','sports']},
    {id:'s15_late',grade:1,term:1,step:15,jp:'私は遅く起きます。',words:['I','get','up','late'],sentence:'I get up late.',tags:['daily','activity']},
    {id:'s15_home',grade:1,term:1,step:15,jp:'私は家にいます。',words:['I','stay','home'],sentence:'I stay home.',tags:['daily','activity']},
    {id:'s15_dog',grade:1,term:1,step:15,jp:'私は犬を散歩させます。',words:['I','walk','my','dog'],sentence:'I walk my dog.',tags:['daily','activity']}
  ];

  const situations=[
    {
      id:'hobby_friend',minStep:1,label:'友達に、自分の好きなことをもっと知ってほしい',
      recipient:'友達',slots:[['interest'],['interest'],['activity','ability','interest']],
      openings:['友達へ。','あなたへ。'],closings:['今度、あなたの好きなことも教えてください。','また会ったときに、もっと話したいです。']
    },
    {
      id:'good_news',minStep:2,label:'親しい人に、最近の気持ちや好きなことを伝えたい',
      recipient:'親しい人',slots:[['positive'],['interest'],['gratitude','social','interest']],
      openings:['あなたへ。','元気ですか。'],closings:['また話せるのを楽しみにしています。','こちらのことをまた知らせます。']
    },
    {
      id:'rough_day',minStep:2,label:'親しい人に、少し元気がないことを伝えたい',
      recipient:'親しい人',slots:[['negative'],['negative','feeling'],['social','kind','gratitude']],
      openings:['あなたへ。','少し聞いてほしいことがあります。'],closings:['うまく話せないので、手紙にしました。','また元気になったら話したいです。']
    },
    {
      id:'friend_thanks',minStep:2,label:'友達に感謝の気持ちを伝えたい',
      recipient:'友達',slots:[['friendship','social'],['positive','interest'],['gratitude']],
      openings:['友達へ。','大切な友達へ。'],closings:['これからも仲良くしてください。','また一緒に過ごせたらうれしいです。']
    },
    {
      id:'outing_memory',minStep:4,label:'友達に、この前の出来事について書きたい',
      recipient:'友達',slots:[['past_activity'],['past_feeling','feeling'],['friendship','interest']],
      openings:['友達へ。','この前のことを思い出しています。'],closings:['また一緒に出かけましょう。','今度会ったときに、また話しましょう。']
    },
    {
      id:'food_request',minStep:5,label:'家族に、送ってほしいものを頼みたい',
      recipient:'家族',slots:[['request'],['request'],['food']],
      openings:['家族へ。','みんなへ。'],closings:['送ってもらえたらうれしいです。','よろしくお願いします。']
    },
    {
      id:'play_invitation',minStep:5,label:'友達を遊びに誘いたい',
      recipient:'友達',slots:[['sports','interest'],['activity','ability','sports'],['invitation']],
      openings:['友達へ。','今度のことですが。'],closings:['一緒に楽しい時間を過ごしましょう。','返事を待っています。']
    },
    {
      id:'self_intro',minStep:7,label:'新しく知り合った人に自己紹介の手紙を書きたい',
      recipient:'新しい友達',slots:[['identity'],['origin'],['interest']],
      openings:['新しい友達へ。','はじめまして。'],closings:['これから仲良くしてください。','あなたのことももっと知りたいです。']
    },
    {
      id:'school_worry',minStep:8,label:'学校のことで困っている気持ちを伝えたい',
      recipient:'先生',slots:[['school','dislike','difficulty'],['negative','difficulty'],['effort','gratitude','social']],
      openings:['先生へ。','相談したいことがあります。'],closings:['少しずつ頑張りたいです。','これからもよろしくお願いします。']
    },
    {
      id:'club_note',minStep:9,label:'友達に、音楽やスポーツのことを書きたい',
      recipient:'友達',slots:[['music','sports','interest'],['difficulty','ability','activity'],['positive','friendship','effort']],
      openings:['友達へ。','最近のことを書きます。'],closings:['また一緒に練習したいです。','今度会ったら話しましょう。']
    }
  ];

  window.LETTER_CONTENT={lines,situations};
})();
