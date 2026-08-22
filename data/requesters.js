(()=>{
  // 手紙屋の依頼人データ。
  // 1人分 = 年代・性別 + 3つの発言 + 3つの発言から作られる手紙。
  // lines[].words はゲームで並び替える単語、lines[].sentence は完成英文。
  const requesters=[
    {
      id:'g1t1_s01_001',grade:1,term:1,step:1,
      age:'10代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私はスポーツが好きです。',words:['I','like','sports'],sentence:'I like sports.'},
        {jp:'私はサッカーをします。',words:['I','play','soccer'],sentence:'I play soccer.'},
        {jp:'私はバスケットボールが好きです。',words:['I','like','basketball'],sentence:'I like basketball.'}
      ],
      letter:'友達へ。僕はスポーツが好きです。いつもサッカーをしていますが、バスケットボールも好きです。今度、一緒に遊べたらうれしいです。'
    },
    {
      id:'g1t1_s02_001',grade:1,term:1,step:2,
      age:'20代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は疲れています。',words:["I'm",'tired'],sentence:"I'm tired."},
        {jp:'私は悲しいです。',words:["I'm",'sad'],sentence:"I'm sad."},
        {jp:'私はあなたのことが分かります。',words:['I','understand','you'],sentence:'I understand you.'}
      ],
      letter:'あなたへ。今の私は少し疲れていて、悲しい気持ちです。それでも、あなたの気持ちは分かっているつもりです。うまく話せないので、手紙にしました。'
    },
    {
      id:'g1t1_s03_001',grade:1,term:1,step:3,
      age:'10歳未満',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は夏が好きです。',words:['I','like','summer'],sentence:'I like summer.'},
        {jp:'私は青が好きです。',words:['I','like','blue'],sentence:'I like blue.'},
        {jp:'私は自分の絵が好きです。',words:['I','like','my','picture'],sentence:'I like my picture.'}
      ],
      letter:'おばあちゃんへ。私は夏が好きです。青い色も好きです。今日は自分で絵を描きました。私はこの絵が好きなので、おばあちゃんにも見てほしいです。'
    },
    {
      id:'g1t1_s04_001',grade:1,term:1,step:4,
      age:'20代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私は釣りに行きました。',words:['I','went','fishing'],sentence:'I went fishing.'},
        {jp:'私は疲れていました。',words:['I','was','tired'],sentence:'I was tired.'},
        {jp:'私は友達が好きです。',words:['I','like','my','friend'],sentence:'I like my friend.'}
      ],
      letter:'友へ。この前は一緒に釣りへ行ってくれてありがとう。私はとても疲れてしまって、あまり話せませんでした。でも、一緒に過ごせてうれしかったです。また出かけましょう。'
    },
    {
      id:'g1t1_s05_001',grade:1,term:1,step:5,
      age:'10代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私は食べ物がほしいです。',words:['I','want','food'],sentence:'I want food.'},
        {jp:'私は果物がほしいです。',words:['I','want','fruit'],sentence:'I want fruit.'},
        {jp:'私は甘いお菓子がほしいです。',words:['I','want','sweets'],sentence:'I want sweets.'}
      ],
      letter:'家族へ。食べ物を少し送ってください。できれば果物がほしいです。それから、甘いお菓子も少し入っていたらうれしいです。よろしくお願いします。'
    },
    {
      id:'g1t1_s06_001',grade:1,term:1,step:6,
      age:'10歳未満',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私は牛乳が好きです。',words:['I','like','milk'],sentence:'I like milk.'},
        {jp:'私は魚が好きです。',words:['I','like','fish'],sentence:'I like fish.'},
        {jp:'私は甘いお菓子が好きです。',words:['I','like','sweets'],sentence:'I like sweets.'}
      ],
      letter:'お母さんへ。ぼくは牛乳が好きです。魚も好きです。それから甘いお菓子も好きです。今度帰ったら、いっしょに食べたいです。'
    },
    {
      id:'g1t1_s07_001',grade:1,term:1,step:7,
      age:'10代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student."},
        {jp:'私は日本出身です。',words:["I'm",'from','Japan'],sentence:"I'm from Japan."},
        {jp:'私は友達が好きです。',words:['I','like','my','friend'],sentence:'I like my friend.'}
      ],
      letter:'新しい友達へ。私は日本から来た学生です。まだ慣れないことも多いですが、あなたと友達になれてうれしいです。これからも仲良くしてください。'
    },
    {
      id:'g1t1_s08_001',grade:1,term:1,step:8,
      age:'10代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私は冬が好きではありません。',words:['I',"don't",'like','winter'],sentence:"I don't like winter."},
        {jp:'私は疲れています。',words:["I'm",'tired'],sentence:"I'm tired."},
        {jp:'私は幸せではありません。',words:["I'm",'not','happy'],sentence:"I'm not happy."}
      ],
      letter:'家族へ。私は冬があまり好きではありません。最近は疲れていて、あまり元気でもありません。少しだけ家が恋しいです。みんなが元気なら、それだけで安心します。'
    },
    {
      id:'g1t1_s09_001',grade:1,term:1,step:9,
      age:'10代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'},
        {jp:'私はフルートを演奏できません。',words:['I',"can't",'play','the','flute'],sentence:"I can't play the flute."},
        {jp:'私は悲しいです。',words:["I'm",'sad'],sentence:"I'm sad."}
      ],
      letter:'先生へ。私は音楽が好きです。でも、まだフルートをうまく演奏できません。それが少し悲しいです。もっと練習したいので、これからも教えてください。'
    },
    {
      id:'g1t1_s10_001',grade:1,term:1,step:10,
      age:'10代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student."},
        {jp:'私はアニメに興味があります。',words:["I'm",'interested','in','anime'],sentence:"I'm interested in anime."},
        {jp:'私は学校が好きではありません。',words:['I',"don't",'like','school'],sentence:"I don't like school."}
      ],
      letter:'先生へ。私は学校の生徒ですが、学校を好きになれずにいます。でも、アニメにはとても興味があります。好きなことをきっかけに、少しずつ学校でも楽しく学べるようになりたいです。'
    },
    {
      id:'g1t1_s11_001',grade:1,term:1,step:11,
      age:'10代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私はまったく練習しません。',words:['I','never','practice'],sentence:'I never practice.'},
        {jp:'私は雑誌を読みます。',words:['I','read','a','magazine'],sentence:'I read a magazine.'},
        {jp:'私はラジオを聞きます。',words:['I','listen','to','the','radio'],sentence:'I listen to the radio.'}
      ],
      letter:'先生へ。私は練習をさぼって、雑誌を読んだりラジオを聞いたりしています。このままではいけないと思っています。これからは少しずつ練習します。'
    },
    {
      id:'g1t1_s12_001',grade:1,term:1,step:12,
      age:'30代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は雑誌を読みます。',words:['I','read','a','magazine'],sentence:'I read a magazine.'},
        {jp:'私は鉛筆で書きます。',words:['I','write','with','a','pencil'],sentence:'I write with a pencil.'},
        {jp:'私はもう一度やってみます。',words:['I','try','again'],sentence:'I try again.'}
      ],
      letter:'友人へ。あなたにもらった雑誌を読んでいます。返事は鉛筆で何度も書き直しました。うまく書けなくても、もう一度やってみようと思います。'
    },
    {
      id:'g1t1_s13_001',grade:1,term:1,step:13,
      age:'10代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は自分のチームが好きです。',words:['I','like','my','team'],sentence:'I like my team.'},
        {jp:'私はバスケットボールをします。',words:['I','play','basketball'],sentence:'I play basketball.'},
        {jp:'私はスポーツを楽しみます。',words:['I','enjoy','sports'],sentence:'I enjoy sports.'}
      ],
      letter:'チームのみんなへ。私はこのチームが好きです。みんなとバスケットボールをする時間も、スポーツを楽しむ時間も大切です。これからも一緒に頑張りたいです。'
    },
    {
      id:'g1t1_s14_001',grade:1,term:1,step:14,
      age:'20代',gender:'男性',pronoun:'彼',
      lines:[
        {jp:'私はオーストラリア出身です。',words:["I'm",'from','Australia'],sentence:"I'm from Australia."},
        {jp:'私はラグビーが好きです。',words:['I','like','rugby'],sentence:'I like rugby.'},
        {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'}
      ],
      letter:'新しい友人へ。私はオーストラリアから来ました。ラグビーが好きで、音楽も好きです。こちらでも同じ趣味の友達ができたらいいなと思っています。'
    },
    {
      id:'g1t1_s15_001',grade:1,term:1,step:15,
      age:'40代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私は遅く起きます。',words:['I','get','up','late'],sentence:'I get up late.'},
        {jp:'私は家にいます。',words:['I','stay','home'],sentence:'I stay home.'},
        {jp:'私は犬を散歩させます。',words:['I','walk','my','dog'],sentence:'I walk my dog.'}
      ],
      letter:'妹へ。最近は朝遅く起きて、家で過ごすことが多いです。それでも毎日、犬の散歩には出ています。落ち着いたら、あなたにも会いに行きたいです。'
    },
    {
      id:'g1t1_s16_001',grade:1,term:1,step:16,
      age:'20代',gender:'女性',pronoun:'彼女',
      lines:[
        {jp:'私はコンピュータを使います。',words:['I','use','computer'],sentence:'I use computer.'},
        {jp:'私はアニメが好きです。',words:['I','like','anime'],sentence:'I like anime.'},
        {jp:'私は英語を勉強します。',words:['I','study','English'],sentence:'I study English.'}
      ],
      letter:'友達へ。私は最近コンピュータをよく使っています。アニメを見るのも好きです。それから英語の勉強も始めました。今度会ったときに、いろいろ話したいです。'
    }
  ];

  window.LETTER_REQUESTERS={requesters};
})();
