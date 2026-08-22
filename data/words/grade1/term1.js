(()=>{
  // Source order/Japanese meanings: 「1年1学期英単語テスト」.
  // The PDF answer cells are blank, so English forms below are supplied separately for game use.
  const makeSection=(step,section,items)=>items.map((item,index)=>({
    id:`g1t1_s${String(step).padStart(2,'0')}_${String(index+1).padStart(3,'0')}`,
    grade:1,
    term:1,
    step,
    section,
    order:index+1,
    en:item[0],
    ja:item[1],
    kind:item[2]||'word'
  }));

  window.WORD_DATA_META_G1_T1={
    grade:1,
    term:1,
    label:'中学1年・1学期',
    source:'1年1学期英単語テスト',
    sourceJapaneseAndOrder:true,
    englishAnswers:'supplemented-for-game-use'
  };

  window.WORD_DATA_G1_T1=[
    ...makeSection(1,"Let's Be Friends ①",[
      ['history','歴史'],['math','数学'],['music','音楽'],['piano','ピアノ'],['picture','絵'],['sports','スポーツ'],['subject','教科、科目'],['sweets','甘い菓子'],['swimming','水泳、泳ぐこと'],
      ['Chile','チリ','proper'],['Brazil','ブラジル','proper'],['Canada','カナダ','proper'],['Thailand','タイ','proper'],['Germany','ドイツ','proper'],['Korea','韓国','proper'],['the UK','イギリス','proper'],['the USA','アメリカ合衆国','proper'],
      ['French fries','フライドポテト'],['sandwich','サンドイッチ'],['spaghetti','スパゲッティ'],['basketball','バスケットボール'],['soccer','サッカー'],
      ['I','私は'],['my','私の'],['you','あなた(たち)は'],['what','何、何の'],['draw','(絵を)描く'],['be','～である'],['like','～が好きである'],['make','(物を)作る'],['play','(～を)演奏する、弾く'],['can','～できる'],['favorite','お気に入りの'],['Do','[疑問文]～しますか','grammar'],['the','[一部の固有名詞・楽器名につける]','grammar']
    ]),

    ...makeSection(2,"Let's Be Friends ②",[
      ['feeling','気持ち、感情'],['secret','秘けつ、手がかり'],['smile','笑顔、ほほえみ'],['touch','接触、触れ合い'],['response','反応、返答'],['eye','目'],['voice','声'],['everyone','みんな、全ての人'],['me','私を[に]'],
      ['understand','わかる、理解する'],['thank','～に感謝する'],['fine','元気な、健康な'],['well','元気な、健康な'],['great','とても元気な、健康な'],['happy','うれしい、幸せな'],['hungry','空腹の、腹ぺこの'],['sad','悲しい'],['sleepy','眠い'],['tired','疲れた'],['too','～もまた'],['for','～に対する、～への'],
      ['Hi','やあ','phrase'],['What did you say?','何と言いましたか','phrase'],["I'm",'I amの短縮形','grammar'],['how','どんな状態で、どんなふうに'],['communication','意思疎通、コミュニケーション'],['How are you?','お元気ですか。','phrase'],['Me too.','私も。','phrase'],['I see.','わかりました。なるほど。','phrase'],['Thank you.','ありがとう(ございます)。','phrase']
    ]),

    ...makeSection(3,"Let's Be Friends ③",[
      ['date','日、日付'],['first','1日、1番目の'],['second','2日、2番目の'],['third','3日、3番目の'],['fourth','4日、4番目の'],['fifth','5日、5番目の'],['sixth','6日、6番目の'],['seventh','7日、7番目の'],['eighth','8日、8番目の'],['ninth','9日、9番目の'],['tenth','10日、10番目の'],['eleventh','11日、11番目の'],['twelfth','12日、12番目の'],['thirteenth','13日、13番目の'],['fourteenth','14日、14番目の'],['fifteenth','15日、15番目の'],['sixteenth','16日、16番目の'],['seventeenth','17日、17番目の'],['eighteenth','18日、18番目の'],['nineteenth','19日、19番目の'],['twentieth','20日、20番目の'],['thirtieth','30日、30番目の'],
      ['month','(暦の)月'],['January','1月'],['February','2月'],['March','3月'],['April','4月'],['May','5月'],['June','6月'],['July','7月'],['August','8月'],['September','9月'],['October','10月'],['November','11月'],['December','12月'],
      ['birthday','誕生日'],['summer','夏'],['color','色'],['black','黒'],['blue','青'],['brown','茶色'],['green','緑色'],['orange','オレンジ色'],['pink','ピンク色'],['purple','紫色'],['red','赤'],['white','白'],['yellow','黄色'],['peach','モモ'],
      ['we','私たちは'],['our','私たちの'],['your','あなた(たち)の'],['it','それ、そのこと'],['wonderful','すばらしい、すてきな'],['when','いつ'],['during','[期間]～の間に、～で'],["that's",'that isの短縮形','grammar']
    ]),

    ...makeSection(4,"Let's Be Friends ④・⑤",[
      ['hiking','ハイキング'],['day','日、1日'],['English','英語(の)'],['fishing','(魚)釣り'],['fun','楽しさ、おもしろみ'],['friend','友達、友人'],['lake','湖'],['guitar','ギター'],['mountain','山'],['park','公園'],['river','川'],['spring','春'],['vacation','休み、休暇'],['ski','スキー'],['chorus','合唱団、合唱'],['it','それは'],['dance','踊る'],['join','(組織などに)入る'],['run','走る'],['enjoy','～を楽しむ'],['study','(～を)勉強する'],['want','～したい'],['many','たくさんの、多数の'],['fast','速く'],['hard','熱心に、懸命に'],['well','上手に、うまく'],['was','am、isの過去形','grammar'],['went','goの過去形','grammar']
    ]),

    ...makeSection(5,"Let's Be Friends ⑥・⑦",[
      ['start','出発、スタート'],['goal','目的地、ゴール'],['ladder','はしご'],['slide','すべり台'],['activity','活動'],['animal','動物'],['food','食べ物'],['fruit','果物、フルーツ'],['club','クラブ、同好会'],['baseball','野球'],
      ['zero','0','number'],['one','1','number'],['two','2','number'],['three','3','number'],['four','4','number'],['five','5','number'],['six','6','number'],['seven','7','number'],['eight','8','number'],['nine','9','number'],['ten','10','number'],['eleven','11','number'],['twelve','12','number'],['thirteen','13','number'],['fourteen','14','number'],['fifteen','15','number'],['sixteen','16','number'],['seventeen','17','number'],['eighteen','18','number'],['nineteen','19','number'],['twenty','20','number'],['twenty-one','21','number'],['thirty','30','number'],['forty','40','number'],['fifty','50','number'],['sixty','60','number'],['seventy','70','number'],['eighty','80','number'],['ninety','90','number'],['one hundred','100','number'],
      ['together','いっしょに'],['and','～と…、および'],["let's",'let usの短縮形','grammar'],["Let's ...",'～しよう。','phrase']
    ]),

    ...makeSection(6,"Let's Be Friends ⑧",[
      ['apple','リンゴ'],['banana','バナナ'],['egg','たまご'],['milk','牛乳、ミルク'],['box','箱'],['cat','ネコ'],['dog','イヌ'],['fish','魚'],['hat','(縁のある)帽子'],['jump','ジャンプ'],['notebook','ノート'],['pencil','鉛筆'],['watch','腕時計'],['gorilla','ゴリラ'],['tiger','トラ'],['rabbit','ウサギ'],['ink','インク'],['lemon','レモン'],['octopus','タコ'],['yacht','ヨット'],['king','王、国王'],['queen','女王'],['volleyball','バレーボール'],['zoo','動物園'],['up','上へ、上がって']
    ]),

    ...makeSection(7,'Unit1-1',[
      ['lost','道に迷った'],['a','ある、1つ[人など]の','grammar'],['student','生徒、学生'],['there','そこに、そこで'],['thanks','ありがとう','phrase'],['and','～して'],['meet','会う、知り合う'],['call','～を(…)と呼ぶ'],['be','～である'],['Thank you.','ありがとう。','phrase'],['Call me ...','私を～と呼んでください。','phrase'],['Ms.','[女性]～さん、～先生','title'],['Japan','日本','proper'],['South Africa','南アフリカ','proper'],['from','～出身、～から'],["I'm from ...",'私は～出身です。','phrase']
    ]),

    ...makeSection(8,'Unit1-2',[
      ['see','見る'],['beautiful','美しい'],['why','なぜ、どうして'],["don't",'[否定文を作る]～しない','grammar'],['not','(～)でない、～(し)ない','grammar'],['Achoo!','ハクション','phrase'],['very','とても、あまり'],['really','非常に、とても'],['winter','冬'],['How about ...?','～はどうですか。','phrase'],['not so ...','そんなに～ない','phrase']
    ]),

    ...makeSection(9,'Unit1-3',[
      ['class','授業、授業時間'],['New York','ニューヨーク','proper'],['swim','泳ぐ、水泳をする'],['drums','ドラム、太鼓'],['but','しかし、けれども'],['cool','かっこいい、すごい'],["can't",'canの否定形','grammar'],['flute','フルート'],['saxophone','サックス、サクソフォン'],['assistant','補助の'],['teacher','先生'],['ALT','英語指導助手','title'],['Cape Town','ケープタウン','proper'],['musical','ミュージカル'],['anime','アニメ'],['rugby','ラグビー']
    ]),

    ...makeSection(10,'Unit2-1',[
      ['school','学校'],['after','～の後に'],['in','中へ、中に'],['brass band','吹奏楽部'],['new','新しい、新入りの'],['yes','はい、そうです'],['come','来る'],['Mr.','[男性]～さん、～先生','title'],['enter','入る、入ってくる'],['no','いいえ、いや'],['interested','興味をもっている'],['in','[範囲・分野]～において、～に関して'],['K-pop','韓国のポピュラー音楽','proper'],['the','[限定]～の','grammar'],['big','熱烈な、熱狂的な'],['fan','ファン'],['anime','アニメ'],['be interested in','～に興味をもっている','phrase'],['very','とても']
    ]),

    ...makeSection(11,'Unit2-2',[
      ['an','ある、1つ[人など]の','grammar'],['instrument','楽器'],['a little','少しは、多少','phrase'],['usually','普通は、いつもは'],['practice','練習する'],['on','[日・時]～に'],['Monday','月曜日'],['Wednesday','水曜日'],['Friday','金曜日'],['listen','聞く、耳を傾ける'],['to','[対象]～に、～へ'],['radio','ラジオ'],['read','読む'],['magazine','雑誌'],['always','いつも、常に'],['it','それを'],['often','よく、しばしば'],['sometimes','ときどき'],['never','決して～しない'],['free','手が空いている、暇な'],['night','夜'],['listen to','～を聞く','phrase']
    ]),

    ...makeSection(12,'Unit2-3',[
      ['play','演劇'],['well','ああ、まあ','phrase'],['tongue twister','早口言葉'],['say','言う、述べる'],['repeat','繰り返して言う'],['after','～の次に、～の後について'],['write','書く'],['by','[手段]～で、～を使って'],['ride','～に乗る'],['unicycle','一輪車'],['curry','カレー'],['rice','米、ご飯'],['curry and rice','カレーライス','phrase'],['with','～といっしょに'],['father','父親'],['wonderful','すばらしい'],['almost','ほとんど、もう少しで'],['try','試しにやってみる'],['again','もう一度'],['turn','順番'],['Oops!','あっ、しまった。','phrase'],['Good job!','やりましたね。','phrase'],['Good!','いいぞ。','phrase']
    ]),

    ...makeSection(13,'Unit2-Goal',[
      ['team','チーム']
    ]),

    ...makeSection(14,'World Tour ①',[
      ['break','休み時間'],['Australia','オーストラリア','proper']
    ]),

    ...makeSection(15,'Unit3-1',[
      ['during','～の間ずっと'],['family','家族'],['only','ただ～だけ'],['boring','退屈な'],['also','～もまた、さらに'],['every','毎～'],['year','1年、年間'],['sound','～に思われる、～に聞こえる'],['every year','毎年','phrase'],['get','～(の状態)になる'],['late','(定刻より)遅く'],['take','～を受ける、～を行う'],['lesson','授業、レッスン'],['walk','～を散歩させる'],['video','動画、ビデオ'],['weekend','週末'],['practice','練習'],['stay','とどまる、いる'],['home','家に[へ]'],['grandfather','祖父'],['get up','起きる、起床する','phrase']
    ]),

    ...makeSection(16,'Unit3-2',[
      ['at','[地点・場所]～に、～で'],['that','それ、あれ'],['Ta-da!','タダーン、ジャジャーン','phrase'],['dance','踊り'],['really','本当に'],['direction','進路、方向'],['of course','もちろん','phrase'],['use','～を使う'],['computer','コンピュータ']
    ])
  ];
})();
