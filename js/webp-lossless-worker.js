import createEncoder from '../vendor/webp/webp_enc.js';
import { defaultOptions } from '../vendor/webp/meta.js';

// @jsquash/webp 1.5.0 / libwebp. Run in a worker to keep the editor responsive.
import '../vendor/webp/pako_inflate.min.js';
import '../vendor/webp/UPNG.js';
let encoder;
self.onmessage = async ({ data }) => {
  try {
    encoder ||= createEncoder({ noInitialRun: true });
    const module = await encoder;
    const png = globalThis.UPNG.decode(data.buffer);
    if (png.tabs.acTL) throw new Error('アニメーションPNGには対応していません。静止画PNGを選んでください。');
    const pixels = new Uint8ClampedArray(globalThis.UPNG.toRGBA8(png)[0]);
    const result = module.encode(pixels, png.width, png.height, {
      ...defaultOptions, lossless: 1, near_lossless: 100,
      exact: 1, quality: 100, method: 4, alpha_quality: 100,
    });
    if (!result) throw new Error('可逆圧縮に失敗しました。');
    const buffer = result.slice().buffer;
    self.postMessage({ id: data.id, buffer }, [buffer]);
  } catch (error) {
    encoder = null;
    self.postMessage({ id: data.id, error: error.message || '可逆圧縮に失敗しました。' });
  }
};
