// 店がある外フィールド。
// 左端をタップすると家マップへ戻る。
// 各店舗への入口は、このマップ上に後から追加する。

document.getElementById('toHouse')?.addEventListener('click', () => {
  location.href = './フィールド_ハウス.html';
});
