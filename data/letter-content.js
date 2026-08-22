(()=>{
  // 手紙屋の学習内容。依頼人プロフィールとは独立して抽選する。
  // 1件 = 3つの発言 + その3文から作る手紙。
  const cases=[
    {id:'c_s01_01',grade:1,term:1,step:1,lines:[
      {jp:'私はスポーツが好きです。',words:['I','like','sports'],sentence:'I like sports.'},
      {jp:'私はサッカーをします。',words:['I','play','soccer'],sentence:'I play soccer.'},
      {jp:'私はバスケットボールが好きです。',words:['I','like','basketball'],sentence:'I like basketball.'}
    ],letter:'友達へ。私はスポーツが好きです。サッカーをするのも好きで、バスケットボールも好きです。また一緒に遊びたいです。'},
    {id:'c_s01_02',grade:1,term:1,step:1,lines:[
      {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'},
      {jp:'私はピアノを弾けます。',words:['I','can','play','the','piano'],sentence:'I can play the piano.'},
      {jp:'私は絵を描けます。',words:['I','can','draw'],sentence:'I can draw.'}
    ],letter:'あなたへ。私は音楽が好きです。ピアノを弾くこともできます。それから、絵を描くことも好きです。今度、私の好きなものを見てほしいです。'},
    {id:'c_s01_03',grade:1,term:1,step:1,lines:[
      {jp:'私は数学が好きです。',words:['I','like','math'],sentence:'I like math.'},
      {jp:'私は歴史が好きです。',words:['I','like','history'],sentence:'I like history.'},
      {jp:'私は水泳が好きです。',words:['I','like','swimming'],sentence:'I like swimming.'}
    ],letter:'友達へ。私は数学と歴史が好きです。勉強だけでなく、水泳も好きです。今度、お互いの好きなことをもっと話したいです。'},
    {id:'c_s01_04',grade:1,term:1,step:1,lines:[
      {jp:'私は甘いお菓子が好きです。',words:['I','like','sweets'],sentence:'I like sweets.'},
      {jp:'私はフライドポテトが好きです。',words:['I','like','French fries'],sentence:'I like French fries.'},
      {jp:'私はスパゲッティが好きです。',words:['I','like','spaghetti'],sentence:'I like spaghetti.'}
    ],letter:'家族へ。私は甘いお菓子が好きです。フライドポテトもスパゲッティも好きです。また一緒に食事をしたいです。'},

    {id:'c_s02_01',grade:1,term:1,step:2,lines:[
      {jp:'私は疲れています。',words:["I'm",'tired'],sentence:"I'm tired."},
      {jp:'私は悲しいです。',words:["I'm",'sad'],sentence:"I'm sad."},
      {jp:'私はあなたのことが分かります。',words:['I','understand','you'],sentence:'I understand you.'}
    ],letter:'あなたへ。今の私は少し疲れていて、悲しい気持ちです。それでも、あなたの気持ちは分かっているつもりです。うまく話せないので、手紙にしました。'},
    {id:'c_s02_02',grade:1,term:1,step:2,lines:[
      {jp:'私は幸せです。',words:["I'm",'happy'],sentence:"I'm happy."},
      {jp:'私は元気です。',words:["I'm",'fine'],sentence:"I'm fine."},
      {jp:'ありがとう。',words:['Thank you.'],sentence:'Thank you.'}
    ],letter:'あなたへ。私は元気にしています。今はとても幸せです。いつも気にかけてくれてありがとう。'},

    {id:'c_s03_01',grade:1,term:1,step:3,lines:[
      {jp:'私は夏が好きです。',words:['I','like','summer'],sentence:'I like summer.'},
      {jp:'私は青が好きです。',words:['I','like','blue'],sentence:'I like blue.'},
      {jp:'私は自分の絵が好きです。',words:['I','like','my','picture'],sentence:'I like my picture.'}
    ],letter:'おばあちゃんへ。私は夏が好きです。青い色も好きです。今日は自分で絵を描きました。今度この絵を見てほしいです。'},

    {id:'c_s04_01',grade:1,term:1,step:4,lines:[
      {jp:'私は釣りに行きました。',words:['I','went','fishing'],sentence:'I went fishing.'},
      {jp:'私は疲れていました。',words:['I','was','tired'],sentence:'I was tired.'},
      {jp:'私は友達が好きです。',words:['I','like','my','friend'],sentence:'I like my friend.'}
    ],letter:'友へ。この前は一緒に釣りへ行ってくれてありがとう。私はとても疲れてしまいましたが、一緒に過ごせてうれしかったです。また出かけましょう。'},

    {id:'c_s05_01',grade:1,term:1,step:5,lines:[
      {jp:'私は食べ物がほしいです。',words:['I','want','food'],sentence:'I want food.'},
      {jp:'私は果物がほしいです。',words:['I','want','fruit'],sentence:'I want fruit.'},
      {jp:'私は甘いお菓子がほしいです。',words:['I','want','sweets'],sentence:'I want sweets.'}
    ],letter:'家族へ。食べ物を少し送ってください。できれば果物がほしいです。それから、甘いお菓子も少し入っていたらうれしいです。'},

    {id:'c_s06_01',grade:1,term:1,step:6,lines:[
      {jp:'私は牛乳が好きです。',words:['I','like','milk'],sentence:'I like milk.'},
      {jp:'私は魚が好きです。',words:['I','like','fish'],sentence:'I like fish.'},
      {jp:'私は甘いお菓子が好きです。',words:['I','like','sweets'],sentence:'I like sweets.'}
    ],letter:'お母さんへ。私は牛乳が好きです。魚も好きです。それから甘いお菓子も好きです。今度帰ったら、いっしょに食べたいです。'},

    {id:'c_s07_01',grade:1,term:1,step:7,lines:[
      {jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student."},
      {jp:'私は日本出身です。',words:["I'm",'from','Japan'],sentence:"I'm from Japan."},
      {jp:'私は友達が好きです。',words:['I','like','my','friend'],sentence:'I like my friend.'}
    ],letter:'新しい友達へ。私は日本から来た学生です。まだ慣れないことも多いですが、あなたと友達になれてうれしいです。これからも仲良くしてください。'},
    {id:'c_s07_02',grade:1,term:1,step:7,lines:[
      {jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student."},
      {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'},
      {jp:'私を友達と呼んでください。',words:['Call','me','friend'],sentence:'Call me friend.'}
    ],letter:'あなたへ。私は学生です。音楽が好きです。これからもっと話して、友達になれたらうれしいです。'},

    {id:'c_s08_01',grade:1,term:1,step:8,lines:[
      {jp:'私は冬が好きではありません。',words:['I',"don't",'like','winter'],sentence:"I don't like winter."},
      {jp:'私は疲れています。',words:["I'm",'tired'],sentence:"I'm tired."},
      {jp:'私は幸せではありません。',words:["I'm",'not','happy'],sentence:"I'm not happy."}
    ],letter:'家族へ。私は冬があまり好きではありません。最近は疲れていて、あまり元気でもありません。少しだけ家が恋しいです。'},

    {id:'c_s09_01',grade:1,term:1,step:9,lines:[
      {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'},
      {jp:'私はフルートを演奏できません。',words:['I',"can't",'play','the','flute'],sentence:"I can't play the flute."},
      {jp:'私は悲しいです。',words:["I'm",'sad'],sentence:"I'm sad."}
    ],letter:'先生へ。私は音楽が好きです。でも、まだフルートをうまく演奏できません。それが少し悲しいです。もっと練習したいです。'},

    {id:'c_s10_01',grade:1,term:1,step:10,lines:[
      {jp:'私は学生です。',words:["I'm",'a','student'],sentence:"I'm a student."},
      {jp:'私はアニメに興味があります。',words:["I'm",'interested','in','anime'],sentence:"I'm interested in anime."},
      {jp:'私は学校が好きではありません。',words:['I',"don't",'like','school'],sentence:"I don't like school."}
    ],letter:'先生へ。私は学校の生徒ですが、学校を好きになれずにいます。でも、アニメにはとても興味があります。好きなことをきっかけに楽しく学びたいです。'},

    {id:'c_s11_01',grade:1,term:1,step:11,lines:[
      {jp:'私はまったく練習しません。',words:['I','never','practice'],sentence:'I never practice.'},
      {jp:'私は雑誌を読みます。',words:['I','read','a','magazine'],sentence:'I read a magazine.'},
      {jp:'私はラジオを聞きます。',words:['I','listen','to','the','radio'],sentence:'I listen to the radio.'}
    ],letter:'先生へ。私は練習をさぼって、雑誌を読んだりラジオを聞いたりしています。これからは少しずつ練習します。'},

    {id:'c_s12_01',grade:1,term:1,step:12,lines:[
      {jp:'私は雑誌を読みます。',words:['I','read','a','magazine'],sentence:'I read a magazine.'},
      {jp:'私は鉛筆で書きます。',words:['I','write','with','a','pencil'],sentence:'I write with a pencil.'},
      {jp:'私はもう一度やってみます。',words:['I','try','again'],sentence:'I try again.'}
    ],letter:'友人へ。あなたにもらった雑誌を読んでいます。返事は鉛筆で何度も書き直しました。うまく書けなくても、もう一度やってみます。'},

    {id:'c_s13_01',grade:1,term:1,step:13,lines:[
      {jp:'私は自分のチームが好きです。',words:['I','like','my','team'],sentence:'I like my team.'},
      {jp:'私はバスケットボールをします。',words:['I','play','basketball'],sentence:'I play basketball.'},
      {jp:'私はスポーツを楽しみます。',words:['I','enjoy','sports'],sentence:'I enjoy sports.'}
    ],letter:'チームのみんなへ。私はこのチームが好きです。みんなとバスケットボールをする時間も、スポーツを楽しむ時間も大切です。'},

    {id:'c_s14_01',grade:1,term:1,step:14,lines:[
      {jp:'私はオーストラリア出身です。',words:["I'm",'from','Australia'],sentence:"I'm from Australia."},
      {jp:'私はラグビーが好きです。',words:['I','like','rugby'],sentence:'I like rugby.'},
      {jp:'私は音楽が好きです。',words:['I','like','music'],sentence:'I like music.'}
    ],letter:'新しい友人へ。私はオーストラリアから来ました。ラグビーが好きで、音楽も好きです。こちらでも同じ趣味の友達ができたらうれしいです。'},

    {id:'c_s15_01',grade:1,term:1,step:15,lines:[
      {jp:'私は遅く起きます。',words:['I','get','up','late'],sentence:'I get up late.'},
      {jp:'私は家にいます。',words:['I','stay','home'],sentence:'I stay home.'},
      {jp:'私は犬を散歩させます。',words:['I','walk','my','dog'],sentence:'I walk my dog.'}
    ],letter:'妹へ。最近は朝遅く起きて、家で過ごすことが多いです。それでも毎日、犬の散歩には出ています。落ち着いたら会いに行きたいです。'},

    {id:'c_s16_01',grade:1,term:1,step:16,lines:[
      {jp:'私はコンピュータを使います。',words:['I','use','computer'],sentence:'I use computer.'},
      {jp:'私はアニメが好きです。',words:['I','like','anime'],sentence:'I like anime.'},
      {jp:'私は英語を勉強します。',words:['I','study','English'],sentence:'I study English.'}
    ],letter:'友達へ。私は最近コンピュータをよく使っています。アニメを見るのも好きです。それから英語の勉強も始めました。今度会ったときに話したいです。'}
  ];
  window.LETTER_CONTENT={cases};
})();
