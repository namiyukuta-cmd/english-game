/* Add a one-pixel contour in exterior background; interior pixels stay intact. */
(() => {
  'use strict';
  const rgb = color => color.slice(1).match(/../g).map(v => parseInt(v, 16));
  function edgeBackground(source) {
    const h = source.length, w = source[0].length, groups = new Map();
    let total = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (x !== 0 && y !== 0 && x !== w - 1 && y !== h - 1) continue;
      total++; const color = source[y][x]; if (!color) continue;
      const values = rgb(color), key = values.map(v => v >> 4).join(',');
      if (!groups.has(key)) groups.set(key, {count:0, sum:[0,0,0]});
      const g = groups.get(key); g.count++; values.forEach((v, i) => g.sum[i] += v);
    }
    const dominant = [...groups.values()].sort((a,b) => b.count - a.count)[0];
    return dominant && dominant.count >= Math.max(4, total / 4) ? dominant.sum.map(v => Math.round(v / dominant.count)) : null;
  }
  function add(source, {removeBackground = true} = {}) {
    const h = source.length, w = source[0].length, pixels = source.map(row => row.slice());
    const background = removeBackground ? edgeBackground(source) : null;
    const outside = Array.from({length:h}, () => Array(w).fill(false)), queue = [];
    function visit(x, y) {
      if (x < 0 || x >= w || y < 0 || y >= h || outside[y][x]) return;
      const color = source[y][x];
      if (color && (!background || rgb(color).some((v, i) => Math.abs(v - background[i]) > 12))) return;
      outside[y][x] = true; queue.push([x,y]);
    }
    for (let x = 0; x < w; x++) { visit(x,0); visit(x,h-1); }
    for (let y = 0; y < h; y++) { visit(0,y); visit(w-1,y); }
    while (queue.length) {
      const [x,y] = queue.pop(); visit(x-1,y); visit(x+1,y); visit(x,y-1); visit(x,y+1);
    }
    let removed = 0, occupied = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (outside[y][x] && source[y][x]) { pixels[y][x] = null; removed++; }
      if (pixels[y][x]) occupied++;
    }
    if (!occupied) return {pixels:source.map(row => row.slice()), added:0, removed:0, empty:true};
    const subject = pixels.map(row => row.map(Boolean)); let added = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!outside[y][x]) continue;
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (subject[y+dy]?.[x+dx]) { near = true; break; }
      }
      if (near) { pixels[y][x] = '#111111'; added++; }
    }
    return {pixels, added, removed, empty:false};
  }
  window.PixelOutline = {add};
})();
