import { createDefaultPlayer } from './player.js';
import { createDefaultInventory } from './items.js';
import { createDefaultEquipment } from './equipment.js';
import { createDefaultTime } from './time.js';
import { createDefaultWeather } from './weather.js';
import { createDefaultWorldState } from './world.js';

export const SAVE_CONFIG = Object.freeze({
  owner: 'namiyukuta-cmd',
  repo: 'private-game-data',
  branch: 'main',
  saveDir: 'desertsurvival-saves',
  tokenKey: 'desertSurvivalGithubToken',
  activeKey: 'desertSurvivalActiveGame'
});

export function createNewGameState() {
  return {
    game: 'desertsurvival',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    player: createDefaultPlayer(),
    inventory: createDefaultInventory(),
    equipment: createDefaultEquipment(),
    time: createDefaultTime(),
    weather: createDefaultWeather(),
    world: createDefaultWorldState()
  };
}

export function getToken() {
  return localStorage.getItem(SAVE_CONFIG.tokenKey) || '';
}

export function setToken(token) {
  const value = String(token || '').trim();
  if (!value) throw new Error('GitHubトークンを入力してください。');
  localStorage.setItem(SAVE_CONFIG.tokenKey, value);
}

export function clearToken() {
  localStorage.removeItem(SAVE_CONFIG.tokenKey);
}

export function getActiveGame() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_CONFIG.activeKey) || 'null');
  } catch (_) {
    return null;
  }
}

export function setActiveGame(game) {
  if (!game) return;
  game.updatedAt = new Date().toISOString();
  localStorage.setItem(SAVE_CONFIG.activeKey, JSON.stringify(game));
}

function headers() {
  const token = getToken();
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization:`Bearer ${token}` } : {})
  };
}

function apiPath(path = '') {
  const encoded = String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const base = `https://api.github.com/repos/${SAVE_CONFIG.owner}/${SAVE_CONFIG.repo}/contents`;
  return encoded ? `${base}/${encoded}` : base;
}

function decodeBase64Utf8(base64) {
  const binary = atob(String(base64 || '').replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function checkedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  if (response.status === 401) throw new Error('GitHubトークンを確認してください。');
  if (response.status === 403) throw new Error('private-game-data への権限を確認してください。');
  return response;
}

export async function verifyConnection() {
  if (!getToken()) throw new Error('GitHubトークンが未設定です。');
  const response = await checkedFetch(`https://api.github.com/repos/${SAVE_CONFIG.owner}/${SAVE_CONFIG.repo}`);
  if (!response.ok) throw new Error(`GitHub接続に失敗しました (${response.status})。`);
  return true;
}

export async function listRemoteSaves() {
  if (!getToken()) throw new Error('設定からGitHubトークンを登録してください。');
  const response = await checkedFetch(`${apiPath(SAVE_CONFIG.saveDir)}?ref=${encodeURIComponent(SAVE_CONFIG.branch)}`);
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`セーブ一覧を取得できませんでした (${response.status})。`);
  const items = await response.json();
  return (Array.isArray(items) ? items : [])
    .filter(item => item.type === 'file' && item.name.endsWith('.json'))
    .sort((a,b) => a.name.localeCompare(b.name, 'ja'));
}

export async function loadRemoteSave(filename) {
  if (!getToken()) throw new Error('設定からGitHubトークンを登録してください。');
  const path = `${SAVE_CONFIG.saveDir}/${filename}`;
  const response = await checkedFetch(`${apiPath(path)}?ref=${encodeURIComponent(SAVE_CONFIG.branch)}`);
  if (!response.ok) throw new Error(`セーブデータを読み込めませんでした (${response.status})。`);
  const file = await response.json();
  const game = JSON.parse(decodeBase64Utf8(file.content));
  if (game?.game && game.game !== 'desertsurvival') throw new Error('Desert Survival のセーブデータではありません。');
  setActiveGame(game);
  return game;
}

export async function writeRemoteSave(filename, game) {
  if (!getToken()) throw new Error('GitHubトークンが未設定です。');
  const safeName = String(filename || 'save-001.json').replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${SAVE_CONFIG.saveDir}/${safeName.endsWith('.json') ? safeName : `${safeName}.json`}`;
  const lookup = await checkedFetch(`${apiPath(path)}?ref=${encodeURIComponent(SAVE_CONFIG.branch)}`);
  let sha = null;
  if (lookup.ok) sha = (await lookup.json()).sha || null;
  else if (lookup.status !== 404) throw new Error(`既存セーブを確認できませんでした (${lookup.status})。`);

  game.updatedAt = new Date().toISOString();
  const body = {
    message: `Save Desert Survival: ${safeName}`,
    content: encodeBase64Utf8(JSON.stringify(game, null, 2)),
    branch: SAVE_CONFIG.branch,
    ...(sha ? { sha } : {})
  };
  const response = await checkedFetch(apiPath(path), {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`セーブに失敗しました (${response.status})。`);
  setActiveGame(game);
  return true;
}
