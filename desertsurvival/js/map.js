import { WORLD } from './world.js';
import { IBN_BATTUTA_ROUTE, MAP_REGION_LABELS } from './routes.js';

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

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function pointColor(type) {
  if (type === 'water' || type === 'oasis') return '#356f82';
  if (type === 'resource') return '#7f5e2d';
  if (type === 'camp') return '#6f4936';
  return '#3d2d20';
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

  ctx.strokeStyle = 'rgba(74,57,35,.16)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 1) {
    const p = width / 2 + i * width / 4;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(width, p); ctx.stroke();
  }

  for (const point of points) {
    if (!worldState.discoveredMarkpoints?.includes(point.id)) continue;
    const px = width / 2 + (point.x - worldState.x) * scale;
    const py = height / 2 + (point.z - worldState.z) * scale;
    if (px < -8 || py < -8 || px > width + 8 || py > height + 8) continue;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = pointColor(point.type);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(width / 2, height / 2 - 9);
  ctx.lineTo(width / 2 - 6.5, height / 2 + 6.5);
  ctx.lineTo(width / 2 + 6.5, height / 2 + 6.5);
  ctx.closePath();
  ctx.fillStyle = '#fff8e8';
  ctx.fill();
  ctx.strokeStyle = 'rgba(45,34,22,.8)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

function drawBackground(ctx, width, height, pad, mapW, mapH, toX, toY) {
  ctx.fillStyle = '#d6c18f';
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createLinearGradient(0, 0, 0, height);
  vignette.addColorStop(0, 'rgba(255,246,210,.16)');
  vignette.addColorStop(.52, 'rgba(173,132,74,.06)');
  vignette.addColorStop(1, 'rgba(92,70,45,.16)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // サヘル帯
  const sahelTop = toY(9300);
  ctx.fillStyle = 'rgba(104,117,67,.17)';
  ctx.fillRect(pad, sahelTop, mapW, pad + mapH - sahelTop);

  // アトラス山地
  ctx.fillStyle = 'rgba(91,72,49,.38)';
  const mountainY = toY(800);
  const mountainStart = toX(3100);
  const mountainEnd = toX(8800);
  const count = 13;
  for (let i = 0; i < count; i += 1) {
    const x = mountainStart + (mountainEnd - mountainStart) * (i / (count - 1));
    const y = mountainY + Math.sin(i * 1.9) * 4;
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 7);
    ctx.lineTo(x, y - 10 - (i % 3) * 3);
    ctx.lineTo(x + 9, y + 7);
    ctx.closePath();
    ctx.fill();
  }

  // ニジェール川（ゲーム地図上の概略線）
  ctx.save();
  ctx.strokeStyle = 'rgba(55,108,129,.72)';
  ctx.lineWidth = Math.max(2, width * .007);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(toX(3600), toY(9300));
  ctx.bezierCurveTo(toX(4300), toY(8600), toX(5400), toY(7700), toX(6400), toY(7900));
  ctx.bezierCurveTo(toX(7000), toY(8100), toX(7600), toY(8200), toX(8300), toY(7900));
  ctx.stroke();
  ctx.restore();

  // 薄い方眼。距離感は見えるが、地図を邪魔しない。
  ctx.strokeStyle = 'rgba(76,57,34,.09)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    const x = pad + mapW * i / 6;
    const y = pad + mapH * i / 6;
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + mapH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + mapW, y); ctx.stroke();
  }
}

function drawRoute(ctx, toX, toY, width) {
  if (IBN_BATTUTA_ROUTE.length < 2) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(92,47,25,.72)';
  ctx.lineWidth = Math.max(2, width * .006);
  ctx.setLineDash([8, 6]);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  IBN_BATTUTA_ROUTE.forEach((point, index) => {
    const x = toX(point.x);
    const y = toY(point.z);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawRoutePoint(ctx, point, toX, toY, width) {
  if (point.returnPoint) return;
  const x = toX(point.x);
  const y = toY(point.z);
  const r = Math.max(4, width * .012);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = pointColor(point.type);
  ctx.fill();
  ctx.strokeStyle = '#ead9ad';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#2e2217';
  ctx.font = `700 ${Math.max(10, Math.min(14, width * .035))}px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(point.name, x + r + 5, y);

  if (point.note) {
    ctx.fillStyle = 'rgba(66,46,27,.72)';
    ctx.font = `600 ${Math.max(8, Math.min(11, width * .026))}px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif`;
    ctx.fillText(point.note, x + r + 5, y + 13);
  }
}

function drawRegionLabels(ctx, toX, toY, width) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const region of MAP_REGION_LABELS) {
    ctx.fillStyle = region.name === 'サハラ砂漠' ? 'rgba(83,62,36,.21)' : 'rgba(63,54,39,.35)';
    ctx.font = `900 ${region.name === 'サハラ砂漠' ? Math.max(17, width * .055) : Math.max(11, width * .032)}px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif`;
    ctx.fillText(region.name, toX(region.x), toY(region.z));
  }
  ctx.restore();
}

function drawDiscoveredPoints(ctx, points, worldState, toX, toY, width) {
  for (const point of points) {
    if (!worldState.discoveredMarkpoints?.includes(point.id)) continue;
    const x = toX(point.x);
    const y = toY(point.z);
    const r = Math.max(3.5, width * .009);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = pointColor(point.type);
    ctx.fill();
    ctx.strokeStyle = '#fff3cf';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

function drawPlayer(ctx, worldState, toX, toY, width) {
  const px = toX(worldState.x);
  const py = toY(worldState.z);
  const r = Math.max(6, width * .018);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#8b2f24';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px, py, Math.max(2, r * .32), 0, Math.PI * 2);
  ctx.fillStyle = '#8b2f24';
  ctx.fill();
  ctx.restore();
}

function drawLegend(ctx, width, height) {
  const w = Math.min(width - 24, 220);
  const h = 36;
  const x = 12;
  const y = height - h - 10;
  roundedRect(ctx, x, y, w, h, 9);
  ctx.fillStyle = 'rgba(239,220,177,.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,50,28,.28)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#7b3e27';
  ctx.fillRect(x + 10, y + 17, 24, 3);
  ctx.fillStyle = '#392a1e';
  ctx.font = '700 10px -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif';
  ctx.fillText('主要ルート', x + 40, y + 20);

  ctx.beginPath();
  ctx.arc(x + 112, y + 18, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = '#8b2f24';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#392a1e';
  ctx.fillText('現在地', x + 122, y + 20);
}

export function drawWorldMap(canvas, worldState, points = []) {
  if (!canvas) return;
  const { ctx, width, height } = prepareCanvas(canvas);
  ctx.clearRect(0, 0, width, height);

  const pad = Math.max(18, Math.min(30, width * .055));
  const mapW = Math.max(1, width - pad * 2);
  const mapH = Math.max(1, height - pad * 2);
  const toX = x => pad + (Number(x || 0) / WORLD.width) * mapW;
  const toY = z => pad + (Number(z || 0) / WORLD.height) * mapH;

  drawBackground(ctx, width, height, pad, mapW, mapH, toX, toY);

  ctx.strokeStyle = 'rgba(70,50,28,.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, mapW, mapH);

  drawRegionLabels(ctx, toX, toY, width);
  drawRoute(ctx, toX, toY, width);
  for (const point of IBN_BATTUTA_ROUTE) drawRoutePoint(ctx, point, toX, toY, width);
  drawDiscoveredPoints(ctx, points, worldState, toX, toY, width);
  drawPlayer(ctx, worldState, toX, toY, width);
  drawLegend(ctx, width, height);
}
