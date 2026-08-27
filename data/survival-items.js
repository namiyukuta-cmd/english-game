// 雪山サバイバルゲーム アイテムデータ
// Googleスプレッドシート「サバイバルゲーム_アイテム管理」を元に管理。
// HTML側では <script src="data/survival-items.js"></script> で読み込む。

(function () {
  'use strict';

  const items = [
    { status:'確定', id:'branch_01', name:'細い枝', category:'自然素材', location:'針葉樹林', use:'火・クラフト', effect:'焚き火や道具作りの材料', consumable:'はい', image:'assets/survival/branch_01.png', note:'ゲーム開始直後から拾える' },
    { status:'確定', id:'stone_01', name:'小石', category:'自然素材', location:'針葉樹林', use:'クラフト', effect:'道具作りなどに使う素材', consumable:'いいえ', image:'assets/survival/stone_01.png', note:'ゲーム開始直後から拾える' },
    { status:'案', id:'firewood_01', name:'薪', category:'自然素材', location:'山小屋・森', use:'燃料', effect:'焚き火を維持する', consumable:'はい', image:null, note:'枝より長時間燃える燃料' },
    { status:'案', id:'canned_food_01', name:'缶詰', category:'食料', location:'山小屋・飛行機の荷物', use:'食べる', effect:'空腹を回復する', consumable:'はい', image:null, note:'序盤の貴重な保存食' },
    { status:'案', id:'emergency_ration_01', name:'非常食', category:'食料', location:'飛行機の残骸・荷物', use:'食べる', effect:'空腹を大きく回復する', consumable:'はい', image:null, note:'事故由来の食料' },
    { status:'案', id:'snack_01', name:'菓子', category:'食料', location:'乗客のバッグ・飛行機の残骸', use:'食べる', effect:'空腹を少し回復する', consumable:'はい', image:null, note:'小さいが見つけやすい食料候補' },
    { status:'案', id:'water_01', name:'飲料水', category:'飲料', location:'飛行機の残骸・荷物', use:'飲む', effect:'水分補給', consumable:'はい', image:null, note:'水分パラメータを追加する場合に使用' },
    { status:'案', id:'cloth_01', name:'布', category:'クラフト素材', location:'山小屋・乗客の荷物', use:'手当・着火・防寒', effect:'包帯代用や着火材などに使える', consumable:'場合による', image:null, note:'男性の初期手当にも使える候補' },
    { status:'案', id:'first_aid_kit_01', name:'救急箱', category:'医療', location:'山小屋・飛行機の残骸', use:'手当', effect:'怪我の処置に使う', consumable:'はい', image:null, note:'山小屋到着直後の探索目標候補' },
    { status:'案', id:'bandage_01', name:'包帯', category:'医療', location:'救急箱・飛行機の救急用品', use:'手当', effect:'負傷の処置に使う', consumable:'はい', image:null, note:'男性の脚の手当に使用可能' },
    { status:'案', id:'matches_01', name:'マッチ', category:'着火', location:'山小屋・荷物', use:'火をつける', effect:'焚き火や暖炉へ着火する', consumable:'はい', image:null, note:'本数制にできる' },
    { status:'案', id:'lighter_01', name:'ライター', category:'着火', location:'乗客の荷物', use:'火をつける', effect:'焚き火や暖炉へ着火する', consumable:'場合による', image:null, note:'燃料残量を持たせることも可能' },
    { status:'案', id:'blanket_01', name:'毛布', category:'防寒・衣類', location:'山小屋・飛行機の残骸', use:'防寒', effect:'体温低下を抑える', consumable:'いいえ', image:null, note:'男性にも主人公にも使用可能' },
    { status:'案', id:'warm_clothes_01', name:'防寒着', category:'防寒・衣類', location:'乗客の荷物', use:'装備', effect:'屋外での体温低下を抑える', consumable:'いいえ', image:null, note:'装備システム追加時に使用' },
    { status:'案', id:'knife_01', name:'ナイフ', category:'道具', location:'山小屋・荷物', use:'切る・加工', effect:'クラフトや食料処理に使う', consumable:'いいえ', image:null, note:'探索・クラフトの解放条件にもできる' },
    { status:'案', id:'pot_01', name:'鍋', category:'道具', location:'山小屋', use:'調理・雪を溶かす', effect:'水や温かい食事を作る', consumable:'いいえ', image:null, note:'男性から使い方を教わる展開に向く' },
    { status:'案', id:'rope_01', name:'ロープ', category:'道具', location:'山小屋・飛行機の荷物', use:'固定・運搬・探索', effect:'探索範囲やクラフトを広げる', consumable:'いいえ', image:null, note:'後半探索用候補' },
    { status:'案', id:'metal_scrap_01', name:'金属片', category:'クラフト素材', location:'飛行機の残骸', use:'クラフト', effect:'道具作りに利用する', consumable:'いいえ', image:null, note:'事故由来の素材' },
    { status:'案', id:'winter_coat_old_01', name:'古い冬用コート', category:'防寒・衣類', location:'山小屋・洋服箪笥', use:'装備', effect:'屋外での体温低下を大きく抑える', consumable:'いいえ', image:null, note:'男物で主人公には大きめ。山小屋に置かれていた予備防寒着' },
    { status:'案', id:'wool_sweater_01', name:'厚手のセーター', category:'防寒・衣類', location:'山小屋・洋服箪笥', use:'装備', effect:'体温低下を抑える補助防寒着', consumable:'いいえ', image:null, note:'古い予備衣類' },
    { status:'案', id:'winter_gloves_01', name:'冬用手袋', category:'防寒・衣類', location:'山小屋・洋服箪笥', use:'装備', effect:'手の冷えを防ぎ屋外探索を補助する', consumable:'いいえ', image:null, note:'予備防寒具' },
    { status:'案', id:'knit_cap_01', name:'ニット帽', category:'防寒・衣類', location:'山小屋・洋服箪笥', use:'装備', effect:'頭部の冷えを抑える', consumable:'いいえ', image:null, note:'予備防寒具' },
    { status:'案', id:'backpack_old_01', name:'古いザック', category:'道具', location:'山小屋・屋根裏', use:'運搬', effect:'一度に持ち運べる物資量を増やす', consumable:'いいえ', image:null, note:'以前の利用者が残した物' },
    { status:'案', id:'compass_01', name:'コンパス', category:'道具', location:'山小屋・棚／屋根裏', use:'探索', effect:'方位確認や地図探索に使う', consumable:'いいえ', image:null, note:'地図と組み合わせて探索に利用' },
    { status:'案', id:'topographic_map_01', name:'周辺地形図', category:'その他', location:'山小屋・壁／棚', use:'探索', effect:'周辺地形や経路の把握に使う', consumable:'いいえ', image:null, note:'古い地図。現在の道の状態とは一致しない可能性あり' },
    { status:'案', id:'lantern_01', name:'ランタン', category:'道具', location:'山小屋・棚', use:'照明', effect:'暗所探索や停電時の明かりに使う', consumable:'場合による', image:null, note:'燃料式または電池式。方式は後で確定' },
    { status:'案', id:'axe_01', name:'斧', category:'道具', location:'山小屋・薪置き場／作業場', use:'薪・加工', effect:'木材や薪の加工に使う', consumable:'いいえ', image:null, note:'薪の確保や障害物処理にも使える候補' },
    { status:'案', id:'tool_kit_01', name:'工具一式', category:'道具', location:'山小屋・地下作業台', use:'修理・クラフト', effect:'設備や道具の修理、加工に使う', consumable:'いいえ', image:null, note:'レンチ、ドライバー、ハンマー等の小型工具' },
    { status:'案', id:'mug_01', name:'マグカップ', category:'道具', location:'山小屋・台所', use:'飲食', effect:'温かい飲み物やスープに使う', consumable:'いいえ', image:null, note:'簡単な生活道具' },
    { status:'案', id:'dried_food_01', name:'乾燥食品', category:'食料', location:'山小屋・食料棚', use:'食べる', effect:'空腹を回復する', consumable:'はい', image:null, note:'量は少なく、二人が長期間暮らせるほどはない' },
    { status:'案', id:'crackers_01', name:'クラッカー', category:'食料', location:'山小屋・食料棚', use:'食べる', effect:'空腹を少し回復する', consumable:'はい', image:null, note:'古い保存食。食べられる状態か確認が必要な候補' },
    { status:'案', id:'water_container_01', name:'水容器', category:'道具', location:'山小屋・地下／台所', use:'水の保管・運搬', effect:'雪解け水などを保存・運搬する', consumable:'いいえ', image:null, note:'給水設備とは別の携帯可能な容器' },
    { status:'案', id:'snow_shovel_01', name:'雪かきスコップ', category:'道具', location:'山小屋・玄関／地下', use:'除雪', effect:'入口や通路の雪を除く', consumable:'いいえ', image:null, note:'吹雪後の行動や小屋周辺整備に使える' },
    { status:'案', id:'cabin_logbook_01', name:'古い利用記録ノート', category:'その他', location:'山小屋・棚／机', use:'情報', effect:'小屋の利用履歴や周辺情報を知る手掛かり', consumable:'いいえ', image:null, note:'所有者や過去の利用者の痕跡。日時や情報は後で設定' },
    { status:'確定', id:'hunting_rifle_01', name:'猟銃', category:'武器・狩猟', location:'山小屋・地下／保管場所', use:'狩猟・防衛', effect:'野生動物への対処や狩猟に使う。使用には専用弾薬が必要', consumable:'いいえ', image:null, note:'私設キャビンの狩猟用装備。種類・口径は舞台地域確定後に調整' },
    { status:'確定', id:'rifle_ammo_01', name:'猟銃用弾薬', category:'武器・狩猟', location:'山小屋・地下／保管箱', use:'狩猟・防衛', effect:'猟銃を使用するたびに消費する有限資源', consumable:'はい', image:null, note:'所持数制。無限ではなく、追加入手も希少にする' },
    { status:'案', id:'spear_01', name:'簡易槍', category:'武器・狩猟', location:'クラフト', use:'狩猟・防衛', effect:'木材などから作る近距離用の簡易武器', consumable:'場合による', image:null, note:'後々グラントから作り方を教わる候補。破損・消耗の可能性あり' },
    { status:'案', id:'bow_01', name:'簡易弓', category:'武器・狩猟', location:'クラフト', use:'狩猟', effect:'弾薬を使わず遠距離から狩猟するための道具', consumable:'いいえ', image:null, note:'後半クラフト候補。作成・使用には知識と材料が必要' },
    { status:'案', id:'arrow_01', name:'矢', category:'武器・狩猟', location:'クラフト', use:'狩猟', effect:'簡易弓に使用する。使用後に回収できる場合もある', consumable:'場合による', image:null, note:'本数制。紛失・破損することがある' },
    { status:'案', id:'snare_trap_01', name:'簡易罠', category:'武器・狩猟', location:'クラフト／山林', use:'食料確保', effect:'小動物などを狙って設置する狩猟用の簡易罠', consumable:'場合による', image:null, note:'後々グラントの知識で解放する候補。大型獣との戦闘用ではなく食料確保向け' }
  ];

  const byId = Object.freeze(
    items.reduce((map, item) => {
      map[item.id] = Object.freeze(item);
      return map;
    }, {})
  );

  window.SURVIVAL_ITEMS = Object.freeze(items.map(item => byId[item.id]));
  window.SURVIVAL_ITEMS_BY_ID = byId;
  window.getSurvivalItem = function (id) {
    return byId[id] || null;
  };
})();
