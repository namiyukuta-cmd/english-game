/* Pixel transforms leave the source matrix unchanged. */
window.PixelAlign = {
  shift(source, dx, dy) {
    const height = source.length, width = source[0].length;
    return source.map((row, y) => row.map((color, x) => {
      const sx = x - dx, sy = y - dy;
      return sx >= 0 && sx < width && sy >= 0 && sy < height ? source[sy][sx] : null;
    }));
  },
  mirror(source, from) {
    const result = source.map(row => row.slice()), width = source[0].length;
    for (let y = 0; y < source.length; y++) {
      for (let x = 0; x < Math.floor(width / 2); x++) {
        const opposite = width - 1 - x;
        if (from === 'left') result[y][opposite] = source[y][x];
        else result[y][x] = source[y][opposite];
      }
    }
    return result;
  }
};
