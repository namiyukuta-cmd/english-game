import { WORLD } from './world.js';

function prepareCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.floor(rect.width || canvas.width || 300));
  const height = Math.max(1, Math.floor(rect.height || canvas.height || 300));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

export function drawMiniMap(canvas, worldState, points = []) {
  if (!canvas) return;
  const { ctx, width, height } = prepareCanvas(canvas);
  const radius = Math.min(width, height) / 2;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#bda77c';
  ctx.fillRect(0, 0, width, height);

  const range = 700;
  const scale = width / (range * 2);
  for (const point of points) {
    if (!worldState.discoveredMarkpoints?.includes(point.id)) continue;
    const px = width / 2 + (point.x - worldState.x) * scale;
    const py = height / 2 + (point.z - worldState.z) * scale;
    if (px < 0 || py < 0 || px > width || py > height) continue;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = point.type === 'water' ? '#4b7890' : '#4b3b29';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(width / 2, height / 2 - 8);
  ctx.lineTo(width / 2 - 6, height / 2 + 6);
  ctx.lineTo(width / 2 + 6, height / 2 + 6);
  ctx.closePath();
  ctx.fillStyle = '#f5eee1';
  ctx.fill();
  ctx.restore();
}

export function drawWorldMap(canvas, worldState, points = []) {
  if (!canvas) return;
  const { ctx, width, height } = prepareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#c4ad7f';
  ctx.fillRect(0, 0, width, height);

  const pad = 24;
  const mapW = Math.max(1, width - pad * 2);
  const mapH = Math.max(1, height - pad * 2);
  const toX = x => pad + (Number(x || 0) / WORLD.width) * mapW;
  const toY = z => pad + (Number(z || 0) / WORLD.height) * mapH;

  ctx.strokeStyle = 'rgba(70,55,35,.5)';
  ctx.strokeRect(pad, pad, mapW, mapH);

  for (const point of points) {
    if (!worldState.discoveredMarkpoints?.includes(point.id)) continue;
    const x = toX(point.x);
    const y = toY(point.z);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = point.type === 'water' ? '#416f86' : '#4d3926';
    ctx.fill();
    ctx.fillStyle = '#2b2116';
    ctx.font = '12px sans-serif';
    ctx.fillText(point.name || point.id, x + 8, y + 4);
  }

  const px = toX(worldState.x);
  const py = toY(worldState.z);
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff7e8';
  ctx.fill();
  ctx.strokeStyle = '#332719';
  ctx.lineWidth = 2;
  ctx.stroke();
}
