(() => {
  'use strict';

  const CONFIG = Object.freeze({
    owner: 'namiyukuta-cmd',
    repo: 'english-game',
    branch: 'main',
    saveDir: 'dd-saves',
    tokenKey: 'ddGithubToken'
  });

  function getToken() {
    return localStorage.getItem(CONFIG.tokenKey) || '';
  }

  function setToken(token) {
    const value = String(token || '').trim();
    if (!value) throw new Error('GitHubトークンを入力してください。');
    localStorage.setItem(CONFIG.tokenKey, value);
  }

  function clearToken() {
    localStorage.removeItem(CONFIG.tokenKey);
  }

  function apiHeaders() {
    const token = getToken();
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiHeaders(),
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {
      throw new Error('GitHubトークンを確認してください。');
    }
    if (response.status === 403) {
      throw new Error('GitHubへのアクセス権限がありません。トークンのContents権限を確認してください。');
    }
    return response;
  }

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function base64ToUtf8(base64) {
    const binary = atob(String(base64 || '').replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function safeId(value) {
    return String(value || 'character')
      .normalize('NFKC')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'character';
  }

  function saveFilename(game) {
    const id = game?.character?.id || game?.id || `character-${Date.now()}`;
    return `${safeId(id)}.json`;
  }

  function contentsUrl(filename = '') {
    const base = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.saveDir}`;
    return filename ? `${base}/${encodeURIComponent(filename)}` : base;
  }

  async function verifyConnection() {
    if (!getToken()) throw new Error('GitHubトークンが未設定です。');
    const response = await apiFetch(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`);
    if (!response.ok) throw new Error(`GitHub接続に失敗しました (${response.status})。`);
    return true;
  }

  async function listSaves() {
    const response = await apiFetch(`${contentsUrl()}?ref=${encodeURIComponent(CONFIG.branch)}`);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error(`セーブ一覧を取得できませんでした (${response.status})。`);
    const items = await response.json();
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => item.type === 'file' && item.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }

  async function loadSave(filename) {
    const response = await apiFetch(`${contentsUrl(filename)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    if (!response.ok) throw new Error(`セーブデータを読み込めませんでした (${response.status})。`);
    const file = await response.json();
    const jsonText = base64ToUtf8(file.content);
    const game = JSON.parse(jsonText);
    game.__github = { filename: file.name, sha: file.sha };
    return game;
  }

  async function saveGame(game) {
    if (!getToken()) throw new Error('GitHubトークンが未設定です。');
    if (!game || typeof game !== 'object') throw new Error('保存するゲームデータがありません。');

    const filename = game.__github?.filename || saveFilename(game);
    const lookup = await apiFetch(`${contentsUrl(filename)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    let sha = null;
    if (lookup.ok) {
      const current = await lookup.json();
      sha = current.sha;
    } else if (lookup.status !== 404) {
      throw new Error(`既存セーブを確認できませんでした (${lookup.status})。`);
    }

    const payload = JSON.parse(JSON.stringify(game));
    delete payload.__github;
    payload.meta = payload.meta || {};
    payload.meta.updatedAt = new Date().toISOString();
    payload.meta.saveFormat = 1;

    const body = {
      message: `Save DD game: ${payload.character?.name || filename}`,
      content: utf8ToBase64(JSON.stringify(payload, null, 2)),
      branch: CONFIG.branch
    };
    if (sha) body.sha = sha;

    const response = await apiFetch(contentsUrl(filename), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let detail = '';
      try {
        const data = await response.json();
        detail = data.message ? ` ${data.message}` : '';
      } catch (_) {}
      throw new Error(`セーブに失敗しました (${response.status})。${detail}`);
    }
    const result = await response.json();
    game.__github = {
      filename,
      sha: result.content?.sha || null
    };
    game.meta = payload.meta;
    return game;
  }

  window.DDGithub = {
    CONFIG,
    getToken,
    setToken,
    clearToken,
    verifyConnection,
    listSaves,
    loadSave,
    saveGame
  };
})();
