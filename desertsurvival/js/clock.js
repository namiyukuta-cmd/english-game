// 24時間で一周するゲーム内時計。
export function drawClock(canvas, time) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(64, Math.floor(Math.min(rect.width || canvas.width || 96, rect.height || canvas.height || 96)));
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const c = size / 2;
  const r = size * 0.43;
  ctx.lineCap = 'round';

  // 盤面はフィールドが透けるよう薄めにする。
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(26,22,16,.38)';
  ctx.fill();
  ctx.lineWidth = 1.7;
  ctx.strokeStyle = 'rgba(255,255,255,.66)';
  ctx.stroke();

  // 目盛りは盤面より少し強く。
  for (let hour = 0; hour < 24; hour += 3) {
    const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
    const inner = r * (hour % 6 === 0 ? 0.75 : 0.83);
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(angle) * inner, c + Math.sin(angle) * inner);
    ctx.lineTo(c + Math.cos(angle) * r * 0.94, c + Math.sin(angle) * r * 0.94);
    ctx.lineWidth = hour % 6 === 0 ? 2.5 : 1.3;
    ctx.strokeStyle = 'rgba(255,250,238,.84)';
    ctx.stroke();
  }

  // 針ははっきり見えるよう太く・明るく。
  const hourValue = (Number(time?.hour || 0) + Number(time?.minute || 0) / 60) % 24;
  const angle = (hourValue / 24) * Math.PI * 2 - Math.PI / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.72)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.lineTo(c + Math.cos(angle) * r * 0.69, c + Math.sin(angle) * r * 0.69);
  ctx.lineWidth = 5.2;
  ctx.strokeStyle = '#fff6df';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(c, c, 4.3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff6df';
  ctx.fill();
  ctx.restore();
}
