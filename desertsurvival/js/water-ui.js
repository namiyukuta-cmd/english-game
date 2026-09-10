import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { getActiveGame } from './save.js';
import { markpoints, isInsideWaterMarkpoint } from './markpoints.js?v=20260911-waterarea1';

const fieldStage = document.querySelector('.field-stage');
const canvas = document.getElementById('worldCanvas');
const mapOverlay = document.getElementById('mapOverlay');

if (fieldStage && canvas) {
  const style = document.createElement('style');
  style.textContent = `
    .water-source-action{
      position:absolute;
      z-index:27;
      transform:translate(-50%,-50%);
      min-width:62px;
      min-height:38px;
      padding:7px 11px;
      border:2px solid rgba(255,255,255,.9);
      border-radius:18px;
      background:rgba(31,66,74,.86);
      color:#fff;
      font:900 13px/1 -apple-system,BlinkMacSystemFont,"Yu Gothic",sans-serif;
      box-shadow:0 2px 9px rgba(0,0,0,.28);
      white-space:nowrap;
      touch-action:manipulation;
    }
    .water-source-action:disabled{
      opacity:.72;
      color:#e9f4f6;
    }
    .water-source-action[data-near="false"]{
      opacity:.72;
    }
  `;
  document.head.appendChild(style);

  const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 260);
  const anchor = new THREE.Vector3();
  const buttons = new Map();
  let game = getActiveGame();
  let lastGameRefresh = 0;

  function waterAnchor(point) {
    if (point.subtype === 'oasis' && point.waterArea) {
      return {
        x: Number(point.x) + Number(point.waterArea.offsetX || 0),
        y: .35,
        z: Number(point.z) + Number(point.waterArea.offsetZ || 0)
      };
    }
    return { x:Number(point.x), y:.72, z:Number(point.z) };
  }

  function makeButton(point) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'water-source-action';
    button.dataset.markpointId = point.id;
    button.textContent = '💧 飲む';
    button.setAttribute('aria-label', `${point.name || '水場'}の水を飲む`);
    button.addEventListener('pointerdown', event => event.stopPropagation());
    button.addEventListener('click', event => {
      event.stopPropagation();
      game = getActiveGame();
      if (!game) return;
      const inRange = isInsideWaterMarkpoint(point, game.world?.x, game.world?.z);
      const full = Number(game.player?.water ?? 100) >= 100;
      if (!inRange || full) return;
      window.dispatchEvent(new CustomEvent('desert:drink-water', {
        detail:{ markpointId:point.id }
      }));
      setTimeout(() => { game = getActiveGame(); }, 0);
    });
    fieldStage.appendChild(button);
    buttons.set(point.id, button);
  }

  for (const point of markpoints) {
    if (point.type === 'water') makeButton(point);
  }

  function refreshGame(now) {
    if (!game || now - lastGameRefresh >= 180) {
      game = getActiveGame();
      lastGameRefresh = now;
    }
  }

  function frame(now) {
    refreshGame(now);
    const rect = canvas.getBoundingClientRect();
    const stageRect = fieldStage.getBoundingClientRect();
    const overlayOpen = mapOverlay && !mapOverlay.hidden;

    if (!game || rect.width <= 0 || rect.height <= 0 || overlayOpen) {
      for (const button of buttons.values()) button.hidden = true;
      requestAnimationFrame(frame);
      return;
    }

    const wx = Number(game.world?.x || 0);
    const wz = Number(game.world?.z || 0);
    camera.aspect = rect.width / rect.height;
    camera.position.set(wx, 31, wz + 24);
    camera.lookAt(wx, 0, wz - 4.5);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    for (const point of markpoints) {
      if (point.type !== 'water') continue;
      const button = buttons.get(point.id);
      if (!button) continue;

      const p = waterAnchor(point);
      const distance = Math.hypot(p.x - wx, p.z - wz);
      anchor.set(p.x, p.y, p.z).project(camera);
      const onScreen = anchor.z > -1 && anchor.z < 1 && anchor.x > -1.08 && anchor.x < 1.08 && anchor.y > -1.08 && anchor.y < 1.08 && distance < 145;

      button.hidden = !onScreen;
      if (!onScreen) continue;

      const x = rect.left - stageRect.left + (anchor.x + 1) * .5 * rect.width;
      const y = rect.top - stageRect.top + (-anchor.y + 1) * .5 * rect.height;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;

      const inRange = isInsideWaterMarkpoint(point, wx, wz);
      const full = Number(game.player?.water ?? 100) >= 100;
      button.dataset.near = String(inRange);
      button.disabled = !inRange || full;
      button.textContent = full ? '💧 満タン' : '💧 飲む';
      button.setAttribute('aria-label', full
        ? `${point.name || '水場'} 水は満タンです`
        : `${point.name || '水場'}の水を飲む`);
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('desert:player-changed', () => {
    game = getActiveGame();
    lastGameRefresh = 0;
  });
  window.addEventListener('resize', () => { lastGameRefresh = 0; });
  requestAnimationFrame(frame);
}
