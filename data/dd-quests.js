window.DD_QUEST_DATA = {
  version: 2,
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
              { locationId: 'village_mill', placeId: 'healer_house', label: '薬師の家', actionLabel: '薬師に話を聞く' }
            ]
          }
        },
        {
          id: 'deliver_box',
          objective: '薬師に薬草箱を渡す。',
          effects: {
            unlockActions: [
              { locationId: 'village_mill', placeId: 'healer_house', actionId: 'quest_001_deliver', label: '薬草箱を渡す' }
            ]
          }
        },
        {
          id: 'complete',
          objective: 'ブラッケンフォードへ戻り、依頼完了を報告する。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'tavern_report_001', label: '酒場の依頼受付', actionLabel: '配達完了を報告する' }
            ]
          }
        }
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
      description: 'ゴールデンフィールド農場で羊が三頭いなくなった。盗難か、柵を抜けただけなのかは分からない。まず牧場主のエルマから話を聞いてほしい。',
      contact: '牧場主エルマ',
      stages: [
        {
          id: 'meet_farmer',
          objective: 'ゴールデンフィールド農場へ行き、エルマから話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'goldenfield_farm', placeId: 'elma', label: '牧場主エルマ', actionLabel: '羊について聞く' }
            ]
          }
        },
        {
          id: 'search_sheep',
          objective: '農場の牧草地で羊の行方を調べる。',
          effects: {
            unlockPlaces: [
              { locationId: 'goldenfield_farm', placeId: 'sheep_pasture', label: '牧草地を探す', actionLabel: '羊の痕跡を探す' }
            ]
          }
        },
        {
          id: 'complete',
          objective: 'エルマに羊の行方を報告する。',
          effects: {
            unlockPlaces: [
              { locationId: 'goldenfield_farm', placeId: 'elma_report', label: '牧場主エルマ', actionLabel: '調査結果を報告する' }
            ]
          }
        }
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
              { locationId: 'village_north', placeId: 'mayor_house', label: '村長の家', actionLabel: '村長に話を聞く' }
            ]
          }
        },
        {
          id: 'inspect_well',
          objective: 'ノース村の古井戸を調べる。',
          effects: {
            unlockPlaces: [
              { locationId: 'village_north', placeId: 'old_well', label: '古井戸', actionLabel: '井戸を調べる' }
            ]
          }
        },
        {
          id: 'complete',
          objective: '調査結果を村長に報告する。',
          effects: {
            unlockPlaces: [
              { locationId: 'village_north', placeId: 'mayor_report', label: '村長の家', actionLabel: '調査結果を報告する' }
            ]
          }
        }
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
      description: '明朝、ブラッケンフォード南門から商人の荷車が出る。最近は街道で獣が増えているため、ミル村まで護衛が欲しいそうだ。',
      contact: '南門の商人',
      stages: [
        {
          id: 'meet_merchant',
          objective: 'ブラッケンフォードへ行き、南門の商人と合流する。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'south_gate_merchant', label: '南門の商人', actionLabel: '商人と合流する' }
            ]
          }
        },
        {
          id: 'escort',
          objective: '荷車の護衛を開始する。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'escort_departure', label: '荷車の護衛を始める', actionLabel: 'ミル村へ出発する' }
            ]
          }
        },
        {
          id: 'complete',
          objective: 'ミル村へ行き、商人から報酬を受け取る。',
          effects: {
            unlockPlaces: [
              { locationId: 'village_mill', placeId: 'merchant_arrival', label: '護衛した商人', actionLabel: '護衛完了を報告する' }
            ]
          }
        }
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
      description: '治療用の薬草が不足している。グリーンウィスパーの森に生える銀葉草を集めてほしい。必要な数と見分け方は、薬師から聞ける。',
      contact: 'ブラッケンフォードの薬師',
      stages: [
        {
          id: 'meet_town_healer',
          objective: 'ブラッケンフォードの薬屋で、銀葉草の見分け方を聞く。',
          effects: {
            unlockActions: [
              { locationId: 'brackenford', placeId: 'apothecary', actionId: 'quest_005_talk', label: '依頼について' }
            ]
          }
        },
        {
          id: 'gather',
          objective: 'グリーンウィスパーの森で銀葉草を集める。',
          effects: {
            unlockPlaces: [
              { locationId: 'greenwhisper_forest', placeId: 'silverleaf_patch', label: '銀葉草を探す', actionLabel: '銀葉草を採取する' }
            ]
          }
        },
        {
          id: 'complete',
          objective: 'ブラッケンフォードの薬師に銀葉草を渡す。',
          effects: {
            unlockActions: [
              { locationId: 'brackenford', placeId: 'apothecary', actionId: 'quest_005_deliver', label: '銀葉草を渡す' }
            ]
          }
        }
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
      description: 'エコーホールド洞窟で、奥から鳴き声のようなものが聞こえるらしい。討伐が必要かどうかはまだ分からない。まず坑夫頭に話を聞いてくれ。',
      contact: '坑夫頭',
      stages: [
        {
          id: 'meet_foreman',
          objective: 'ブラッケンフォードの採掘小屋へ行き、坑夫頭から話を聞く。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'miners_hut', label: '採掘小屋', actionLabel: '坑夫頭に話を聞く' }
            ]
          }
        },
        {
          id: 'inspect_cave',
          objective: 'エコーホールド洞窟を調査する。',
          effects: {
            unlockPlaces: [
              { locationId: 'echohold_cave', placeId: 'cave_interior', label: '洞窟の奥を調べる', actionLabel: '洞窟を調査する' }
            ]
          }
        },
        {
          id: 'complete',
          objective: 'ブラッケンフォードの坑夫頭に調査結果を報告する。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'miners_hut_report', label: '採掘小屋', actionLabel: '調査結果を報告する' }
            ]
          }
        }
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
              { locationId: 'brackenford', placeId: 'apothecary', actionId: 'quest_shop_001_talk', label: '依頼について' }
            ]
          }
        },
        {
          id: 'fetch_bottles',
          objective: 'ブラッケンフォードの瓶商人から薬瓶を受け取る。',
          effects: {
            unlockPlaces: [
              { locationId: 'brackenford', placeId: 'bottle_warehouse', label: '瓶商人の倉庫', actionLabel: '薬瓶を受け取る' }
            ]
          }
        },
        {
          id: 'complete',
          objective: '薬屋の店主へ薬瓶を届ける。',
          effects: {
            unlockActions: [
              { locationId: 'brackenford', placeId: 'apothecary', actionId: 'quest_shop_001_deliver', label: '薬瓶を渡す' }
            ]
          }
        }
      ]
    }
  ]
};

(() => {
  if (document.getElementById('ddChatUiFont')) return;
  const style = document.createElement('style');
  style.id = 'ddChatUiFont';
  style.textContent = `
    body, button, textarea, input, select {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans JP", sans-serif !important;
    }
    .page-tab {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans JP", sans-serif !important;
    }
  `;
  document.head.appendChild(style);
})();

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