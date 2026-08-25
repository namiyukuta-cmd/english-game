window.DD_QUEST_DATA = {
  version: 1,
  boardSize: 5,
  quests: [
    {
      id: 'quest_001',
      title: '薬草箱の配達',
      level: { min: 1, max: 2 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 18 },
      summary: '近くの村へ薬草箱を届ける仕事。',
      description: '届け物をひとつ頼みたい。薬草箱を預かり、ミル村の薬師まで無事に届けてほしい。詳しい受け渡し方法は、村の薬師に聞いてくれ。',
      contact: 'ミル村の薬師',
      stages: [
        {
          id: 'meet_healer',
          objective: 'ミル村へ行き、薬師に話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'village_mill', placeId: 'healer_house', label: '薬師の家' }
            ]
          }
        },
        { id: 'deliver_box', objective: '薬師に薬草箱を渡す。' },
        { id: 'complete', objective: '依頼完了を報告する。' }
      ]
    },
    {
      id: 'quest_002',
      title: '消えた羊を探して',
      level: { min: 1, max: 2 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 22 },
      summary: '牧場からいなくなった羊を探す仕事。',
      description: '西の牧場で羊が三頭いなくなった。盗難か、柵を抜けただけなのかは分からない。まず牧場主のエルマから話を聞いてほしい。',
      contact: '西牧場のエルマ',
      stages: [
        {
          id: 'meet_farmer',
          objective: '西牧場へ行き、エルマから話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'town_current', placeId: 'west_farm', label: '西牧場' }
            ]
          }
        },
        { id: 'search_sheep', objective: '羊の行方を調べる。' },
        { id: 'complete', objective: '羊の件をエルマに報告する。' }
      ]
    },
    {
      id: 'quest_003',
      title: '古井戸の異音',
      level: { min: 1, max: 3 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 30 },
      summary: '村の古井戸から聞こえる音を調べる仕事。',
      description: 'ノース村の古井戸から、夜になると妙な音が聞こえるらしい。危険かどうかも分からない。村長が詳しい事情を知っている。',
      contact: 'ノース村の村長',
      stages: [
        {
          id: 'meet_mayor',
          objective: 'ノース村へ行き、村長から詳しい話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'village_north', placeId: 'mayor_house', label: '村長の家' }
            ]
          }
        },
        { id: 'inspect_well', objective: '古井戸を調べる。' },
        { id: 'complete', objective: '調査結果を村長に報告する。' }
      ]
    },
    {
      id: 'quest_004',
      title: '街道の荷車護衛',
      level: { min: 2, max: 4 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 45 },
      summary: '次の村まで商人の荷車を護衛する仕事。',
      description: '明朝、南門から商人の荷車が出る。最近は街道で獣が増えているため、次の村まで護衛が欲しいそうだ。依頼人は南門で待っている。',
      contact: '南門の商人',
      stages: [
        {
          id: 'meet_merchant',
          objective: '南門へ行き、商人と合流する。',
          effects: {
            unlockPlaces: [
              { locationId: 'town_current', placeId: 'south_gate_merchant', label: '南門の商人' }
            ]
          }
        },
        { id: 'escort', objective: '荷車を護衛して次の村へ向かう。' },
        { id: 'complete', objective: '商人から報酬を受け取る。' }
      ]
    },
    {
      id: 'quest_005',
      title: '森の薬草採取',
      level: { min: 1, max: 3 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 25 },
      summary: '森で指定された薬草を集める仕事。',
      description: '治療用の薬草が不足している。東の森に生える銀葉草を集めてほしい。必要な数と見分け方は、依頼を受けた後に薬師から聞ける。',
      contact: '街の薬師',
      stages: [
        {
          id: 'meet_town_healer',
          objective: '街の薬師に、銀葉草の見分け方を聞く。',
          effects: {
            unlockActions: [
              { placeId: 'apothecary', actionId: 'quest_005_talk', label: '依頼について' }
            ]
          }
        },
        { id: 'gather', objective: '東の森で銀葉草を集める。' },
        { id: 'complete', objective: '銀葉草を薬師に渡す。' }
      ]
    },
    {
      id: 'quest_006',
      title: '洞窟の様子を見てほしい',
      level: { min: 2, max: 4 },
      boards: ['tavern'],
      giver: '酒場の依頼票',
      reward: { gp: 50 },
      summary: '近隣の洞窟に異変がないか確認する仕事。',
      description: '採掘人が使う小さな洞窟で、奥から鳴き声のようなものが聞こえるらしい。討伐が必要かどうかはまだ分からない。まず坑夫頭に話を聞いてくれ。',
      contact: '坑夫頭',
      stages: [
        {
          id: 'meet_foreman',
          objective: '採掘小屋へ行き、坑夫頭から話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'town_current', placeId: 'miners_hut', label: '採掘小屋' }
            ]
          }
        },
        { id: 'inspect_cave', objective: '洞窟を調査する。' },
        { id: 'complete', objective: '調査結果を坑夫頭に報告する。' }
      ]
    },
    {
      id: 'quest_shop_001',
      title: '不足した薬瓶',
      level: { min: 1, max: 3 },
      boards: ['shop_apothecary'],
      giver: '薬屋の店主',
      reward: { gp: 20 },
      summary: '薬屋に必要な空の薬瓶を届ける仕事。',
      description: '仕入れの荷が遅れていて、薬瓶が足りないらしい。店主に詳しく聞けば、どこへ取りに行けばいいか教えてくれる。',
      contact: '薬屋の店主',
      stages: [
        {
          id: 'ask_shopkeeper',
          objective: '薬屋の店主に「依頼について」と聞く。',
          effects: {
            unlockActions: [
              { placeId: 'apothecary', actionId: 'quest_shop_001_talk', label: '依頼について' }
            ]
          }
        },
        { id: 'fetch_bottles', objective: '指定された場所で薬瓶を受け取る。' },
        { id: 'complete', objective: '薬瓶を店主へ届ける。' }
      ]
    }
  ]
};

(() => {
  if (window.__ddWorldMainBootstrap) return;
  window.__ddWorldMainBootstrap = true;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function bootWorldMain() {
    if (!document.getElementById('bookPage') || !window.DDMain) return;
    try {
      if (!window.DD_WORLD_DATA) await loadScript('data/dd-world.js?v=20260825-4');
      if (!window.DDWorldMain) await loadScript('js/dd-world-main.js?v=20260825-1');
    } catch (error) {
      console.error('D&D world navigation load failed', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootWorldMain, {once:true});
  } else {
    bootWorldMain();
  }
})();
