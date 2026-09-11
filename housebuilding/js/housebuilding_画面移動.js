// House Building 共通画面移動。
// 仕様:
// - ブラウザ履歴をゲームの移動に使わない。
// - 画面移動で履歴を積まない。すべて location.replace() を使う。
// - history.back / history.forward / pushState / replaceState は使わない。
// - 自動保存はしない。localStorage / sessionStorage / IndexedDB には自動保存しない。
// - 永続化は、今後ユーザーが明示的に SAVE を実行した時だけ別処理で行う。

(() => {
  const replaceTo = url => {
    window.location.replace(url);
  };

  const pathname = decodeURIComponent(window.location.pathname);

  const routes = {
    newGame: './housebuilding_選択.html',
    continueGame: './housebuilding_top.html?mode=continue',
    mode3d: './housebuilding_top.html?mode=new',
    modeFlat: './housebuilding_平面.html?mode=new',
    backBtn: './housebuilding_index.html',
    quickTop: './housebuilding_index.html',
    toShopAreaV3: './フィールド_店エリア_v3.html',
    toShopAreaV2: './フィールド_店エリア_v3.html',
    toRightMap: './フィールド_店エリア_v3.html'
  };

  // 同じ id="back" でも画面ごとに戻り先が違うためここで分ける。
  if (pathname.endsWith('/housebuilding_平面.html')) {
    routes.back = './housebuilding_選択.html';
  } else if (pathname.endsWith('/housebuilding_選択.html')) {
    routes.back = './housebuilding_index.html';
  }

  // capture で既存の location.href クリック処理より先に処理する。
  document.addEventListener('click', event => {
    const button = event.target.closest('button[id]');
    if (button && routes[button.id]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      replaceTo(routes[button.id]);
      return;
    }

    // housebuilding 内の通常リンクも履歴を積ませず移動する。
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    replaceTo(url.href);
  }, true);

  window.HOUSEBUILDING_NAV = {
    go: replaceTo
  };
})();
